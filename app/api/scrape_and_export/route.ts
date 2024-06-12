import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';
import axios from 'axios';

const prisma = new PrismaClient();

const fetchTrackingData = async (trackingNumbers: string[]) => {
  const headers = {
    'Accept': 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
  };

  const response = await axios.post('https://services.yuntrack.com/Track/Query', {
    NumberList: trackingNumbers,
    CaptchaVerification: '',
    Year: 0,
  }, { headers });

  const results = response.data.ResultList;
  return results;
};

const getOrderTrackingData = async (store: any) => {
  const orders = []; // Fetch orders from Shopify API based on store credentials
  // Logic to fetch orders goes here
  return orders;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get('storeId');

  if (!storeId) {
    return NextResponse.json({ error: 'Missing store ID' }, { status: 400 });
  }

  const store = await prisma.store.findUnique({ where: { id: Number(storeId) } });
  if (!store) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  }

  const trackingNumbers = await getOrderTrackingData(store);
  const trackingData = await fetchTrackingData(trackingNumbers);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Transit Data');
  worksheet.columns = [
    { header: 'Order Number', key: 'orderNumber', width: 30 },
    { header: 'Tracking Number', key: 'trackingNumber', width: 30 },
    { header: 'Carrier', key: 'carrier', width: 20 },
    { header: 'Tracking URL', key: 'trackingUrl', width: 50 },
    { header: 'Delivery Status', key: 'deliveryStatus', width: 20 },
  ];

  trackingData.forEach(data => {
    worksheet.addRow({
      orderNumber: data.OrderNumber,
      trackingNumber: data.TrackingNumber,
      carrier: data.Carrier,
      trackingUrl: data.TrackingUrl,
      deliveryStatus: data.DeliveryStatus,
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      'Content-Disposition': 'attachment; filename="export_transit.xlsx"',
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  });
}
