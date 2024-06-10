'use client';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/fetchShopifyData');
        const result = await response.json();
        if (response.ok) {
          setOrders(result);
        } else {
          setError(result.error);
        }
      } catch (error) {
        setError(error.message);
      }
    };

    fetchOrders();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Shopify Orders</h1>
      <pre>{JSON.stringify(orders, null, 2)}</pre>
    </div>
  );
}
