/**
 * API Client for communicating with the backend server
 * Modified to work without an actual API server
 */
class ApiClient {
  constructor() {
    // Default API base URL (not used in local mode)
    this.baseUrl = 'http://leema.kz';
    this.authToken = null;
    
    // Local mode flag - set to true to bypass API calls
    this.localMode = true;
    
    // Local database of sample products (for barcode lookups)
    this.sampleProducts = [
      { barcode: '4607027662161', sku_name: 'Milk 3.2%' },
      { barcode: '4607027662987', sku_name: 'Cheese 45%' },
      { barcode: '4607027661123', sku_name: 'Bread White' },
      { barcode: '4607027664526', sku_name: 'Eggs 10pcs' },
      { barcode: '4607027662345', sku_name: 'Yogurt Strawberry' },
      { barcode: '4607027664981', sku_name: 'Water 1.5L' },
      { barcode: '4607027663782', sku_name: 'Juice Orange 1L' },
      { barcode: '4607027665698', sku_name: 'Chocolate Dark' },
      { barcode: '4607027661999', sku_name: 'Coffee 250g' },
      { barcode: '4607027663456', sku_name: 'Tea Black 25 bags' }
    ];
  }

  /**
   * Set the API base URL
   * @param {string} url - The base URL for API requests
   */
  setBaseUrl(url) {
    this.baseUrl = url;
  }

  /**
   * Set the authentication token
   * @param {string} token - The auth token to use for requests
   */
  setAuthToken(token) {
    this.authToken = token;
  }

  /**
   * Get default headers for API requests
   * @returns {Object} - Headers object
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (this.authToken) {
      headers['X-API-Key'] = this.authToken;
      console.log("Token passed in X-API-Key header:", this.authToken.substring(0, 20) + "...");
    } else {
      console.warn("Token not set! Request will be made without authorization.");
    }

    return headers;
  }

  /**
   * Show error in the console
   * @param {string} message - Error message to display
   */
  logError(message) {
    console.error(message);
  }

  /**
   * Make an API request or simulate a response in local mode
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} - Response data
   */
  async apiRequest(endpoint, options = {}) {
    // In local mode, simulate API responses
    if (this.localMode) {
      return this.simulateApiResponse(endpoint, options);
    }
    
    // Real API call logic
    const url = this.baseUrl + endpoint;
    const isProductLookup = endpoint.includes('/products/by-barcode/');

    const fetchOptions = {
      headers: this.getHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, fetchOptions);
      console.log(`API Response [${response.status}]:`, url);

      if (response.status === 200) {
        return await response.json();
      } else if (response.status === 404) {
        return null;
      } else if (response.status === 401 || response.status === 403) {
        this.logError(`Authorization error (${response.status}). Please login again.`);

        if (!isProductLookup) {
          localStorage.removeItem('auth_token');
          window.dispatchEvent(new CustomEvent('auth-error'));
        }

        return null;
      } else {
        this.logError(`API Error: ${response.status}`);
        return null;
      }
    } catch (error) {
      this.logError(`Connection error: ${error.message}`);
      return null;
    }
  }

  /**
   * Simulate API responses for local mode
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - Simulated response
   */
  async simulateApiResponse(endpoint, options = {}) {
    // Add a slight delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log(`Local API Simulation: ${endpoint}`, options);
    
    // Handle different endpoints
    if (endpoint.includes('/products/by-barcode/')) {
      // Extract barcode from endpoint
      const barcode = endpoint.split('/').pop();
      return this.getLocalProduct(barcode);
    }
    
    if (endpoint === '/auth/token' && options.method === 'POST') {
      // This is handled by authService now
      return null;
    }
    
    // Default response for unhandled endpoints
    console.warn(`Unhandled endpoint in local mode: ${endpoint}`);
    return null;
  }

  /**
   * Get a product by barcode from the local sample data
   * @param {string} barcode - Product barcode
   * @returns {Object|null} - Product data or null if not found
   */
  getLocalProduct(barcode) {
    const product = this.sampleProducts.find(p => p.barcode === barcode);
    
    console.log(`Local product lookup for barcode ${barcode}:`, product);
    
    return product || null;
  }

  /**
   * Get a product by barcode
   * @param {string} barcode - Product barcode
   * @returns {Promise<Object|null>} - Product data or null if not found
   */
  async getProduct(barcode) {
    const data = await this.apiRequest(`/products/by-barcode/${barcode}`, {
      method: 'GET'
    });

    if (data) {
      // Map the API response to the format we expect
      return {
        barcode: data.barcode,
        name: data.sku_name
      };
    }

    return null;
  }

  /**
   * Login user and get auth token
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise<Object|null>} - Auth data or null if login failed
   */
  async login(username, password) {
    const data = await this.apiRequest('/auth/token', {
      method: 'POST',
      body: JSON.stringify({
        username,
        password
      })
    });

    if (data && data.access_token) {
      this.setAuthToken(data.access_token);
      return {
        token: data.access_token,
        user: data.user || { username }
      };
    }

    return null;
  }
  
  /**
   * Add a product to the local sample database
   * @param {Object} product - Product data
   */
  addLocalProduct(product) {
    if (!product.barcode || !product.sku_name) {
      console.error('Invalid product data');
      return;
    }
    
    // Check if product already exists
    const existingProduct = this.sampleProducts.find(p => p.barcode === product.barcode);
    
    if (existingProduct) {
      console.warn(`Product with barcode ${product.barcode} already exists`);
      return;
    }
    
    // Add to sample products
    this.sampleProducts.push({
      barcode: product.barcode,
      sku_name: product.sku_name
    });
    
    console.log('Added product to local database:', product);
  }
}

// Create a singleton instance
const apiClient = new ApiClient();

export default apiClient;