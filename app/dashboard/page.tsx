'use client';

import React, { useEffect, useState } from 'react';
import { Container, Grid, Paper, Typography, Box, Card, CardContent, Select, MenuItem } from '@mui/material';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
  DefaultDataPoint,
} from 'chart.js';
import { format } from 'date-fns';

// Registrieren Sie die Komponenten
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [data, setData] = useState<any>(null);
  const [dateRange, setDateRange] = useState('thisMonth');

  const fetchData = async (range: string) => {
    const response = await axios.get(`/api/process-orders?dateRange=${range}`);
    setData(response.data);
  };

  useEffect(() => {
    fetchData(dateRange);
  }, [dateRange]);

  if (!data) {
    return <div>Loading...</div>;
  }

  const maxYValue = Math.max(...data['Total Orders']) + 5; // Adding some space above the highest point

  const formattedDates = data.Date.map((date: string) =>
    format(new Date(date), 'dd MMMM')
  );

  const chartData: ChartData<'line', DefaultDataPoint<'line'>> = {
    labels: formattedDates,
    datasets: [
      {
        label: 'Provision',
        data: data['Total Provision (€)'],
        fill: 'start',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: '#4b99fc',
        pointRadius: 0, // Entfernen Sie die Punkte
        pointHoverRadius: 0, // Entfernen Sie die Punkte beim Hover
        tension: 0.4, // Glättet die Linie
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // Entfernen der Legende
      },
      tooltip: {
        mode: 'index', // Anzeigen des Tooltips beim Überfahren der x-Achse
        intersect: false,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += context.raw + '€'; // Hinzufügen des €-Zeichens
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b6b6b',
          font: {
            size: 12,
          },
          padding: 20, // Zurücksetzen des Abstands der X-Achse
        },
        border: {
          display: false, // Macht die X-Achsenlinie unsichtbar
        },
      },
      y: {
        grid: {
          color: 'rgba(200,200,200,0.1)',
        },
        ticks: {
          color: '#6b6b6b',
          font: {
            size: 12,
          },
          padding: 20, // Erhöhen Sie den Abstand zur X-Achse
          callback: function(value, index, values) {
            return value + '€'; // Hinzufügen des €-Zeichens
          }
        },
        beginAtZero: true,
        suggestedMax: maxYValue,
        border: {
          display: false, // Macht die Y-Achsenlinie unsichtbar
        },
      },
    },
    hover: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  const totalOrders = data['Total Orders'].reduce((sum: number, value: number) => sum + value, 0);
  const totalItems = data['Total Items'].reduce((sum: number, value: number) => sum + value, 0);
  const totalActiveContacts = data['Store Name'].length;
  const fulfillmentProvision = data['Fulfillment Provision (€)'].reduce((sum: number, value: number) => sum + value, 0);
  const transactionProvision = data['Transaction Provision (€)'].reduce((sum: number, value: number) => sum + value, 0).toFixed(2);
  const totalProvision = data['Total Provision (€)'].reduce((sum: number, value: number) => sum + value, 0).toFixed(2);

  return (
    <Container maxWidth="lg" style={{ backgroundColor: '#fafafa' }}>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          displayEmpty
          inputProps={{ 'aria-label': 'Date Range' }}
        >
          <MenuItem value="thisMonth">Dieser Monat</MenuItem>
          <MenuItem value="today">Heute</MenuItem>
          <MenuItem value="yesterday">Gestern</MenuItem>
          <MenuItem value="thisWeek">Diese Woche</MenuItem>
          <MenuItem value="last3Weeks">Letzte 3 Wochen</MenuItem>
        </Select>
        <Grid container spacing={3}>
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
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
              <Typography variant="h6" component="h2" color="#858788">
                  Fulfillment Provision
                </Typography>
                <Typography variant="h3" component="p">
                  {fulfillmentProvision.toFixed(2)}€
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
              <Typography variant="h6" component="h2" color="#858788">
                  Transaction Provision
                </Typography>
                <Typography variant="h3" component="p">
                  {transactionProvision}€
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
              <Typography variant="h6" component="h2" color="#858788">
                  Total Provision
                </Typography>
                <Typography variant="h3" component="p">
                  {totalProvision}€
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          {/* Chart */}
          <Grid item xs={12}>
            <Paper>
              <Box p={2} boxShadow="none">
                <Typography variant="h6" component="h2">
                  Total Provision
                </Typography>
                <Line data={chartData} options={chartOptions} />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;
