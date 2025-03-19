/**
 * Validates a barcode
 * @param {string} barcode - The barcode to validate
 * @returns {boolean} - Whether the barcode is valid
 */
export const isValidBarcode = (barcode) => {
    // Check if barcode is not empty
    if (!barcode || barcode.trim() === '') {
      return false;
    }
    
    // Most barcodes are numeric or alphanumeric
    // This allows alphanumeric barcodes but requires at least one digit
    const hasDigit = /\d/.test(barcode);
    const isAlphanumeric = /^[a-zA-Z0-9]*$/.test(barcode);
    
    return hasDigit && isAlphanumeric;
  };
  
  /**
   * Validates a product name
   * @param {string} name - The product name to validate
   * @returns {boolean} - Whether the name is valid
   */
  export const isValidProductName = (name) => {
    return name && name.trim().length >= 2;
  };
  
  /**
   * Validates a price value
   * @param {number|string} price - The price to validate
   * @returns {boolean} - Whether the price is valid
   */
  export const isValidPrice = (price) => {
    const priceValue = parseFloat(price);
    return !isNaN(priceValue) && priceValue >= 0;
  };
  
  /**
   * Validates a quantity value
   * @param {number|string} quantity - The quantity to validate
   * @returns {boolean} - Whether the quantity is valid
   */
  export const isValidQuantity = (quantity) => {
    const quantityValue = parseInt(quantity);
    return !isNaN(quantityValue) && quantityValue >= 0;
  };
  
  /**
   * Validates a date value
   * @param {Date|string} date - The date to validate
   * @returns {boolean} - Whether the date is valid
   */
  export const isValidDate = (date) => {
    if (!date) return false;
    
    // Convert string dates to Date objects
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid and not in the future
    return dateObj instanceof Date && !isNaN(dateObj) && dateObj <= new Date();
  };
  
  /**
   * Validates an email address
   * @param {string} email - The email to validate
   * @returns {boolean} - Whether the email is valid
   */
  export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Validates a phone number
   * @param {string} phone - The phone number to validate
   * @returns {boolean} - Whether the phone number is valid
   */
  export const isValidPhone = (phone) => {
    // Basic validation - at least 10 digits
    const phoneDigits = phone.replace(/\D/g, '');
    return phoneDigits.length >= 10;
  };
  
  /**
   * Validates required fields in an object
   * @param {Object} data - The data object to validate
   * @param {Array<string>} requiredFields - Array of required field names
   * @returns {Object} - Validation result with isValid and errors
   */
  export const validateRequiredFields = (data, requiredFields) => {
    const errors = {};
    let isValid = true;
    
    requiredFields.forEach(field => {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        errors[field] = 'This field is required';
        isValid = false;
      }
    });
    
    return { isValid, errors };
  };
  
  /**
   * Validates a form with custom validation rules
   * @param {Object} data - The data object to validate
   * @param {Object} rules - Validation rules for each field
   * @returns {Object} - Validation result with isValid and errors
   */
  export const validateForm = (data, rules) => {
    const errors = {};
    let isValid = true;
    
    Object.keys(rules).forEach(field => {
      const fieldRules = rules[field];
      const value = data[field];
      
      // Required check
      if (fieldRules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        errors[field] = fieldRules.message || 'This field is required';
        isValid = false;
        return;
      }
      
      // Skip other validations if value is empty and not required
      if (!value && !fieldRules.required) {
        return;
      }
      
      // Custom validator function
      if (fieldRules.validator && typeof fieldRules.validator === 'function') {
        const isValidValue = fieldRules.validator(value);
        if (!isValidValue) {
          errors[field] = fieldRules.message || 'Invalid value';
          isValid = false;
        }
      }
      
      // Minimum length check
      if (fieldRules.minLength && value.length < fieldRules.minLength) {
        errors[field] = fieldRules.message || `Minimum length is ${fieldRules.minLength}`;
        isValid = false;
      }
      
      // Maximum length check
      if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
        errors[field] = fieldRules.message || `Maximum length is ${fieldRules.maxLength}`;
        isValid = false;
      }
      
      // Pattern match check
      if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
        errors[field] = fieldRules.message || 'Invalid format';
        isValid = false;
      }
    });
    
    return { isValid, errors };
  };