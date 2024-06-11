// app/api/stores/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const stores = await prisma.store.findMany();
  return NextResponse.json(stores);
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ message: 'Method POST is not allowed' }, { status: 405 });
}
