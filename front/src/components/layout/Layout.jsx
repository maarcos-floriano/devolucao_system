import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AddAlert,
  Computer,
  Dashboard,
  KeyboardReturn,
  Logout,
  Menu as MenuIcon,
  Monitor,
  Person,
  SettingsInputComponent,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import chamadoService from '../../services/chamadoService';

const drawerWidth = 260;

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openChamados, setOpenChamados] = useState(0);
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', permission: 'dashboard' },
    { text: 'Máquinas', icon: <Computer />, path: '/maquinas', permission: 'maquinas' },
    { text: 'Monitores', icon: <Monitor />, path: '/monitores', permission: 'monitores' },
    { text: 'Devolução', icon: <KeyboardReturn />, path: '/devolucao', permission: 'devolucao' },
    { text: 'Kits', icon: <SettingsInputComponent />, path: '/kit', permission: 'kit' },
    {
      text: 'Chamados',
      icon: (
        <Badge color="error" badgeContent={openChamados > 99 ? '99+' : openChamados} invisible={openChamados === 0}>
          <AddAlert />
        </Badge>
      ),
      path: '/chamados',
      permission: 'chamados',
    },
  ];

  useEffect(() => {
    let active = true;

    const loadOpenCount = async () => {
      if (!hasPermission('chamados')) return;
      try {
        const response = await chamadoService.getOpenCount();
        if (active) {
          setOpenChamados(response.total || 0);
        }
      } catch (error) {
        console.error('Erro ao buscar chamados abertos:', error);
      }
    };

    loadOpenCount();
    const interval = setInterval(loadOpenCount, 30000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [hasPermission]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const filteredMenuItems = menuItems.filter((item) => hasPermission(item.permission));

  const drawer = (
    <div>
      <Toolbar
        sx={{
          backgroundColor: '#22c55e',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h6" noWrap sx={{ fontWeight: 700 }}>
          RMA Sistema
        </Typography>
      </Toolbar>

      <Box sx={{ p: 2, textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
        <Avatar
          sx={{
            width: 60,
            height: 60,
            margin: '0 auto 10px',
            backgroundColor: '#22c55e',
            fontSize: '24px',
            fontWeight: 'bold',
          }}
        >
          {user?.name?.charAt(0) || 'U'}
        </Avatar>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {user?.name || 'Usuário'}
        </Typography>
        <Typography variant="caption" sx={{ color: '#6b7280' }}>
          {user?.role === 'admin' ? 'Administrador' : user?.role === 'tecnico' ? 'Técnico' : 'Operador'}
        </Typography>
      </Box>

      <List sx={{ mt: 1 }}>
        {filteredMenuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            sx={{
              mb: 0.5,
              mx: 1,
              borderRadius: 2,
              '&:hover': { backgroundColor: '#f0fdf4' },
            }}
          >
            <ListItemIcon sx={{ color: '#22c55e' }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: 500,
                fontSize: '15px',
              }}
            />
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', textAlign: 'center' }}>
          Sessão expira em 20 min
        </Typography>
        <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', textAlign: 'center' }}>
          de inatividade
        </Typography>
      </Box>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'white',
          color: '#1f2937',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' } }}>
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              noWrap
              sx={{ color: '#166534', fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              Sistema de Gerenciamento RMA
            </Typography>
          </Box>

          <Tooltip title="Configurações da conta">
            <IconButton onClick={handleMenuOpen} sx={{ p: 0, '&:hover': { backgroundColor: '#f0fdf4' } }}>
              <Avatar sx={{ width: 40, height: 40, backgroundColor: '#22c55e', fontSize: '16px' }}>{user?.name?.charAt(0) || 'U'}</Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: { xs: 170, sm: 200 },
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              },
            }}
          >
            <MenuItem disabled>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={user?.name}
                secondary={user?.role === 'admin' ? 'Administrador' : user?.role === 'tecnico' ? 'Técnico' : 'Operador'}
              />
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Sair" />
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: { xs: '85vw', sm: drawerWidth },
              borderRight: '1px solid #e5e7eb',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: { xs: '85vw', sm: drawerWidth },
              borderRight: '1px solid #e5e7eb',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 3 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: '#f9fafb',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
