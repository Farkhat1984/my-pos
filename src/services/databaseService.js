import { openDB } from 'idb';

const DB_NAME = 'pos_web_app';
const DB_VERSION = 1;

/**
 * Database Service for offline data storage using IndexedDB
 */
class DatabaseService {
  constructor() {
    this.db = null;
    this.dbPromise = this.initDatabase();
  }

  /**
   * Initialize the database and create object stores
   */
  async initDatabase() {
    try {
      const db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Products store
          if (!db.objectStoreNames.contains('products')) {
            const productsStore = db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
            productsStore.createIndex('barcode', 'barcode', { unique: true });
            productsStore.createIndex('name', 'name', { unique: false });
          }

          // Invoices store
          if (!db.objectStoreNames.contains('invoices')) {
            const invoicesStore = db.createObjectStore('invoices', { keyPath: 'id', autoIncrement: true });
            invoicesStore.createIndex('date', 'date', { unique: false });
            invoicesStore.createIndex('paymentStatus', 'paymentStatus', { unique: false });
          }

          // Invoice items store
          if (!db.objectStoreNames.contains('invoice_items')) {
            const invoiceItemsStore = db.createObjectStore('invoice_items', { keyPath: 'id', autoIncrement: true });
            invoiceItemsStore.createIndex('invoiceId', 'invoiceId', { unique: false });
            invoiceItemsStore.createIndex('productId', 'productId', { unique: false });
          }

          // Settings store
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'key' });
          }
        }
      });

      this.db = db;
      console.log('Database initialized successfully');
      return db;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Get the database instance, waiting for initialization if necessary
   */
  async getDb() {
    if (!this.db) {
      this.db = await this.dbPromise;
    }
    return this.db;
  }

  // Product Methods

  /**
   * Add a product to the database
   * @param {Object} product - Product data
   * @returns {Promise<number>} - ID of the added product
   */
  async addProduct(product) {
    const db = await this.getDb();
    
    // Add timestamps
    const now = new Date().toISOString();
    const productWithTimestamp = {
      ...product,
      createdAt: now,
      updatedAt: now
    };
    
    try {
      const id = await db.add('products', productWithTimestamp);
      return id;
    } catch (error) {
      if (error.name === 'ConstraintError') {
        throw new Error('Product with this barcode already exists');
      } else {
        throw error;
      }
    }
  }

  /**
   * Update a product in the database
   * @param {number} id - Product ID
   * @param {Object} productData - Updated product data
   * @returns {Promise<boolean>} - Success status
   */
  async updateProduct(id, productData) {
    const db = await this.getDb();
    
    try {
      // Get the current product
      const product = await db.get('products', id);
      
      if (!product) {
        throw new Error('Product not found');
      }
      
      // Update product data with timestamp
      const updatedProduct = {
        ...product,
        ...productData,
        updatedAt: new Date().toISOString()
      };
      
      await db.put('products', updatedProduct);
      return true;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  /**
   * Update product quantity
   * @param {number} id - Product ID
   * @param {number} quantity - New quantity
   * @returns {Promise<boolean>} - Success status
   */
  async updateProductQuantity(id, quantity) {
    return this.updateProduct(id, { quantity });
  }

  /**
   * Find a product by barcode
   * @param {string} barcode - Product barcode
   * @returns {Promise<Object|null>} - Product object or null if not found
   */
  async findProductByBarcode(barcode) {
    const db = await this.getDb();
    
    try {
      const index = db.transaction('products').store.index('barcode');
      const product = await index.get(barcode);
      return product || null;
    } catch (error) {
      console.error('Error finding product by barcode:', error);
      throw error;
    }
  }

  /**
   * Find a product by ID
   * @param {number} id - Product ID
   * @returns {Promise<Object|null>} - Product object or null if not found
   */
  async findProductById(id) {
    const db = await this.getDb();
    
    try {
      const product = await db.get('products', id);
      return product || null;
    } catch (error) {
      console.error('Error finding product by ID:', error);
      throw error;
    }
  }

  /**
   * Get all products
   * @param {string} sortBy - Field to sort by ('name', 'price', 'quantity')
   * @returns {Promise<Array>} - Array of products
   */
  async getAllProducts(sortBy = 'name') {
    const db = await this.getDb();
    
    try {
      const products = await db.getAll('products');
      
      // Sort products
      products.sort((a, b) => {
        if (sortBy === 'price') {
          return a.price - b.price;
        } else if (sortBy === 'quantity') {
          return a.quantity - b.quantity;
        } else {
          // Default sort by name
          return a.name.localeCompare(b.name);
        }
      });
      
      return products;
    } catch (error) {
      console.error('Error getting all products:', error);
      throw error;
    }
  }

  /**
   * Search products by name or barcode
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} - Array of matching products
   */
  async searchProducts(searchTerm) {
    const db = await this.getDb();
    
    try {
      const products = await db.getAll('products');
      
      // Filter products by name or barcode
      const filtered = products.filter(product => {
        const nameMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const barcodeMatch = product.barcode.includes(searchTerm);
        return nameMatch || barcodeMatch;
      });
      
      // Sort by name
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      
      return filtered;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  // Invoice Methods

  /**
   * Create a new invoice
   * @param {Object} invoice - Invoice data
   * @returns {Promise<number>} - ID of the created invoice
   */
  async createInvoice(invoice) {
    const db = await this.getDb();
    
    // Add date and created_at
    const now = new Date().toISOString();
    const invoiceWithTimestamp = {
      ...invoice,
      date: now,
      createdAt: now
    };
    
    try {
      const id = await db.add('invoices', invoiceWithTimestamp);
      return id;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  /**
   * Update an existing invoice
   * @param {number} id - Invoice ID
   * @param {Object} invoiceData - Updated invoice data
   * @returns {Promise<boolean>} - Success status
   */
  async updateInvoice(id, invoiceData) {
    const db = await this.getDb();
    
    try {
      // Get the current invoice
      const invoice = await db.get('invoices', id);
      
      if (!invoice) {
        throw new Error('Invoice not found');
      }
      
      // Update invoice data with timestamp
      const updatedInvoice = {
        ...invoice,
        ...invoiceData,
        updatedAt: new Date().toISOString()
      };
      
      await db.put('invoices', updatedInvoice);
      return true;
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  }

  /**
   * Add an item to an invoice
   * @param {Object} item - Invoice item data
   * @returns {Promise<number>} - ID of the added item
   */
  async addInvoiceItem(item) {
    const db = await this.getDb();
    
    try {
      const id = await db.add('invoice_items', item);
      return id;
    } catch (error) {
      console.error('Error adding invoice item:', error);
      throw error;
    }
  }

  /**
   * Delete all items for a specific invoice
   * @param {number} invoiceId - Invoice ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteInvoiceItems(invoiceId) {
    const db = await this.getDb();
    
    try {
      const tx = db.transaction('invoice_items', 'readwrite');
      const index = tx.store.index('invoiceId');
      
      // Get all keys for this invoice
      let cursor = await index.openKeyCursor(IDBKeyRange.only(invoiceId));
      
      // Delete each item
      while (cursor) {
        await tx.store.delete(cursor.primaryKey);
        cursor = await cursor.continue();
      }
      
      await tx.done;
      return true;
    } catch (error) {
      console.error('Error deleting invoice items:', error);
      throw error;
    }
  }

  /**
   * Get an invoice by ID
   * @param {number} id - Invoice ID
   * @returns {Promise<Object|null>} - Invoice object or null if not found
   */
  async getInvoice(id) {
    const db = await this.getDb();
    
    try {
      const invoice = await db.get('invoices', id);
      return invoice || null;
    } catch (error) {
      console.error('Error getting invoice:', error);
      throw error;
    }
  }

  /**
   * Get items for an invoice
   * @param {number} invoiceId - Invoice ID
   * @returns {Promise<Array>} - Array of invoice items
   */
  async getInvoiceItems(invoiceId) {
    const db = await this.getDb();
    
    try {
      const tx = db.transaction(['invoice_items', 'products']);
      const index = tx.objectStore('invoice_items').index('invoiceId');
      
      // Get all items for this invoice
      const items = await index.getAll(invoiceId);
      
      // Add product info to each item
      const itemsWithProductInfo = await Promise.all(items.map(async (item) => {
        try {
          const product = await tx.objectStore('products').get(item.productId);
          
          return {
            ...item,
            name: product ? product.name : 'Unknown Product',
            barcode: product ? product.barcode : ''
          };
        } catch (error) {
          return {
            ...item,
            name: 'Unknown Product',
            barcode: ''
          };
        }
      }));
      
      return itemsWithProductInfo;
    } catch (error) {
      console.error('Error getting invoice items:', error);
      throw error;
    }
  }

  /**
   * Get invoices by date range
   * @param {string} startDate - Start date (ISO string)
   * @param {string} endDate - End date (ISO string)
   * @returns {Promise<Array>} - Array of invoices
   */
  async getInvoicesByPeriod(startDate, endDate) {
    const db = await this.getDb();
    
    try {
      const invoices = await db.getAll('invoices');
      
      // Filter invoices by date range
      const filtered = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.date);
        return invoiceDate >= new Date(startDate) && invoiceDate <= new Date(endDate);
      });
      
      // Sort by date (newest first)
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      return filtered;
    } catch (error) {
      console.error('Error getting invoices by period:', error);
      throw error;
    }
  }

  /**
   * Delete an invoice
   * @param {number} id - Invoice ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteInvoice(id) {
    const db = await this.getDb();
    
    try {
      // Delete all items for this invoice
      await this.deleteInvoiceItems(id);
      
      // Delete the invoice
      await db.delete('invoices', id);
      return true;
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  }

  /**
   * Get sales analytics for a period
   * @param {string} startDate - Start date (ISO string)
   * @param {string} endDate - End date (ISO string)
   * @returns {Promise<Object>} - Sales analytics
   */
  async getSalesAnalytics(startDate, endDate) {
    try {
      const invoices = await this.getInvoicesByPeriod(startDate, endDate);
      
      if (invoices.length === 0) {
        return {
          totalSales: 0,
          invoiceCount: 0,
          averageInvoice: 0,
          paidAmount: 0,
          debtAmount: 0
        };
      }
      
      const totalSales = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
      const invoiceCount = invoices.length;
      const averageInvoice = totalSales / invoiceCount;
      
      const paidAmount = invoices
        .filter(invoice => invoice.paymentStatus === true)
        .reduce((sum, invoice) => sum + invoice.total, 0);
        
      const debtAmount = invoices
        .filter(invoice => invoice.paymentStatus === false)
        .reduce((sum, invoice) => sum + invoice.total, 0);
      
      return {
        totalSales,
        invoiceCount,
        averageInvoice,
        paidAmount,
        debtAmount
      };
    } catch (error) {
      console.error('Error getting sales analytics:', error);
      throw error;
    }
  }

  /**
   * Get profit analytics for a period
   * @param {string} startDate - Start date (ISO string)
   * @param {string} endDate - End date (ISO string)
   * @returns {Promise<Object>} - Profit analytics
   */
  async getProfitAnalytics(startDate, endDate) {
    try {
      const invoices = await this.getInvoicesByPeriod(startDate, endDate);
      
      if (invoices.length === 0) {
        return {
          revenue: 0,
          cost: 0,
          profit: 0
        };
      }
      
      let revenue = 0;
      let cost = 0;
      
      // For each invoice, calculate the total cost
      for (const invoice of invoices) {
        revenue += invoice.total;
        
        // Get items for this invoice
        const items = await this.getInvoiceItems(invoice.id);
        
        // Calculate cost for each item
        for (const item of items) {
          const product = await this.findProductById(item.productId);
          if (product) {
            cost += (product.costPrice || 0) * item.quantity;
          }
        }
      }
      
      const profit = revenue - cost;
      
      return {
        revenue,
        cost,
        profit
      };
    } catch (error) {
      console.error('Error getting profit analytics:', error);
      throw error;
    }
  }

  /**
   * Get top selling products for a period
   * @param {string} startDate - Start date (ISO string)
   * @param {string} endDate - End date (ISO string)
   * @param {number} limit - Number of products to return
   * @returns {Promise<Array>} - Top products
   */
  async getTopProducts(startDate, endDate, limit = 5) {
    try {
      const invoices = await this.getInvoicesByPeriod(startDate, endDate);
      
      if (invoices.length === 0) {
        return [];
      }
      
      const productSales = {};
      
      // For each invoice, get the items
      for (const invoice of invoices) {
        const items = await this.getInvoiceItems(invoice.id);
        
        // Aggregate sales by product
        for (const item of items) {
          const productId = item.productId;
          
          if (!productSales[productId]) {
            productSales[productId] = {
              productId,
              name: item.name,
              totalQuantity: 0,
              totalSales: 0
            };
          }
          
          productSales[productId].totalQuantity += item.quantity;
          productSales[productId].totalSales += item.total;
        }
      }
      
      // Convert to array and sort by total sales
      const topProducts = Object.values(productSales)
        .sort((a, b) => b.totalSales - a.totalSales)
        .slice(0, limit);
      
      return topProducts;
    } catch (error) {
      console.error('Error getting top products:', error);
      throw error;
    }
  }
}

// Create a singleton instance
const databaseService = new DatabaseService();

export default databaseService;