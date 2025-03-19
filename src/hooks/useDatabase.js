import { useContext, useState, useCallback } from 'react';
import DatabaseContext from '../contexts/DatabaseContext';
import UIContext from '../contexts/UIContext';

/**
 * Custom hook for database operations
 * Provides a simpler interface with loading states and error handling
 * 
 * @returns {Object} Database operations and state
 */
const useDatabase = () => {
  const database = useContext(DatabaseContext);
  const { showSnackbar } = useContext(UIContext);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Execute a database operation with loading state and error handling
   * @param {Function} operation - The database operation to perform
   * @param {Object} options - Options for the operation
   * @param {string} options.errorMessage - Custom error message
   * @param {string} options.successMessage - Success message to show
   * @param {boolean} options.showErrors - Whether to show error snackbars
   * @returns {Promise} - The result of the operation
   */
  const executeOperation = useCallback(async (operation, options = {}) => {
    const {
      errorMessage = 'Operation failed',
      successMessage = null,
      showErrors = true
    } = options;
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await operation();
      
      if (successMessage) {
        showSnackbar(successMessage, 'success');
      }
      
      return result;
    } catch (err) {
      console.error('Database operation error:', err);
      
      const message = err.message || errorMessage;
      setError(message);
      
      if (showErrors) {
        showSnackbar(message, 'error');
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  // Product operations
  const addProduct = useCallback((product) => {
    return executeOperation(
      () => database.addProduct(product),
      { 
        errorMessage: 'Failed to add product',
        successMessage: 'Product added successfully'
      }
    );
  }, [database, executeOperation]);

  const updateProduct = useCallback((id, productData) => {
    return executeOperation(
      () => database.updateProduct(id, productData),
      { 
        errorMessage: 'Failed to update product',
        successMessage: 'Product updated successfully'
      }
    );
  }, [database, executeOperation]);

  const findProductByBarcode = useCallback((barcode) => {
    return executeOperation(
      () => database.findProductByBarcode(barcode),
      { 
        errorMessage: 'Failed to find product',
        showErrors: false
      }
    );
  }, [database, executeOperation]);

  const findProductById = useCallback((id) => {
    return executeOperation(
      () => database.findProductById(id),
      { 
        errorMessage: 'Failed to find product',
        showErrors: false
      }
    );
  }, [database, executeOperation]);

  const getAllProducts = useCallback((sortBy) => {
    return executeOperation(
      () => database.getAllProducts(sortBy),
      { 
        errorMessage: 'Failed to load products',
        showErrors: false
      }
    );
  }, [database, executeOperation]);

  const searchProducts = useCallback((searchTerm) => {
    return executeOperation(
      () => database.searchProducts(searchTerm),
      { 
        errorMessage: 'Failed to search products',
        showErrors: false
      }
    );
  }, [database, executeOperation]);

  // Invoice operations
  const createInvoice = useCallback((invoice) => {
    return executeOperation(
      () => database.createInvoice(invoice),
      { 
        errorMessage: 'Failed to create invoice',
        successMessage: 'Invoice created successfully'
      }
    );
  }, [database, executeOperation]);

  const addInvoiceItem = useCallback((item) => {
    return executeOperation(
      () => database.addInvoiceItem(item),
      { 
        errorMessage: 'Failed to add invoice item',
        showErrors: false
      }
    );
  }, [database, executeOperation]);

  const getInvoice = useCallback((id) => {
    return executeOperation(
      () => database.getInvoice(id),
      { 
        errorMessage: 'Failed to load invoice',
        showErrors: false
      }
    );
  }, [database, executeOperation]);

  const getInvoiceItems = useCallback((invoiceId) => {
    return executeOperation(
      () => database.getInvoiceItems(invoiceId),
      { 
        errorMessage: 'Failed to load invoice items',
        showErrors: false
      }
    );
  }, [database, executeOperation]);

  const updateInvoice = useCallback((id, invoiceData) => {
    return executeOperation(
      () => database.updateInvoice(id, invoiceData),
      { 
        errorMessage: 'Failed to update invoice',
        successMessage: 'Invoice updated successfully'
      }
    );
  }, [database, executeOperation]);

  const deleteInvoice = useCallback((id) => {
    return executeOperation(
      () => database.deleteInvoice(id),
      { 
        errorMessage: 'Failed to delete invoice',
        successMessage: 'Invoice deleted successfully'
      }
    );
  }, [database, executeOperation]);

  const getInvoicesByPeriod = useCallback((startDate, endDate) => {
    return executeOperation(
      () => database.getInvoicesByPeriod(startDate, endDate),
      { 
        errorMessage: 'Failed to load invoices',
        showErrors: false
      }
    );
  }, [database, executeOperation]);

  // Analytics operations
  const getSalesAnalytics = useCallback((startDate, endDate) => {
    return executeOperation(
      () => database.getSalesAnalytics(startDate, endDate),
      { 
        errorMessage: 'Failed to load sales analytics',
        showErrors: false
      }
    );
  }, [database, executeOperation]);

  const getProfitAnalytics = useCallback((startDate, endDate) => {
    return executeOperation(
      () => database.getProfitAnalytics(startDate, endDate),
      { 
        errorMessage: 'Failed to load profit analytics',
        showErrors: false
      }
    );
  }, [database, executeOperation]);

  const getTopProducts = useCallback((startDate, endDate, limit) => {
    return executeOperation(
      () => database.getTopProducts(startDate, endDate, limit),
      { 
        errorMessage: 'Failed to load top products',
        showErrors: false
      }
    );
  }, [database, executeOperation]);

  return {
    loading,
    error,
    addProduct,
    updateProduct,
    findProductByBarcode,
    findProductById,
    getAllProducts,
    searchProducts,
    createInvoice,
    addInvoiceItem,
    getInvoice,
    getInvoiceItems,
    updateInvoice,
    deleteInvoice,
    getInvoicesByPeriod,
    getSalesAnalytics,
    getProfitAnalytics,
    getTopProducts
  };
};

export default useDatabase;