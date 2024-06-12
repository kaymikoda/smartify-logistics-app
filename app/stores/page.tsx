// app/stores/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { Container, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import axios from 'axios';
import VisibilityIcon from '@mui/icons-material/Visibility';

const Stores = () => {
  const [data, setData] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState('thisMonth');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (range: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/fetch-stores-data?dateRange=${range}`);
      setData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(dateRange);
  }, [dateRange]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Container maxWidth="lg" style={{ backgroundColor: '#fafafa' }}>
      <Select
        value={dateRange}
        onChange={(e) => setDateRange(e.target.value)}
        displayEmpty
        inputProps={{ 'aria-label': 'Date Range' }}
        sx={{ mb: 2 }}
      >
        <MenuItem value="thisMonth">Dieser Monat</MenuItem>
        <MenuItem value="today">Heute</MenuItem>
        <MenuItem value="yesterday">Gestern</MenuItem>
        <MenuItem value="thisWeek">Diese Woche</MenuItem>
        <MenuItem value="last3Weeks">Letzte 3 Wochen</MenuItem>
      </Select>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Store Name</TableCell>
              <TableCell>Fulfillment Provision</TableCell>
              <TableCell>Transaction Provision</TableCell>
              <TableCell>Total Provision</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 && data.map((store) => (
              <TableRow key={store.id}>
                <TableCell>{store.storeName}</TableCell>
                <TableCell>{store.fulfillmentProvision}€</TableCell>
                <TableCell>{store.transactionProvision}€</TableCell>
                <TableCell>{store.totalProvision}€</TableCell>
                <TableCell>
                  <Button variant="contained" startIcon={<VisibilityIcon />}>
                    Ansehen
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Stores;
