import { openDb } from '../../../database';

export async function GET(request) {
  const db = await openDb();
  const stores = await db.all('SELECT * FROM stores');
  return new Response(JSON.stringify(stores), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request) {
  const { store_name, api_key, password, rule_type, rule_value, average_spend_per_order } = await request.json();
  const db = await openDb();
  await db.run(
    'INSERT INTO stores (store_name, api_key, password, rule_type, rule_value, average_spend_per_order) VALUES (?, ?, ?, ?, ?, ?)',
    store_name, api_key, password, rule_type, rule_value, average_spend_per_order
  );
  return new Response(JSON.stringify({ message: 'Store added successfully' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
