import React, { useContext } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import UIContext from '../../contexts/UIContext';

/**
 * Global Dialog component
 * Shows dialogs and modal windows
 */
const AppDialog = () => {
  const { dialog, hideDialog } = useContext(UIContext);
  const { open, title, content, actions, maxWidth } = dialog;
  
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClose = () => {
    hideDialog();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth
      fullScreen={fullScreen}
      aria-labelledby="dialog-title"
      PaperProps={{
        elevation: 4,
        sx: {
          borderRadius: { xs: 0, sm: '12px' },
          p: { xs: 1, sm: 2 }
        }
      }}
    >
      <DialogTitle id="dialog-title" sx={{ pb: 1 }}>
        <Typography variant="h5" component="div" fontWeight="medium">
          {title}
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 1 }}>
        {typeof content === 'string' ? (
          <Typography variant="body1">{content}</Typography>
        ) : (
          content
        )}
      </DialogContent>
      
      <DialogActions sx={{ 
        padding: theme.spacing(2),
        flexDirection: { xs: 'column', sm: 'row' },
        '& > :not(:first-of-type)': {
          ml: { xs: 0, sm: 2 },
          mt: { xs: 1, sm: 0 }
        }
      }}>
        {actions.map((action, index) => (
          <Button
            key={index}
            onClick={action.handler || handleClose}
            color={action.color || 'primary'}
            variant={action.variant || 'text'}
            fullWidth={fullScreen}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            {action.text}
          </Button>
        ))}
        
        {actions.length === 0 && (
          <Button 
            onClick={handleClose} 
            color="primary"
            fullWidth={fullScreen}
          >
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AppDialog;