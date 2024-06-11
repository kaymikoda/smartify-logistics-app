// components/Sidebar.tsx
import React from 'react';
import Link from 'next/link';
import { Box, List, ListItem, ListItemText } from '@mui/material';

const Sidebar = () => {
  return (
    <Box sx={{ width: 250, backgroundColor: '#ffffff', minHeight: '100vh', padding: '20px', position: 'fixed', top: 0, left: 0 }}>
      <img src="/Smartify_Logo.jpg" alt="Logo" style={{ width: '100%', marginBottom: '20px' }} />
      <List>
        <ListItem button component={Link} href="/dashboard">
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={Link} href="/stores">
          <ListItemText primary="Stores" />
        </ListItem>
      </List>
    </Box>
  );
};

export default Sidebar;
