// app/api/stores/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import ShopifyDataProcessor from '@/lib/shopifyProcessor';

const prisma = new PrismaClient();
type AggregateResults = {
    Date: string[];
    'Store Name': string[];
    'Total Orders': number[];
    'Total Items': number[];
    'Fulfillment Provision (€)': number[];
    'Transaction Provision (€)': number[];
    'Total Provision (€)': number[];
};

type StoreResult = {
    'Store Name': string;
    'Fulfillment Provision (€)': number;
    'Transaction Provision (€)': number;
    'Total Provision (€)': number;
};

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const dateRange = searchParams.get('dateRange') || 'thisMonth';

    const processor = new ShopifyDataProcessor();
    await processor.processOrders(dateRange);
    const results: AggregateResults = processor.aggregateResults();

    const stores = await prisma.store.findMany();

    const storeData = stores.map((store) => {
        const storeResults: StoreResult[] = results['Store Name']
            .map((storeName, index) => ({
                'Store Name': storeName,
                'Fulfillment Provision (€)': results['Fulfillment Provision (€)'][index],
                'Transaction Provision (€)': results['Transaction Provision (€)'][index],
                'Total Provision (€)': results['Total Provision (€)'][index],
            }))
            .filter((result) => result['Store Name'] === store.store_name);

        const fulfillmentProvision = storeResults.reduce((sum, result) => sum + result['Fulfillment Provision (€)'], 0);
        const transactionProvision = storeResults.reduce((sum, result) => sum + result['Transaction Provision (€)'], 0);
        const totalProvision = fulfillmentProvision + transactionProvision;

        return {
            id: store.id,
            storeName: store.store_name,
            fulfillmentProvision: fulfillmentProvision.toFixed(2),
            transactionProvision: transactionProvision.toFixed(2),
            totalProvision: totalProvision.toFixed(2),
        };
    });

    return NextResponse.json(storeData);
}
