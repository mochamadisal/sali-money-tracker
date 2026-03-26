/**
 * Message Parser
 * Extracts expense data from natural language input
 */

const { normalizeCategory } = require('./categories');

/**
 * Parse expense message into structured data
 * Supports formats:
 * - "beli makan category food 15000"
 * - "netflix subscription 50000"
 * - "gojek 25000 transport"
 * - "15000 makan food"
 *
 * @param {string} message - User message
 * @returns {Object} - Parsed expense data
 */
function parseExpenseMessage(message) {
  if (!message || typeof message !== 'string') {
    return { success: false, error: 'Message is empty' };
  }

  const originalMessage = message.trim();
  let text = originalMessage.toLowerCase();

  // Result object
  const result = {
    success: false,
    item: null,
    category: null,
    amount: null,
    errors: [],
  };

  // Extract amount (find numbers, supports formats: 15000, 15.000, 15,000)
  const amountMatch = text.match(/\b(\d{1,3}(?:[.,]\d{3})*|\d+)\b/g);
  if (amountMatch) {
    // Get the largest number as amount (usually the price)
    const amounts = amountMatch.map(a => parseInt(a.replace(/[.,]/g, ''), 10));
    result.amount = Math.max(...amounts);

    // Remove amount from text for easier parsing
    text = text.replace(/\b(\d{1,3}(?:[.,]\d{3})*|\d+)\b/g, ' ').trim();
  }

  // Common category keywords to look for
  const categoryKeywords = ['category', 'cat', 'kategori', 'kat'];

  // Try to find category with keyword prefix
  let categoryFound = null;
  for (const keyword of categoryKeywords) {
    const regex = new RegExp(`${keyword}\\s+([\\w&\\s]+?)(?:\\s+\\d|$)`, 'i');
    const match = text.match(regex);
    if (match) {
      const potentialCategory = normalizeCategory(match[1].trim());
      if (potentialCategory) {
        categoryFound = potentialCategory;
        text = text.replace(match[0], ' ').trim();
        break;
      }
    }
  }

  // If no category found with keyword, try to detect from context
  if (!categoryFound) {
    // Split text into words and check each for category match
    const words = text.split(/\s+/);
    for (let i = 0; i < words.length; i++) {
      // Try single word
      let potentialCategory = normalizeCategory(words[i]);

      // Try two words (e.g., "food drink")
      if (!potentialCategory && i < words.length - 1) {
        potentialCategory = normalizeCategory(`${words[i]} ${words[i + 1]}`);
        if (potentialCategory) {
          words.splice(i, 2); // Remove both words
          categoryFound = potentialCategory;
          break;
        }
      }

      if (potentialCategory) {
        categoryFound = potentialCategory;
        words.splice(i, 1); // Remove category word from text
        break;
      }
    }
    text = words.join(' ');
  }

  result.category = categoryFound;

  // Clean up text to get item description
  // Remove common noise words
  const noiseWords = ['category', 'cat', 'kategori', 'kat', 'rp', 'idr'];
  let itemText = text
    .split(/\s+/)
    .filter(word => !noiseWords.includes(word.toLowerCase()))
    .join(' ')
    .trim();

  // If item is empty, use original message minus amount and category
  if (!itemText) {
    itemText = originalMessage
      .replace(/\b(\d{1,3}(?:[.,]\d{3})*|\d+)\b/g, '')
      .replace(/category\s+\w+/gi, '')
      .replace(/kategori\s+\w+/gi, '')
      .trim();
  }

  // Capitalize first letter of item
  if (itemText) {
    result.item = itemText.charAt(0).toUpperCase() + itemText.slice(1);
  }

  // Validate results
  if (!result.amount) {
    result.errors.push('amount');
  }
  if (!result.category) {
    result.errors.push('category');
  }
  if (!result.item) {
    result.errors.push('item');
  }

  result.success = result.errors.length === 0;

  return result;
}

/**
 * Format amount to Indonesian Rupiah
 * @param {number} amount - Amount
 * @returns {string} - Formatted amount
 */
function formatAmount(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get current timestamp in WIB (UTC+7) format: M/D/YYYY H:MM:SS
 * @returns {string} - Formatted timestamp
 */
function getTimestamp() {
  const now = new Date();

  // Convert to WIB (UTC+7)
  const wibOffset = 7 * 60; // 7 hours in minutes
  const utcOffset = now.getTimezoneOffset(); // local offset in minutes
  const wibTime = new Date(now.getTime() + (utcOffset + wibOffset) * 60000);

  const month = wibTime.getMonth() + 1;
  const day = wibTime.getDate();
  const year = wibTime.getFullYear();
  const hours = wibTime.getHours();
  const minutes = wibTime.getMinutes().toString().padStart(2, '0');
  const seconds = wibTime.getSeconds().toString().padStart(2, '0');

  return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
}

/**
 * Get current date in WIB (UTC+7) format: M/D/YYYY
 * @returns {string} - Date string
 */
function getPurchaseDate() {
  const now = new Date();

  // Convert to WIB (UTC+7)
  const wibOffset = 7 * 60;
  const utcOffset = now.getTimezoneOffset();
  const wibTime = new Date(now.getTime() + (utcOffset + wibOffset) * 60000);

  const month = wibTime.getMonth() + 1;
  const day = wibTime.getDate();
  const year = wibTime.getFullYear();

  return `${month}/${day}/${year}`;
}

module.exports = {
  parseExpenseMessage,
  formatAmount,
  getTimestamp,
  getPurchaseDate,
};
