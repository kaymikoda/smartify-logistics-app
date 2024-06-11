import React from 'react';
import styled from 'styled-components';

const Card = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  text-align: center;
  flex: 1;
`;

const IconContainer = styled.div<{ color: string }>`
  background-color: ${(props) => props.color};
  border-radius: 50%;
  padding: 10px;
  color: white;
  margin-bottom: 10px;
`;

const Title = styled.h5`
  margin: 0;
  color: #6c757d;
  font-size: 14px;
`;

const Value = styled.p`
  margin: 0;
  color: #343a40;
  font-size: 20px;
  font-weight: bold;
`;

type StatCardProps = {
  icon: string;
  color: string;
  title: string;
  value: string;
};

const StatCard: React.FC<StatCardProps> = ({ icon, color, title, value }) => {
  return (
    <Card>
      <IconContainer color={color}>
        <i className={`fas ${icon}`}></i>
      </IconContainer>
      <Title>{title}</Title>
      <Value>{value}</Value>
    </Card>
  );
};

export default StatCard;
