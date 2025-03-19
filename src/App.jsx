import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';

// Theme
import theme from './theme';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { DatabaseProvider } from './contexts/DatabaseContext';
import { UIProvider } from './contexts/UIContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import ProductCreate from './pages/ProductCreate';
import ProductEdit from './pages/ProductEdit';
import ScanInvoice from './pages/ScanInvoice';
import InvoiceHistory from './pages/InvoiceHistory';
import InvoiceDetail from './pages/InvoiceDetail';
import Analytics from './pages/Analytics';

// Components
import PrivateRoute from './components/common/PrivateRoute';
import AppSnackbar from './components/common/AppSnackbar';
import AppDialog from './components/common/AppDialog';
import Loading from './components/common/Loading';

/**
 * Main App component
 * Sets up routing and context providers
 */
const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <AuthProvider>
          <DatabaseProvider>
            <UIProvider>
              <Router>
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    
                    {/* Private routes */}
                    <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    <Route path="/inventory" element={<PrivateRoute><Inventory /></PrivateRoute>} />
                    <Route path="/product/create" element={<PrivateRoute><ProductCreate /></PrivateRoute>} />
                    <Route path="/product/:id" element={<PrivateRoute><ProductEdit /></PrivateRoute>} />
                    <Route path="/scan-invoice" element={<PrivateRoute><ScanInvoice /></PrivateRoute>} />
                    <Route path="/invoices" element={<PrivateRoute><InvoiceHistory /></PrivateRoute>} />
                    <Route path="/invoice/:id" element={<PrivateRoute><InvoiceDetail /></PrivateRoute>} />
                    <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
                    
                    {/* Fallback route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                
                {/* Global components */}
                <AppSnackbar />
                <AppDialog />
                <Loading />
              </Router>
            </UIProvider>
          </DatabaseProvider>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;