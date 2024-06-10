import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

export async function GET(request) {
  const stores = await prisma.store.findMany();
  const allOrders = [];

  for (const store of stores) {
    const { store_name, api_key, password, firstOrder } = store;
    const orders = await fetchOrders(api_key, password, store_name, firstOrder);
    allOrders.push(...orders);
  }

  return new Response(JSON.stringify(allOrders), {
    headers: { 'Content-Type': 'application/json' },
  });
}

async function fetchOrders(apiKey, password, storeName, firstOrder) {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
  const endOfMonth = today.toISOString();

  const baseUrl = `https://${storeName}.myshopify.com/admin/api/2021-04/orders.json`;
  const params = new URLSearchParams({
    status: 'any',
    created_at_min: startOfMonth,
    created_at_max: endOfMonth,
    limit: '250',
  });

  let orders = [];
  let hasNextPage = true;
  let nextPageUrl = `${baseUrl}?${params.toString()}`;

  while (hasNextPage) {
    const response = await fetch(nextPageUrl, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${apiKey}:${password}`).toString('base64')}`
      }
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    if (data.orders.length === 0) break;

    orders = orders.concat(data.orders.filter(order => parseInt(order.id) >= firstOrder));
    hasNextPage = data.orders.length === 250;

    if (hasNextPage && response.headers.get('Link')) {
      const nextLink = response.headers.get('Link').match(/<([^>]+)>;\s*rel="next"/);
      if (nextLink) {
        nextPageUrl = nextLink[1];
      } else {
        hasNextPage = false;
      }
    } else {
      hasNextPage = false;
    }
  }

  return orders;
}
