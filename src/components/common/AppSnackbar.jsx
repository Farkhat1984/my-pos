import React, { useContext } from 'react';
import { Snackbar, Alert } from '@mui/material';
import UIContext from '../../contexts/UIContext';

/**
 * Global Snackbar component
 * Displays messages and alerts
 */
const AppSnackbar = () => {
  const { snackbar, hideSnackbar } = useContext(UIContext);
  const { open, message, severity, autoHideDuration } = snackbar;

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    hideSnackbar();
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{
        '& .MuiAlert-root': {
          width: '100%',
          maxWidth: 'calc(100% - 32px)',
          boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)',
          borderRadius: '24px',
        },
      }}
    >
      <Alert 
        onClose={handleClose} 
        severity={severity} 
        variant="filled"
        elevation={6}
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default AppSnackbar;