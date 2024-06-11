import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, subWeeks } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import '@fontsource/poppins'; // Import der Schriftart

const prisma = new PrismaClient();
const BANGKOK_TIMEZONE = 'Asia/Bangkok';

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
  line_items: Array<{
    title: string;
    quantity: number;
  }>;
};

class ShopifyDataProcessor {
  allOrders: any[];
  ordersPerDay: { [key: string]: { [store: string]: OrderCounts } };

  constructor() {
    this.allOrders = [];
    this.ordersPerDay = {};
  }

  async fetchOrders(api_key: string, password: string, store_name: string, startDate: string, endDate: string): Promise<Order[]> {
    let orders: Order[] = [];
    const baseUrl = `https://${store_name}.myshopify.com/admin/api/2021-04/orders.json`;
    let params: {
      status: string;
      created_at_min: string;
      created_at_max: string;
      limit: number;
    } = {
      status: 'any',
      created_at_min: startDate,
      created_at_max: endDate,
      limit: 250,
    };

    while (true) {
      const response = await axios.get(baseUrl, {
        params,
        auth: {
          username: api_key,
          password,
        },
      });

      const data = response.data.orders;
      if (!data.length) break;

      orders = orders.concat(data);
      const lastOrderDate = data[data.length - 1].created_at;

      if (new Date(lastOrderDate) < new Date(startDate)) break;

      if (response.headers.link && response.headers.link.includes('rel="next"')) {
        const nextLink = response.headers.link.split(',').find((link: string) => link.includes('rel="next"'));
        if (nextLink) {
          const nextUrl = nextLink.split(';')[0].replace('<', '').replace('>', '').trim();
          const newParams = new URLSearchParams(nextUrl.split('?')[1]);
          params = {
            status: newParams.get('status') || 'any',
            created_at_min: newParams.get('created_at_min') || startDate,
            created_at_max: newParams.get('created_at_max') || endDate,
            limit: parseInt(newParams.get('limit') || '250'),
          };
        } else {
          break;
        }
      } else {
        break;
      }
    }

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
    const stores = await prisma.store.findMany();
    const today = new Date();
    let startDate: Date;
    let endDate = new Date();

    switch (dateRange) {
      case 'today':
        startDate = toZonedTime(new Date(), BANGKOK_TIMEZONE);
        startDate.setHours(0, 0, 0, 0);
        endDate = toZonedTime(new Date(), BANGKOK_TIMEZONE);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'yesterday':
        startDate = subDays(toZonedTime(new Date(), BANGKOK_TIMEZONE), 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'thisMonth':
        startDate = startOfMonth(toZonedTime(today, BANGKOK_TIMEZONE));
        endDate = endOfMonth(toZonedTime(today, BANGKOK_TIMEZONE));
        break;
      case 'thisWeek':
        startDate = startOfWeek(toZonedTime(today, BANGKOK_TIMEZONE), { weekStartsOn: 1 });
        break;
      case 'last3Weeks':
        startDate = subWeeks(startOfWeek(toZonedTime(today, BANGKOK_TIMEZONE), { weekStartsOn: 1 }), 3);
        break;
      default:
        startDate = startOfMonth(toZonedTime(today, BANGKOK_TIMEZONE));
    }

    for (const store of stores) {
      const { store_name, api_key, password, rule_type, rule_value, average_spend_per_order } = store;

      const orders = await this.fetchOrders(api_key, password, store_name, startDate.toISOString(), endDate.toISOString());
      for (const order of orders) {
        this.allOrders.push({
          store_name,
          created_at: order.created_at,
          line_items: order.line_items,
          rule_type,
          rule_value,
          average_spend_per_order,
        });
      }
    }

    for (const order of this.allOrders) {
      const orderDateInBangkok = toZonedTime(new Date(order.created_at), BANGKOK_TIMEZONE);
      const date = formatInTimeZone(orderDateInBangkok, BANGKOK_TIMEZONE, 'yyyy-MM-dd');
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
      for (const [store, counts] of Object.entries(stores)) {
        data.Date.push(date);
        data['Store Name'].push(store);
        data['Total Orders'].push(counts.orders_count);
        data['Total Items'].push(counts.items_count);
        data['Fulfillment Provision (€)'].push(parseFloat(counts.items_count.toFixed(2)));
        data['Transaction Provision (€)'].push(parseFloat(counts.transaction_provision.toFixed(2)));
        data['Total Provision (€)'].push(parseFloat((counts.items_count + counts.transaction_provision).toFixed(2)));
      }
    }

    return data;
  }
}

export default ShopifyDataProcessor;
