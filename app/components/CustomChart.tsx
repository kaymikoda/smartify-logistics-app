// components/CustomChart.tsx
'use client';

import React from 'react';
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
import { Box, Typography, Paper } from '@mui/material';
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

interface CustomChartProps {
  dataValues: number[];
  labels: string[];
  title: string;
  subtitle: string;
}

const CustomChart: React.FC<CustomChartProps> = ({ dataValues, labels, title, subtitle }) => {
  const chartData: ChartData<'line', DefaultDataPoint<'line'>> = {
    labels,
    datasets: [
      {
        label: 'Provision',
        data: dataValues,
        fill: 'start',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: '#4b99fc',
        pointRadius: 0, // Entfernen Sie die Punkte
        pointHoverRadius: 0, // Entfernen Sie die Punkte beim Hover
        tension: 0.4, // Glättet die Linie
      },
    ],
  };

  const maxYValue = Math.max(...dataValues) + 5; // Adding some space above the highest point

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

  return (
    <Paper>
      <Box p={2} boxShadow="none">
        <Typography variant="h6" component="h2" padding="0px 20px" color="#858788">
          {title}
        </Typography>
        <Typography variant="h4" component="h2" padding="0px 20px 20px 20px">
          {subtitle}
        </Typography>
        <Line data={chartData} options={chartOptions} />
      </Box>
    </Paper>
  );
};

export default CustomChart;
