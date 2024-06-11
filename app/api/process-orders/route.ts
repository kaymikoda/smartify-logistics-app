import { NextRequest, NextResponse } from 'next/server';
import ShopifyDataProcessor from '@/lib/shopifyProcessor';

export async function GET(req: NextRequest) {
  const processor = new ShopifyDataProcessor();
  const dateRange = req.nextUrl.searchParams.get('dateRange') || 'month'; // Standardwert 'month', wenn dateRange nicht gesetzt ist
  await processor.processOrders(dateRange);
  const results = processor.aggregateResults();
  
  return NextResponse.json(results);
}
