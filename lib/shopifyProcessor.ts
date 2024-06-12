import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, subWeeks } from 'date-fns';

const prisma = new PrismaClient();

type OrderCounts = {
  orders_count: number;
  items_count: number;
  transaction_provision: number;
  fulfillment_provision: number;
};

type StoreData = {
  store_name: string;
  api_key: string;
  password: string;
  rule_type: string;
  rule_value: string;
  average_spend_per_order: number;
  firstOrder: number;
};

type Order = {
  created_at: string;
  order_number: string;
  line_items: Array<{
    title: string;
    quantity: number;
  }>;
};

class ShopifyDataProcessor {
  allOrders: any[];
  ordersPerDay: { [key: string]: { [store: string]: OrderCounts } };

  constructor() {
    console.log("ShopifyDataProcessor constructor called");
    this.allOrders = [];
    this.ordersPerDay = {};
  }

  async fetchOrders(api_key: string, password: string, store_name: string, startDate: string, endDate: string, firstOrder: number): Promise<Order[]> {
    console.log(`Fetching orders for store: ${store_name}`);
    let orders: Order[] = [];
    const baseUrl = `https://${store_name}.myshopify.com/admin/api/2021-04/orders.json`;
    let params: {
      status?: string;
      created_at_min?: string;
      created_at_max?: string;
      limit: number;
      page_info?: string;
    } = {
      status: 'any',
      created_at_min: startDate,
      created_at_max: endDate,
      limit: 200,
    };

    while (true) {
      try {
        const response = await axios.get(baseUrl, {
          params,
          auth: {
            username: api_key,
            password,
          },
        });

        console.log(`Response status: ${response.status}`);
        if (response.status !== 200) {
          console.error(`Error: Received status code ${response.status}`);
          break;
        }

        const data: Order[] = response.data.orders;
        if (!data.length) break;

        // Abbrechen, wenn die Bestellung mit der Nummer `firstOrder` gefunden wurde
        const orderFound = data.find(order => order.order_number.toString() === firstOrder.toString());
        if (orderFound) {
          orders.push(orderFound);
          break;
        }

        orders = orders.concat(data);
        const lastOrderDate = data[data.length - 1].created_at;
        console.log(data[data.length - 1].order_number);
        console.log(firstOrder.toString());

        if (new Date(lastOrderDate) < new Date(startDate)) break;

        // Set next page parameters
        const linkHeader = response.headers.link;
        if (linkHeader && linkHeader.includes('rel="next"')) {
          const nextLink = linkHeader.split(',').find((link: string) => link.includes('rel="next"'));
          if (nextLink) {
            const nextUrl = nextLink.split(';')[0].replace('<', '').replace('>', '').trim();
            const nextParams = new URLSearchParams(nextUrl.split('?')[1]);
            params = {
              limit: 250,
              page_info: nextParams.get('page_info') || undefined,
            };
          } else {
            break;
          }
        } else {
          break;
        }

      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(`Axios error: ${error.response?.status} ${error.response?.statusText}`);
          console.error('Error details:', error.response?.data);
        } else {
          console.error('Unexpected error:', error);
        }
        break;
      }
    }

    console.log(`Fetched ${orders.length} orders for store: ${store_name}`);
    return orders;
  }

  calculateProvision(rule_type: string, rule_value: string, order: Order): number {
    if (rule_type === 'per_item_title') {
      let provision = 0;
      const keyword = rule_value;
      for (const item of order.line_items) {
        if (item.title.includes(keyword)) {
          provision += item.quantity;
        }
      }
      return provision;
    } else if (rule_type === 'quantity_based') {
      let provision = 0;
      const quantity = order.line_items.reduce((total, item) => total + item.quantity, 0);
      const tiers = Object.fromEntries(rule_value.split(',').map((x) => x.split(':').map((v) => v.trim())));
      provision = parseFloat(tiers[quantity] || '1');
      return provision;
    } else {
      return 1;
    }
  }

  async processOrders(dateRange: string) {
    console.log(`Processing orders for date range: ${dateRange}`);
    const stores = await prisma.store.findMany();
    const today = new Date();
    let startDate: Date;
    let endDate = new Date();

    switch (dateRange) {
      case 'today':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'yesterday':
        startDate = subDays(new Date(), 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'thisMonth':
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
        break;
      case 'thisWeek':
        startDate = startOfWeek(today, { weekStartsOn: 1 });
        break;
      case 'last3Weeks':
        startDate = subWeeks(startOfWeek(today, { weekStartsOn: 1 }), 3);
        break;
      default:
        startDate = startOfMonth(today);
    }

    for (const store of stores) {
      const { store_name, api_key, password, rule_type, rule_value, average_spend_per_order, firstOrder } = store;
      console.log(`Processing store: ${store_name}`);
      const orders = await this.fetchOrders(api_key, password, store_name, startDate.toISOString(), endDate.toISOString(), firstOrder);
      if (orders.length > 0) {
        this.allOrders.push(...orders.map(order => ({
          store_name,
          created_at: order.created_at,
          order_number: order.order_number,
          line_items: order.line_items,
          rule_type,
          rule_value,
          average_spend_per_order,
        })));
      }
    }

    this.processOrdersData();
  }

  processOrdersData() {
    for (const order of this.allOrders) {
      const date = format(new Date(order.created_at), 'yyyy-MM-dd');
      const store_name = order.store_name;

      if (!this.ordersPerDay[date]) {
        this.ordersPerDay[date] = {};
      }

      if (!this.ordersPerDay[date][store_name]) {
        this.ordersPerDay[date][store_name] = {
          orders_count: 0,
          items_count: 0,
          transaction_provision: 0,
          fulfillment_provision: 0,
        };
      }

      const provision = this.calculateProvision(order.rule_type, order.rule_value, order);
      this.ordersPerDay[date][store_name].orders_count += 1;
      this.ordersPerDay[date][store_name].items_count += provision;

      const avg_spend = order.average_spend_per_order;
      const transaction_provision = avg_spend - (avg_spend * 7.7) / 7.8;
      this.ordersPerDay[date][store_name].transaction_provision += transaction_provision;
    }
  }

  aggregateResults() {
    const data = {
      Date: [] as string[],
      'Store Name': [] as string[],
      'Total Orders': [] as number[],
      'Total Items': [] as number[],
      'Fulfillment Provision (€)': [] as number[],
      'Transaction Provision (€)': [] as number[],
      'Total Provision (€)': [] as number[],
    };

    const sortedDates = Object.keys(this.ordersPerDay).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    for (const date of sortedDates) {
      const stores = this.ordersPerDay[date];
      let totalOrders = 0;
      let totalItems = 0;
      let totalFulfillmentProvision = 0;
      let totalTransactionProvision = 0;

      for (const [store, counts] of Object.entries(stores)) {
        totalOrders += counts.orders_count;
        totalItems += counts.items_count;
        totalFulfillmentProvision += parseFloat(counts.items_count.toFixed(2));
        totalTransactionProvision += parseFloat(counts.transaction_provision.toFixed(2));
      }

      data.Date.push(date);
      data['Store Name'].push(...Object.keys(stores));
      data['Total Orders'].push(totalOrders);
      data['Total Items'].push(totalItems);
      data['Fulfillment Provision (€)'].push(totalFulfillmentProvision);
      data['Transaction Provision (€)'].push(totalTransactionProvision);
      data['Total Provision (€)'].push(totalFulfillmentProvision + totalTransactionProvision);
    }

    console.log('Aggregated Results:', data);
    return data;
  }
}

export default ShopifyDataProcessor;
