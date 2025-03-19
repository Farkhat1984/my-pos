import apiClient from './apiClient';

/**
 * Authentication service for user authentication and session management
 * Modified to support local authentication without API
 */
class AuthService {
  constructor() {
    // Storage keys
    this.AUTH_TOKEN_KEY = 'auth_token';
    this.USER_DATA_KEY = 'user_data';
    
    // Default local users (you can modify these)
    this.localUsers = [
      { username: 'admin', password: 'admin', role: 'admin' },
      { username: 'user', password: 'user', role: 'user' }
    ];
    
    // Flag to determine whether to use API or local auth
    this.useLocalAuth = true; // Set to true to use local auth
  }

  /**
   * Login user with credentials
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise<boolean>} - Success status
   */
  async login(username, password) {
    try {
      console.log(`Attempting login for user: ${username}`);
      
      if (this.useLocalAuth) {
        // Local authentication
        const user = this.localUsers.find(
          u => u.username === username && u.password === password
        );
        
        if (user) {
          // Generate a mock token
          const mockToken = btoa(`${username}:${Date.now()}`);
          
          // Store authentication data
          localStorage.setItem(this.AUTH_TOKEN_KEY, mockToken);
          
          // Store user data without the password
          const userData = { 
            username: user.username, 
            role: user.role 
          };
          localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData));
          
          // Set the token in API client (even though we're not using it)
          apiClient.setAuthToken(mockToken);
          
          console.log('Local login successful');
          return true;
        } else {
          console.log('Local login failed: Invalid credentials');
          return false;
        }
      } else {
        // API authentication (original code)
        const authData = await apiClient.login(username, password);
        
        if (authData && authData.token) {
          // Store authentication data
          localStorage.setItem(this.AUTH_TOKEN_KEY, authData.token);
          
          // Store user data
          const userData = authData.user || { username };
          localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData));
          
          // Set the token in API client
          apiClient.setAuthToken(authData.token);
          
          console.log('API login successful');
          return true;
        } else {
          console.log('API login failed: No token received');
          return false;
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }
  
  /**
   * Register a new local user
   * @param {Object} userData - User data with username and password
   * @returns {boolean} - Success status
   */
  registerLocalUser(userData) {
    if (!userData.username || !userData.password) {
      return false;
    }
    
    // Check if user already exists
    const existingUser = this.localUsers.find(u => u.username === userData.username);
    if (existingUser) {
      return false;
    }
    
    // Add new user
    this.localUsers.push({
      username: userData.username,
      password: userData.password,
      role: userData.role || 'user'
    });
    
    // Save to localStorage for persistence
    localStorage.setItem('local_users', JSON.stringify(this.localUsers));
    
    return true;
  }
  
  /**
   * Logout user
   */
  logout() {
    // Remove authentication data
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
    localStorage.removeItem(this.USER_DATA_KEY);
    
    // Clear token in API client
    apiClient.setAuthToken(null);
    
    console.log('User logged out');
  }
  
  /**
   * Check if user is authenticated
   * @returns {boolean} - Authentication status
   */
  isAuthenticated() {
    return !!localStorage.getItem(this.AUTH_TOKEN_KEY);
  }
  
  /**
   * Get authentication token
   * @returns {string|null} - Auth token or null if not authenticated
   */
  getToken() {
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }
  
  /**
   * Get user data
   * @returns {Object|null} - User data or null if not authenticated
   */
  getUserData() {
    const userData = localStorage.getItem(this.USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  }
  
  /**
   * Initialize authentication
   * Called when app starts
   */
  initialize() {
    // Set the token in API client if available
    const token = this.getToken();
    if (token) {
      apiClient.setAuthToken(token);
    }
    
    // Load local users from storage if they exist
    const savedUsers = localStorage.getItem('local_users');
    if (savedUsers) {
      try {
        this.localUsers = JSON.parse(savedUsers);
      } catch (error) {
        console.error('Error loading local users:', error);
      }
    }
    
    // Listen for authentication errors from the API client
    window.addEventListener('auth-error', () => {
      // Only clear if we're using API auth
      if (!this.useLocalAuth) {
        this.logout();
      }
    });
  }
  
  /**
   * Toggle between local and API authentication
   * @param {boolean} useLocal - Whether to use local auth
   */
  setUseLocalAuth(useLocal) {
    this.useLocalAuth = useLocal;
  }
}

// Create a singleton instance
const authService = new AuthService();

export default authService;