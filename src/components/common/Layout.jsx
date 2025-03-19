import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Container,
  Avatar,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  BarChart as BarChartIcon,
  Inventory as InventoryIcon,
  Receipt as ReceiptIcon,
  QrCodeScanner as ScannerIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

import AuthContext from '../../contexts/AuthContext';
import UIContext from '../../contexts/UIContext';

/**
 * Layout component
 * Provides the app header, navigation, and content container
 */
const Layout = ({ 
  children, 
  title, 
  showBackButton = false, 
  onBackButtonClick,
  rightIcon = null,
  rightIconAction = null
}) => {
  const { user, logout } = useContext(AuthContext);
  const { showConfirmDialog } = useContext(UIContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Menu state
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Handle menu open/close
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // Toggle drawer
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Handle logout
  const handleLogout = () => {
    handleCloseUserMenu();
    
    showConfirmDialog(
      'Logout',
      'Are you sure you want to logout?',
      () => {
        logout();
        navigate('/login');
      }
    );
  };

  // Handle back button click
  const handleBackClick = () => {
    if (onBackButtonClick) {
      onBackButtonClick();
    } else {
      navigate(-1);
    }
  };

  // Navigation items
  const navigationItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Scan Invoice', icon: <ScannerIcon />, path: '/scan-invoice' },
    { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory' },
    { text: 'Invoices', icon: <ReceiptIcon />, path: '/invoices' },
    { text: 'Analytics', icon: <BarChartIcon />, path: '/analytics' }
  ];

  // Drawer content
  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 2,
          backgroundColor: 'primary.main',
          color: 'primary.contrastText'
        }}
      >
        <Avatar sx={{ width: 64, height: 64, mb: 1, bgcolor: 'secondary.main' }}>
          {user?.username?.charAt(0).toUpperCase() || 'U'}
        </Avatar>
        <Typography variant="h6" noWrap component="div">
          {user?.username || 'User'}
        </Typography>
      </Box>
      
      <Divider />
      
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => {
                navigate(item.path);
                setDrawerOpen(false);
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed">
        <Toolbar>
          {showBackButton ? (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="back"
              onClick={handleBackClick}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
          ) : (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, textAlign: 'center' }}
          >
            {title}
          </Typography>

          {rightIcon && (
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              onClick={rightIconAction}
            >
              {rightIcon}
            </IconButton>
          )}
          
          {!isMobile && (
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem onClick={handleCloseUserMenu}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography textAlign="center">Profile</Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography textAlign="center">Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      {/* Drawer for navigation */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
      >
        {drawer}
      </Drawer>
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          pt: '64px', // Toolbar height
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Container maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;