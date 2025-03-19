import React, { useContext } from 'react';
import { Backdrop, CircularProgress, Typography, Box } from '@mui/material';
import UIContext from '../../contexts/UIContext';

/**
 * Global Loading component
 * Shows a fullscreen loading indicator
 */
const Loading = () => {
  const { isLoading } = useContext(UIContext);

  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        flexDirection: 'column',
        gap: 2
      }}
      open={isLoading}
    >
      <CircularProgress color="primary" size={60} thickness={4} />
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" component="div">
          Loading...
        </Typography>
      </Box>
    </Backdrop>
  );
};

export default Loading;