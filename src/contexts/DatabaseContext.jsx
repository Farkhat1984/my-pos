import React, { createContext, useState, useEffect, useCallback } from 'react';
import databaseService from '../services/databaseService';

// Create the context
export const DatabaseContext = createContext();

/**
 * Database Context Provider
 * Provides database operations to all child components
 */
export const DatabaseProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize database
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        await databaseService.initDatabase();
        
        setIsInitialized(true);
      } catch (err) {
        console.error('Database initialization error:', err);
        setError('Failed to initialize database');
      } finally {
        setIsLoading(false);
      }
    };

    initializeDatabase();
  }, []);

  // Products operations
  const addProduct = useCallback(async (product) => {
    try {
      setError(null);
      return await databaseService.addProduct(product);
    } catch (err) {
      setError(err.message || 'Failed to add product');
      throw err;
    }
  }, []);

  const updateProduct = useCallback(async (id, productData) => {
    try {
      setError(null);
      return await databaseService.updateProduct(id, productData);
    } catch (err) {
      setError(err.message || 'Failed to update product');
      throw err;
    }
  }, []);

  const updateProductQuantity = useCallback(async (id, quantity) => {
    try {
      setError(null);
      return await databaseService.updateProductQuantity(id, quantity);
    } catch (err) {
      setError(err.message || 'Failed to update product quantity');
      throw err;
    }
  }, []);

  const findProductByBarcode = useCallback(async (barcode) => {
    try {
      setError(null);
      return await databaseService.findProductByBarcode(barcode);
    } catch (err) {
      setError(err.message || 'Failed to find product');
      throw err;
    }
  }, []);

  const findProductById = useCallback(async (id) => {
    try {
      setError(null);
      return await databaseService.findProductById(id);
    } catch (err) {
      setError(err.message || 'Failed to find product');
      throw err;
    }
  }, []);

  const getAllProducts = useCallback(async (sortBy = 'name') => {
    try {
      setError(null);
      return await databaseService.getAllProducts(sortBy);
    } catch (err) {
      setError(err.message || 'Failed to get products');
      throw err;
    }
  }, []);

  const searchProducts = useCallback(async (searchTerm) => {
    try {
      setError(null);
      return await databaseService.searchProducts(searchTerm);
    } catch (err) {
      setError(err.message || 'Failed to search products');
      throw err;
    }
  }, []);

  // Invoice operations
  const createInvoice = useCallback(async (invoice) => {
    try {
      setError(null);
      return await databaseService.createInvoice(invoice);
    } catch (err) {
      setError(err.message || 'Failed to create invoice');
      throw err;
    }
  }, []);

  const updateInvoice = useCallback(async (id, invoiceData) => {
    try {
      setError(null);
      return await databaseService.updateInvoice(id, invoiceData);
    } catch (err) {
      setError(err.message || 'Failed to update invoice');
      throw err;
    }
  }, []);

  const addInvoiceItem = useCallback(async (item) => {
    try {
      setError(null);
      return await databaseService.addInvoiceItem(item);
    } catch (err) {
      setError(err.message || 'Failed to add invoice item');
      throw err;
    }
  }, []);

  const deleteInvoiceItems = useCallback(async (invoiceId) => {
    try {
      setError(null);
      return await databaseService.deleteInvoiceItems(invoiceId);
    } catch (err) {
      setError(err.message || 'Failed to delete invoice items');
      throw err;
    }
  }, []);

  const getInvoice = useCallback(async (id) => {
    try {
      setError(null);
      return await databaseService.getInvoice(id);
    } catch (err) {
      setError(err.message || 'Failed to get invoice');
      throw err;
    }
  }, []);

  const getInvoiceItems = useCallback(async (invoiceId) => {
    try {
      setError(null);
      return await databaseService.getInvoiceItems(invoiceId);
    } catch (err) {
      setError(err.message || 'Failed to get invoice items');
      throw err;
    }
  }, []);

  const getInvoicesByPeriod = useCallback(async (startDate, endDate) => {
    try {
      setError(null);
      return await databaseService.getInvoicesByPeriod(startDate, endDate);
    } catch (err) {
      setError(err.message || 'Failed to get invoices');
      throw err;
    }
  }, []);

  const deleteInvoice = useCallback(async (id) => {
    try {
      setError(null);
      return await databaseService.deleteInvoice(id);
    } catch (err) {
      setError(err.message || 'Failed to delete invoice');
      throw err;
    }
  }, []);

  // Analytics operations
  const getSalesAnalytics = useCallback(async (startDate, endDate) => {
    try {
      setError(null);
      return await databaseService.getSalesAnalytics(startDate, endDate);
    } catch (err) {
      setError(err.message || 'Failed to get sales analytics');
      throw err;
    }
  }, []);

  const getProfitAnalytics = useCallback(async (startDate, endDate) => {
    try {
      setError(null);
      return await databaseService.getProfitAnalytics(startDate, endDate);
    } catch (err) {
      setError(err.message || 'Failed to get profit analytics');
      throw err;
    }
  }, []);

  const getTopProducts = useCallback(async (startDate, endDate, limit = 5) => {
    try {
      setError(null);
      return await databaseService.getTopProducts(startDate, endDate, limit);
    } catch (err) {
      setError(err.message || 'Failed to get top products');
      throw err;
    }
  }, []);

  // Provide the context value
  const value = {
    isInitialized,
    isLoading,
    error,
    // Products
    addProduct,
    updateProduct,
    updateProductQuantity,
    findProductByBarcode,
    findProductById,
    getAllProducts,
    searchProducts,
    // Invoices
    createInvoice,
    updateInvoice,
    addInvoiceItem,
    deleteInvoiceItems,
    getInvoice,
    getInvoiceItems,
    getInvoicesByPeriod,
    deleteInvoice,
    // Analytics
    getSalesAnalytics,
    getProfitAnalytics,
    getTopProducts
  };

  return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
};

export default DatabaseContext;