import React from 'react';
import { Link } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
} from '@mui/material';
import {
  Dashboard,
  Computer,
  Monitor,
  KeyboardReturn,
  Inventory,
  Build,
} from '@mui/icons-material';

const Sidebar = ({ open, onClose }) => {
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <Dashboard /> },
    { path: '/maquinas', label: 'Máquinas', icon: <Computer /> },
    { path: '/monitores', label: 'Monitores', icon: <Monitor /> },
    { path: '/devolucao', label: 'Devolução', icon: <KeyboardReturn /> },
    { path: '/kit', label: 'Kit', icon: <Build /> },
  ];

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        display: { xs: 'block', sm: 'none' },
        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
      }}
    >
      <Box sx={{ width: 240, pt: 8 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem
              key={item.path}
              button
              component={Link}
              to={item.path}
              onClick={onClose}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
        <Divider />
      </Box>
    </Drawer>
  );
};

export default Sidebar;