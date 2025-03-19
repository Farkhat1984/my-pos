import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  useTheme
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { 
  TrendingUp as TrendingUpIcon, 
  TrendingDown as TrendingDownIcon,
  MonetizationOn as MonetizationOnIcon,
  Receipt as ReceiptIcon,
  ShoppingCart as ShoppingCartIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  EmojiEvents as EmojiEventsIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale,
  BarElement, 
  Title, 
  Tooltip as ChartTooltip, 
  Legend,
  ArcElement,
  LineElement,
  PointElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';

import Layout from '../components/common/Layout';
import DatabaseContext from '../contexts/DatabaseContext';
import UIContext from '../contexts/UIContext';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatUtils';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

/**
 * Analytics page component
 * Displays sales and product analytics
 */
const Analytics = () => {
  const { 
    getSalesAnalytics, 
    getProfitAnalytics,
    getTopProducts,
    getInvoicesByPeriod 
  } = useContext(DatabaseContext);
  const { showSnackbar } = useContext(UIContext);
  const theme = useTheme();
  
  // State
  const [startDate, setStartDate] = useState(dayjs().subtract(30, 'day')); // Last 30 days
  const [endDate, setEndDate] = useState(dayjs());
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [salesData, setSalesData] = useState(null);
  const [profitData, setProfitData] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [timeSeriesData, setTimeSeriesData] = useState(null);
  
  // Load analytics data
  useEffect(() => {
    loadAnalyticsData();
  }, [startDate, endDate]);

  // Load data based on date range
  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // Format dates for database queries
      const startDateFormatted = startDate.startOf('day').toISOString();
      const endDateFormatted = endDate.endOf('day').toISOString();
      
      // Get sales analytics
      const sales = await getSalesAnalytics(startDateFormatted, endDateFormatted);
      setSalesData(sales);
      
      // Get profit analytics
      const profit = await getProfitAnalytics(startDateFormatted, endDateFormatted);
      setProfitData(profit);
      
      // Get top products
      const products = await getTopProducts(startDateFormatted, endDateFormatted, 5);
      setTopProducts(products);
      
      // Get time series data (daily sales for the period)
      await loadTimeSeriesData(startDateFormatted, endDateFormatted);
    } catch (error) {
      console.error('Error loading analytics:', error);
      showSnackbar('Error loading analytics data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Load time series data (daily sales)
  const loadTimeSeriesData = async (startDateFormatted, endDateFormatted) => {
    try {
      // Get all invoices for the period
      const invoices = await getInvoicesByPeriod(startDateFormatted, endDateFormatted);
      
      // Group invoices by date and calculate daily totals
      const dailySales = {};
      
      // Create a date array for all days in the range
      const dateArray = [];
      const startDay = dayjs(startDateFormatted);
      const endDay = dayjs(endDateFormatted);
      let currentDay = startDay;
      
      while (currentDay.isBefore(endDay) || currentDay.isSame(endDay, 'day')) {
        const dateKey = currentDay.format('YYYY-MM-DD');
        dailySales[dateKey] = {
          date: dateKey,
          displayDate: currentDay.format('MMM DD'),
          total: 0,
          count: 0,
          paid: 0,
          unpaid: 0
        };
        
        dateArray.push(dateKey);
        currentDay = currentDay.add(1, 'day');
      }
      
      // Populate with invoice data
      invoices.forEach(invoice => {
        const invoiceDate = dayjs(invoice.date).format('YYYY-MM-DD');
        
        if (dailySales[invoiceDate]) {
          dailySales[invoiceDate].total += invoice.total;
          dailySales[invoiceDate].count += 1;
          
          if (invoice.paymentStatus) {
            dailySales[invoiceDate].paid += invoice.total;
          } else {
            dailySales[invoiceDate].unpaid += invoice.total;
          }
        }
      });
      
      // Convert to arrays for charts
      const timeSeriesArray = dateArray.map(date => dailySales[date]);
      
      setTimeSeriesData({
        dates: timeSeriesArray.map(day => day.displayDate),
        totals: timeSeriesArray.map(day => day.total),
        counts: timeSeriesArray.map(day => day.count),
        paid: timeSeriesArray.map(day => day.paid),
        unpaid: timeSeriesArray.map(day => day.unpaid)
      });
    } catch (error) {
      console.error('Error loading time series data:', error);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Card animation variants
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

  // Render loading state
  if (isLoading) {
    return (
      <Layout title="Analytics">
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <CircularProgress />
            </Grid>
          </Grid>
        </Box>
      </Layout>
    );
  }

  // Format chart data for Sales
  const salesChartData = {
    labels: ['Sales Breakdown'],
    datasets: [
      {
        label: 'Paid',
        data: [salesData?.paidAmount || 0],
        backgroundColor: theme.palette.success.main,
      },
      {
        label: 'Unpaid',
        data: [salesData?.debtAmount || 0],
        backgroundColor: theme.palette.error.main,
      },
    ],
  };

  // Format chart data for Profit
  const profitChartData = {
    labels: ['Profit', 'Cost'],
    datasets: [
      {
        data: [profitData?.profit || 0, profitData?.cost || 0],
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.error.light,
        ],
        borderColor: [
          theme.palette.primary.dark,
          theme.palette.error.main,
        ],
        borderWidth: 1,
      },
    ],
  };

  // Format chart data for Time Series
  const timeSeriesChartData = {
    labels: timeSeriesData?.dates || [],
    datasets: [
      {
        label: 'Daily Sales',
        data: timeSeriesData?.totals || [],
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.light,
        fill: false,
        tension: 0.4,
      }
    ],
  };

  // Format chart data for Top Products
  const topProductsChartData = {
    labels: topProducts.map(product => product.name),
    datasets: [
      {
        label: 'Sales',
        data: topProducts.map(product => product.totalSales),
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.success.main,
          theme.palette.info.main,
          theme.palette.warning.main
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Sales Breakdown',
      },
    },
  };

  return (
    <Layout title="Analytics">
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Date range selector */}
        <Paper
          elevation={2}
          component={motion.div}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          sx={{ p: 2, mb: 2 }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            gap: 2
          }}>
            <Typography variant="body1" sx={{ mr: 2 }}>
              Date Range:
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              gap: 2, 
              flexGrow: 1,
              width: { xs: '100%', sm: 'auto' }
            }}>
              <DatePicker
                label="From"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                slotProps={{ 
                  textField: { 
                    size: 'small',
                    fullWidth: { xs: true, sm: false }
                  } 
                }}
              />
              
              <DatePicker
                label="To"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                slotProps={{ 
                  textField: { 
                    size: 'small',
                    fullWidth: { xs: true, sm: false }
                  } 
                }}
              />
            </Box>
          </Box>
        </Paper>

        {/* Metrics Summary */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {/* Total Sales */}
            <Grid item xs={6} sm={4} md={2}>
              <motion.div variants={itemVariants}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar 
                        sx={{ bgcolor: 'primary.main', mr: 1 }}
                        variant="rounded"
                      >
                        <MonetizationOnIcon />
                      </Avatar>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total Sales
                      </Typography>
                    </Box>
                    <Typography variant="h6" component="div" fontWeight="bold">
                      {formatCurrency(salesData?.totalSales || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Invoices */}
            <Grid item xs={6} sm={4} md={2}>
              <motion.div variants={itemVariants}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar 
                        sx={{ bgcolor: 'secondary.main', mr: 1 }}
                        variant="rounded"
                      >
                        <ReceiptIcon />
                      </Avatar>
                      <Typography variant="subtitle2" color="text.secondary">
                        Invoices
                      </Typography>
                    </Box>
                    <Typography variant="h6" component="div" fontWeight="bold">
                      {formatNumber(salesData?.invoiceCount || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Average Invoice */}
            <Grid item xs={6} sm={4} md={2}>
              <motion.div variants={itemVariants}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar 
                        sx={{ bgcolor: theme.palette.accent.purple, mr: 1 }}
                        variant="rounded"
                      >
                        <TimelineIcon />
                      </Avatar>
                      <Typography variant="subtitle2" color="text.secondary">
                        Avg Invoice
                      </Typography>
                    </Box>
                    <Typography variant="h6" component="div" fontWeight="bold">
                      {formatCurrency(salesData?.averageInvoice || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Paid Amount */}
            <Grid item xs={6} sm={4} md={2}>
              <motion.div variants={itemVariants}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar 
                        sx={{ bgcolor: 'success.main', mr: 1 }}
                        variant="rounded"
                      >
                        <TrendingUpIcon />
                      </Avatar>
                      <Typography variant="subtitle2" color="text.secondary">
                        Paid
                      </Typography>
                    </Box>
                    <Typography variant="h6" component="div" fontWeight="bold">
                      {formatCurrency(salesData?.paidAmount || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Unpaid Amount */}
            <Grid item xs={6} sm={4} md={2}>
              <motion.div variants={itemVariants}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar 
                        sx={{ bgcolor: 'error.main', mr: 1 }}
                        variant="rounded"
                      >
                        <TrendingDownIcon />
                      </Avatar>
                      <Typography variant="subtitle2" color="text.secondary">
                        Unpaid
                      </Typography>
                    </Box>
                    <Typography variant="h6" component="div" fontWeight="bold">
                      {formatCurrency(salesData?.debtAmount || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Profit */}
            <Grid item xs={6} sm={4} md={2}>
              <motion.div variants={itemVariants}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar 
                        sx={{ bgcolor: theme.palette.accent.green, mr: 1 }}
                        variant="rounded"
                      >
                        <BarChartIcon />
                      </Avatar>
                      <Typography variant="subtitle2" color="text.secondary">
                        Profit
                      </Typography>
                    </Box>
                    <Typography variant="h6" component="div" fontWeight="bold">
                      {formatCurrency(profitData?.profit || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>

        {/* Tabs for different charts */}
        <Paper
          elevation={2}
          component={motion.div}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab icon={<TimelineIcon />} label="Sales Trend" />
            <Tab icon={<MonetizationOnIcon />} label="Revenue" />
            <Tab icon={<EmojiEventsIcon />} label="Top Products" />
          </Tabs>
          
          <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Sales Trend Chart */}
            {tabValue === 0 && (
              <Box sx={{ height: 300, mb: 2 }}>
                <Line 
                  data={timeSeriesChartData} 
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: {
                        ...chartOptions.plugins.title,
                        text: 'Daily Sales Trend'
                      }
                    }
                  }}
                />
              </Box>
            )}
            
            {/* Revenue Chart */}
            {tabValue === 1 && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ height: 300, mb: 2 }}>
                    <Bar 
                      data={salesChartData} 
                      options={{
                        ...chartOptions,
                        plugins: {
                          ...chartOptions.plugins,
                          title: {
                            ...chartOptions.plugins.title,
                            text: 'Sales Breakdown'
                          }
                        }
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ height: 300, mb: 2 }}>
                    <Pie 
                      data={profitChartData} 
                      options={{
                        ...chartOptions,
                        plugins: {
                          ...chartOptions.plugins,
                          title: {
                            ...chartOptions.plugins.title,
                            text: 'Profit vs Cost'
                          }
                        }
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Revenue Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total Revenue:
                      </Typography>
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        {formatCurrency(profitData?.revenue || 0)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total Cost:
                      </Typography>
                      <Typography variant="h6" color="error" fontWeight="bold">
                        {formatCurrency(profitData?.cost || 0)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Net Profit:
                      </Typography>
                      <Typography variant="h6" color="success" fontWeight="bold">
                        {formatCurrency(profitData?.profit || 0)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Profit Margin:
                      </Typography>
                      <Typography variant="h6" color="secondary" fontWeight="bold">
                        {formatPercent(profitData?.revenue > 0 
                          ? (profitData.profit / profitData.revenue * 100) 
                          : 0
                        )}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            )}
            
            {/* Top Products Chart */}
            {tabValue === 2 && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ height: 300, mb: 2 }}>
                    <Bar 
                      data={topProductsChartData} 
                      options={{
                        ...chartOptions,
                        indexAxis: 'y',
                        plugins: {
                          ...chartOptions.plugins,
                          title: {
                            ...chartOptions.plugins.title,
                            text: 'Top 5 Products by Sales'
                          }
                        }
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Top Selling Products
                  </Typography>
                  <List>
                    {topProducts.length > 0 ? (
                      topProducts.map((product, index) => (
                        <ListItem 
                          key={product.productId} 
                          divider={index < topProducts.length - 1}
                          sx={{ py: 1 }}
                        >
                          <ListItemAvatar>
                            <Avatar 
                              sx={{ 
                                bgcolor: index === 0 
                                  ? 'gold' 
                                  : index === 1 
                                    ? 'silver' 
                                    : index === 2 
                                      ? '#cd7f32' // bronze
                                      : 'grey.400'
                              }}
                            >
                              {index + 1}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={product.name}
                            secondary={`Quantity: ${product.totalQuantity}`}
                          />
                          <Typography variant="body1" fontWeight="bold" color="primary.main">
                            {formatCurrency(product.totalSales)}
                          </Typography>
                        </ListItem>
                      ))
                    ) : (
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <InventoryIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="No sales data available"
                          secondary="Try selecting a different date range"
                        />
                      </ListItem>
                    )}
                  </List>
                </Grid>
              </Grid>
            )}
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
};

export default Analytics;