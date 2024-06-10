// app/dashboard.js
import React, { useEffect, useState } from 'react';

export default function Dashboard() {
  const [stores, setStores] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch('/api/stores');
      const data = await response.json();
      setStores(data);
    }
    fetchData();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Store Name</th>
            <th>API Key</th>
            <th>Password</th>
            <th>Rule Type</th>
            <th>Rule Value</th>
            <th>Average Spend Per Order</th>
            <th>First Order</th>
          </tr>
        </thead>
        <tbody>
          {stores.map(store => (
            <tr key={store.id}>
              <td>{store.id}</td>
              <td>{store.store_name}</td>
              <td>{store.api_key}</td>
              <td>{store.password}</td>
              <td>{store.rule_type}</td>
              <td>{store.rule_value}</td>
              <td>{store.average_spend_per_order}</td>
              <td>{store.firstOrder}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
