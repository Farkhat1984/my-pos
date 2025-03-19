import React, { createContext, useState, useCallback } from 'react';

// Create the context
export const UIContext = createContext();

/**
 * UI Context Provider
 * Provides UI state and methods for snackbars, dialogs, etc.
 */
export const UIProvider = ({ children }) => {
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info', // 'success', 'info', 'warning', 'error'
    autoHideDuration: 3000
  });

  // Dialog state
  const [dialog, setDialog] = useState({
    open: false,
    title: '',
    content: '',
    actions: [], // Array of { text, handler, color }
    maxWidth: 'sm'
  });

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Show a snackbar message
   * @param {string} message - Message to display
   * @param {string} severity - Severity level: 'success', 'info', 'warning', 'error'
   * @param {number} duration - Auto-hide duration in milliseconds
   */
  const showSnackbar = useCallback((message, severity = 'info', duration = 3000) => {
    setSnackbar({
      open: true,
      message,
      severity,
      autoHideDuration: duration
    });
  }, []);

  /**
   * Hide the snackbar
   */
  const hideSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  /**
   * Show a dialog
   * @param {string} title - Dialog title
   * @param {string|React.ReactNode} content - Dialog content
   * @param {Array} actions - Array of { text, handler, color, variant }
   * @param {string} maxWidth - Max width: 'xs', 'sm', 'md', 'lg', 'xl'
   */
  const showDialog = useCallback((title, content, actions = [], maxWidth = 'sm') => {
    setDialog({
      open: true,
      title,
      content,
      actions,
      maxWidth
    });
  }, []);

  /**
   * Hide the dialog
   */
  const hideDialog = useCallback(() => {
    setDialog(prev => ({ ...prev, open: false }));
  }, []);

  /**
   * Show a confirmation dialog
   * @param {string} title - Dialog title
   * @param {string|React.ReactNode} content - Dialog content
   * @param {Function} onConfirm - Function to call when confirmed
   * @param {Function} onCancel - Function to call when cancelled
   * @param {string} confirmText - Text for the confirm button
   * @param {string} cancelText - Text for the cancel button
   */
  const showConfirmDialog = useCallback((
    title,
    content,
    onConfirm,
    onCancel = () => {},
    confirmText = 'Confirm',
    cancelText = 'Cancel'
  ) => {
    const actions = [
      {
        text: cancelText,
        handler: () => {
          hideDialog();
          onCancel();
        },
        color: 'inherit',
        variant: 'outlined'
      },
      {
        text: confirmText,
        handler: () => {
          hideDialog();
          onConfirm();
        },
        color: 'primary',
        variant: 'contained'
      }
    ];
    
    showDialog(title, content, actions);
  }, [showDialog, hideDialog]);

  /**
   * Show a delete confirmation dialog
   * @param {string} title - Dialog title
   * @param {string|React.ReactNode} content - Dialog content
   * @param {Function} onConfirm - Function to call when confirmed
   */
  const showDeleteDialog = useCallback((
    title = 'Confirm Deletion',
    content = 'Are you sure you want to delete this item? This action cannot be undone.',
    onConfirm
  ) => {
    const actions = [
      {
        text: 'Cancel',
        handler: hideDialog,
        color: 'inherit',
        variant: 'outlined'
      },
      {
        text: 'Delete',
        handler: () => {
          hideDialog();
          onConfirm();
        },
        color: 'error',
        variant: 'contained'
      }
    ];
    
    showDialog(title, content, actions);
  }, [showDialog, hideDialog]);

  /**
   * Set loading state
   * @param {boolean} loading - Loading state
   */
  const setLoading = useCallback((loading) => {
    setIsLoading(loading);
  }, []);

  // Provide the context value
  const value = {
    // Snackbar
    snackbar,
    showSnackbar,
    hideSnackbar,
    
    // Dialog
    dialog,
    showDialog,
    hideDialog,
    showConfirmDialog,
    showDeleteDialog,
    
    // Loading
    isLoading,
    setLoading
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export default UIContext;