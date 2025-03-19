import React, { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import apiClient from '../services/apiClient';

// Create the context
export const AuthContext = createContext();

/**
 * Authentication Context Provider
 * Provides authentication state and methods to all child components
 */
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Initialize the auth service
        authService.initialize();
        
        // Check if user is authenticated
        const isAuth = authService.isAuthenticated();
        setIsAuthenticated(isAuth);
        
        // Get user data if authenticated
        if (isAuth) {
          const userData = authService.getUserData();
          setUser(userData);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError('Failed to initialize authentication');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Listen for auth error events
  useEffect(() => {
    const handleAuthError = () => {
      logout();
    };

    window.addEventListener('auth-error', handleAuthError);
    
    return () => {
      window.removeEventListener('auth-error', handleAuthError);
    };
  }, []);

  /**
   * Login user with credentials
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise<boolean>} - Success status
   */
  const login = useCallback(async (username, password) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const success = await authService.login(username, password);
      
      if (success) {
        setIsAuthenticated(true);
        setUser(authService.getUserData());
        return true;
      } else {
        setError('Invalid username or password');
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  // Provide the auth context value
  const value = {
    isAuthenticated,
    user,
    isLoading,
    error,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;