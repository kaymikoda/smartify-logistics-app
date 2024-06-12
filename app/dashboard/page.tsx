'use client';

import React, { useEffect, useState } from 'react';
import { Container, Grid, Typography, Box, Card, CardContent, Select, MenuItem } from '@mui/material';
import axios from 'axios';
import { format } from 'date-fns';
import CustomChart from '@/app/components/CustomChart';

const Dashboard = () => {
  const [data, setData] = useState<any>(null);
  const [dateRange, setDateRange] = useState('thisMonth');

  const fetchData = async (range: string) => {
    console.log('fetchData called');
    const response = await axios.get(`/api/process-orders?dateRange=${range}`);
    setData(response.data);
  };

  useEffect(() => {
    fetchData(dateRange);
  }, [dateRange]);

  if (!data) {
    return <div>Loading...</div>;
  }

  const formattedDates = data.Date.map((date: string) =>
    format(new Date(date), 'dd MMMM')
  );

  const totalOrders = data['Total Orders'].reduce((sum: number, value: number) => sum + value, 0);
  const totalItems = data['Total Items'].reduce((sum: number, value: number) => sum + value, 0);
  const totalActiveContacts = new Set(data['Store Name']).size;
  const fulfillmentProvision = data['Fulfillment Provision (€)'].reduce((sum: number, value: number) => sum + value, 0);
  const transactionProvision = data['Transaction Provision (€)'].reduce((sum: number, value: number) => sum + value, 0).toFixed(2);
  const totalProvision = data['Total Provision (€)'].reduce((sum: number, value: number) => sum + value, 0).toFixed(2);

  return (
    <Container maxWidth="lg" sx={{ backgroundColor: '#fafafa', padding: '20px' }}>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          displayEmpty
          inputProps={{ 'aria-label': 'Date Range' }}
          sx={{ mb: 2 , backgroundColor: 'white' }} // Padding unten hinzufügen
        >
          <MenuItem value="thisMonth">Dieser Monat</MenuItem>
          <MenuItem value="today">Heute</MenuItem>
          <MenuItem value="yesterday">Gestern</MenuItem>
          <MenuItem value="thisWeek">Diese Woche</MenuItem>
          <MenuItem value="last3Weeks">Letzte 3 Wochen</MenuItem>
        </Select>
        <Grid container spacing={3} sx={{ backgroundColor: '#fafafa' }}>
          {/* Cards */}
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" color="#858788">
                  Total Orders
                </Typography>
                <Typography variant="h3" component="p">
                  {totalOrders}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" color="#858788">
                  Total Items
                </Typography>
                <Typography variant="h3" component="p">
                  {totalItems}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" color="#858788">
                  Active Stores
                </Typography>
                <Typography variant="h3" component="p">
                  {totalActiveContacts}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          {/* Charts */}
          <Grid item xs={12} md={6}>
            <CustomChart
              dataValues={data['Fulfillment Provision (€)']}
              labels={formattedDates}
              title="Fulfillment Provision"
              subtitle={`${fulfillmentProvision}€`}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomChart
              dataValues={data['Transaction Provision (€)']}
              labels={formattedDates}
              title="Transaction Provision"
              subtitle={`${transactionProvision}€`}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomChart
              dataValues={data['Total Provision (€)']}
              labels={formattedDates}
              title="Total Provision"
              subtitle={`${totalProvision}€`}
            />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;
