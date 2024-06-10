import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  const stores = await prisma.store.findMany();
  return new Response(JSON.stringify(stores), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request) {
  const { store_name, api_key, password, rule_type, rule_value, average_spend_per_order, firstOrder } = await request.json();
  const store = await prisma.store.create({
    data: { store_name, api_key, password, rule_type, rule_value, average_spend_per_order, firstOrder },
  });
  return new Response(JSON.stringify(store), {
    headers: { 'Content-Type': 'application/json' },
  });
}
