import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  CircularProgress,
  Avatar,
  Alert
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

import AuthContext from '../contexts/AuthContext';
import UIContext from '../contexts/UIContext';

/**
 * Login page component
 * Handles user authentication
 */
const Login = () => {
  const { login, isAuthenticated, isLoading: authLoading } = useContext(AuthContext);
  const { showSnackbar } = useContext(UIContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      showSnackbar('Please enter username and password', 'error');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await login(username, password);
      
      if (success) {
        showSnackbar('Login successful', 'success');
        // Redirect happens automatically due to the useEffect above
      } else {
        showSnackbar('Invalid username or password', 'error');
      }
    } catch (error) {
      showSnackbar(error.message || 'Login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Logo animation variants
  const logoVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  // Form animation variants
  const formVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5, delay: 0.2 }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 4
        }}
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={logoVariants}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 4
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                mb: 2
              }}
            >
              <LockIcon fontSize="large" />
            </Avatar>
            <Typography variant="h4" fontWeight="bold" textAlign="center" color="primary">
              POS System
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" textAlign="center">
              Sign in to your account
            </Typography>
          </Box>
        </motion.div>

        {/* Local Auth Alert */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ width: '100%', marginBottom: '16px' }}
        >
          <Alert 
            severity="info" 
            icon={<InfoIcon />}
            sx={{ mb: 2 }}
          >
            <Typography variant="body2">
              Using local authentication. Default users:
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              • Username: <strong>admin</strong>, Password: <strong>admin</strong>
            </Typography>
            <Typography variant="body2">
              • Username: <strong>user</strong>, Password: <strong>user</strong>
            </Typography>
          </Alert>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={formVariants}
          style={{ width: '100%' }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 2,
              width: '100%'
            }}
          >
            <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading || authLoading}
                sx={{ 
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
              >
                {(isLoading || authLoading) ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Sign In'
                )}
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Box>
    </Container>
  );
};

export default Login;