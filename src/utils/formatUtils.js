/**
 * Format a date to a readable string
 * @param {string|Date} date - Date to format
 * @param {string} formatType - Format type: 'date', 'datetime', 'time'
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, formatType = 'date') => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Format options
    const options = {
      date: { day: '2-digit', month: '2-digit', year: 'numeric' },
      datetime: { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' },
      time: { hour: '2-digit', minute: '2-digit' }
    };
    
    return dateObj.toLocaleDateString('ru-RU', options[formatType] || options.date);
  };
  
  /**
   * Format currency value
   * @param {number} value - Value to format
   * @param {string} currency - Currency symbol
   * @returns {string} - Formatted currency string
   */
  export const formatCurrency = (value, currency = '₸') => {
    return `${Number(value).toFixed(2)} ${currency}`;
  };
  
  /**
   * Format a number with thousands separators
   * @param {number} value - Value to format
   * @returns {string} - Formatted number
   */
  export const formatNumber = (value) => {
    return Number(value).toLocaleString();
  };
  
  /**
   * Format a percentage value
   * @param {number} value - Value to format (0-100)
   * @param {number} decimals - Number of decimal places
   * @returns {string} - Formatted percentage
   */
  export const formatPercent = (value, decimals = 1) => {
    return `${Number(value).toFixed(decimals)}%`;
  };
  
  /**
   * Format a file size in bytes to human-readable format
   * @param {number} bytes - Size in bytes
   * @returns {string} - Formatted size (e.g., '1.5 MB')
   */
  export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };
  
  /**
   * Format a phone number
   * @param {string} phone - Phone number
   * @returns {string} - Formatted phone number
   */
  export const formatPhone = (phone) => {
    if (!phone) return '';
    
    // Simple formatting example - adjust as needed for your region
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 11) {
      return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
    }
    
    return phone;
  };
  
  /**
   * Truncate a string if it's too long
   * @param {string} str - String to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} - Truncated string
   */
  export const truncateString = (str, maxLength = 50) => {
    if (!str || str.length <= maxLength) return str;
    return `${str.slice(0, maxLength)}...`;
  };