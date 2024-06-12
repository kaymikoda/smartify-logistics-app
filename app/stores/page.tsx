import React from 'react';
import { Container, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import axios from 'axios';

const Stores = () => {
  const [data, setData] = React.useState([]);
  const [dateRange, setDateRange] = React.useState('thisMonth');

  const fetchData = async (range) => {
    const response = await axios.get(`/api/fetch-stores-data?dateRange=${range}`);
    setData(response.data);
  };

  const handleDownload = async (storeId) => {
    const response = await axios.get(`/api/scrape-and-export?storeId=${storeId}`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'export_transit.xlsx');
    document.body.appendChild(link);
    link.click();
  };

  React.useEffect(() => {
    fetchData(dateRange);
  }, [dateRange]);

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
                  <Button
                    variant="contained"
                    onClick={() => handleDownload(store.id)}
                  >
                    Ansehen
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Stores;
