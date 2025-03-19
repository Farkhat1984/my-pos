import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  QrCodeScanner as ScannerIcon,
  Inventory as InventoryIcon,
  Receipt as ReceiptIcon,
  BarChart as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

import Layout from '../components/common/Layout';
import AuthContext from '../contexts/AuthContext';
import DatabaseContext from '../contexts/DatabaseContext';
import { formatCurrency, formatDate } from '../utils/formatUtils';
import ActionCard from '../components/dashboard/ActionCard'; // Убедитесь, что импорт правильный

// Main Dashboard component
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const {
    getInvoicesByPeriod,
    getSalesAnalytics,
    getTopProducts
  } = useContext(DatabaseContext);
  const navigate = useNavigate();

  const [todaySales, setTodaySales] = useState(null);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);

        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get one week ago for recent invoices
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // Get sales data for today
        const salesData = await getSalesAnalytics(today.toISOString(), tomorrow.toISOString());
        setTodaySales(salesData);

        // Get recent invoices
        const invoices = await getInvoicesByPeriod(oneWeekAgo.toISOString(), tomorrow.toISOString());
        setRecentInvoices(invoices.slice(0, 5)); // Show only last 5 invoices

        // Get top products for the last 30 days
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const topProductsData = await getTopProducts(thirtyDaysAgo.toISOString(), tomorrow.toISOString(), 3);
        setTopProducts(topProductsData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [getInvoicesByPeriod, getSalesAnalytics, getTopProducts]);

  // Navigate to different pages
  const navigateTo = (path) => {
    navigate(path);
  };

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <Layout title="Dashboard">
      <Box sx={{ mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome, {user?.username || 'User'}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Typography>
          <Divider sx={{ my: 2 }} />
        </motion.div>
      </Box>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Main actions */}
        <motion.div variants={itemVariants}>
          <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 500 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={6} md={3}>
              <ActionCard
                icon={<ScannerIcon fontSize="large" />}
                title="Scan Invoice"
                color="primary.main"
                onClick={() => navigateTo('/scan-invoice')}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <ActionCard
                icon={<InventoryIcon fontSize="large" />}
                title="Inventory"
                color="secondary.main"
                onClick={() => navigateTo('/inventory')}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <ActionCard
                icon={<ReceiptIcon fontSize="large" />}
                title="Invoices"
                color={(theme) => theme.palette.accent.purple}
                onClick={() => navigateTo('/invoices')}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <ActionCard
                icon={<AnalyticsIcon fontSize="large" />}
                title="Analytics"
                color={(theme) => theme.palette.accent.green}
                onClick={() => navigateTo('/analytics')}
              />
            </Grid>
          </Grid>
        </motion.div>

        {/* Sales Summary Section */}
        <motion.div variants={itemVariants}>
          <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 500 }}>
            Today's Summary
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {isLoading ? (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              </Grid>
            ) : (
              <>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Typography color="text.secondary" variant="subtitle2">
                      Total Sales
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'medium', my: 1 }}>
                      {formatCurrency(todaySales?.totalSales || 0)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {todaySales?.invoiceCount || 0} invoices today
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Typography color="text.secondary" variant="subtitle2">
                      Paid
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ color: 'success.main', fontWeight: 'medium', my: 1 }}>
                      {formatCurrency(todaySales?.paidAmount || 0)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {Math.round((todaySales?.paidAmount || 0) / (todaySales?.totalSales || 1) * 100)}% of total
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Typography color="text.secondary" variant="subtitle2">
                      Unpaid
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ color: 'error.main', fontWeight: 'medium', my: 1 }}>
                      {formatCurrency(todaySales?.debtAmount || 0)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingDownIcon color="error" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {Math.round((todaySales?.debtAmount || 0) / (todaySales?.totalSales || 1) * 100)}% of total
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </>
            )}
          </Grid>
        </motion.div>

        {/* Activity Feeds */}
        <motion.div variants={itemVariants}>
          <Grid container spacing={3}>
            {/* Recent Invoices */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ height: '100%' }}>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="h6" component="h3">
                    Recent Invoices
                  </Typography>
                </Box>
                <List sx={{ p: 0 }}>
                  {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : recentInvoices.length > 0 ? (
                    recentInvoices.map((invoice) => (
                      <ListItem
                        key={invoice.id}
                        divider
                        button
                        onClick={() => navigateTo(`/invoice/${invoice.id}`)}
                        sx={{
                          borderLeft: 4,
                          borderLeftColor: invoice.paymentStatus ? 'success.main' : 'error.main',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: 'action.hover'
                          }
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: invoice.paymentStatus ? 'success.main' : 'error.main' }}>
                            <AssignmentIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`Invoice #${invoice.id}`}
                          secondary={`${formatDate(invoice.date)} - ${formatCurrency(invoice.total)}`}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            bgcolor: invoice.paymentStatus ? 'success.light' : 'error.light',
                            color: invoice.paymentStatus ? 'success.contrastText' : 'error.contrastText',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1
                          }}
                        >
                          {invoice.paymentStatus ? 'Paid' : 'Unpaid'}
                        </Typography>
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText primary="No recent invoices" />
                    </ListItem>
                  )}
                </List>
              </Paper>
            </Grid>

            {/* Top Products */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ height: '100%' }}>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="h6" component="h3">
                    Top Products (Last 30 Days)
                  </Typography>
                </Box>
                <List sx={{ p: 0 }}>
                  {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : topProducts.length > 0 ? (
                    topProducts.map((product, index) => (
                      <ListItem
                        key={product.productId}
                        divider
                        sx={{
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: 'action.hover'
                          }
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {index + 1}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={product.name}
                          secondary={`Quantity: ${product.totalQuantity}`}
                        />
                        <Typography variant="body2" color="primary.main" fontWeight="bold">
                          {formatCurrency(product.totalSales)}
                        </Typography>
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText primary="No sales data available" />
                    </ListItem>
                  )}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Dashboard;