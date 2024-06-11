import React from 'react';
import { Line } from 'react-chartjs-2';
import styled from 'styled-components';

const ChartContainer = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-top: 20px;
  width: 100%;
`;

const ChartTitle = styled.h3`
  font-weight: 500;
  margin-bottom: 20px;
`;

type ChartProps = {
  data: any;
  options: any;
};

const Chart: React.FC<ChartProps> = ({ data, options }) => {
  return (
    <ChartContainer>
      <ChartTitle>Revenue per date</ChartTitle>
      <Line data={data} options={options} />
    </ChartContainer>
  );
};

export default Chart;
