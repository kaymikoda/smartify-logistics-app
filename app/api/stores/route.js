// app/api/stores/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  const stores = await prisma.store.findMany();
  return new Response(JSON.stringify(stores), {
    headers: { 'Content-Type': 'application/json' },
  });
}
