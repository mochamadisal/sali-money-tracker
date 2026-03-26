/**
 * Category Constants and Normalization
 * Maps user input to standardized category names
 * Supports both Expense and Income categories
 */

// Expense categories
const EXPENSE_CATEGORIES = [
  'Bills',
  'Subscriptions',
  'Entertainment',
  'Food & Drink',
  'Groceries',
  'Health & Wellbeing',
  'Other',
  'Shopping',
  'Transport',
  'Travel',
  'Business',
  'Gifts',
];

// Income sources (for Income sheet)
const INCOME_SOURCES = [
  'Salary',
  'Freelance',
  'Religious Holiday Allowance',
  'Bonus',
];

// All categories (for backward compatibility)
const CATEGORIES = [...EXPENSE_CATEGORIES];

// Category aliases for normalization (supports Indonesian and English)
const CATEGORY_ALIASES = {
  // Bills
  'bills': 'Bills',
  'bill': 'Bills',
  'tagihan': 'Bills',
  'listrik': 'Bills',
  'pln': 'Bills',
  'air': 'Bills',
  'pdam': 'Bills',
  'internet': 'Bills',
  'wifi': 'Bills',

  // Subscriptions
  'subscriptions': 'Subscriptions',
  'subscription': 'Subscriptions',
  'subs': 'Subscriptions',
  'langganan': 'Subscriptions',
  'netflix': 'Subscriptions',
  'spotify': 'Subscriptions',
  'youtube': 'Subscriptions',

  // Entertainment
  'entertainment': 'Entertainment',
  'hiburan': 'Entertainment',
  'movie': 'Entertainment',
  'film': 'Entertainment',
  'game': 'Entertainment',
  'games': 'Entertainment',
  'bioskop': 'Entertainment',
  'cinema': 'Entertainment',
  'concert': 'Entertainment',
  'konser': 'Entertainment',

  // Food & Drink
  'food & drink': 'Food & Drink',
  'food and drink': 'Food & Drink',
  'food': 'Food & Drink',
  'drink': 'Food & Drink',
  'makan': 'Food & Drink',
  'makanan': 'Food & Drink',
  'minuman': 'Food & Drink',
  'minum': 'Food & Drink',
  'restaurant': 'Food & Drink',
  'resto': 'Food & Drink',
  'cafe': 'Food & Drink',
  'kopi': 'Food & Drink',
  'coffee': 'Food & Drink',
  'jajan': 'Food & Drink',
  'snack': 'Food & Drink',
  'lunch': 'Food & Drink',
  'dinner': 'Food & Drink',
  'breakfast': 'Food & Drink',
  'sarapan': 'Food & Drink',

  // Groceries
  'groceries': 'Groceries',
  'grocery': 'Groceries',
  'belanja': 'Groceries',
  'supermarket': 'Groceries',
  'pasar': 'Groceries',
  'sembako': 'Groceries',
  'indomaret': 'Groceries',
  'alfamart': 'Groceries',

  // Health & Wellbeing
  'health & wellbeing': 'Health & Wellbeing',
  'health and wellbeing': 'Health & Wellbeing',
  'health': 'Health & Wellbeing',
  'kesehatan': 'Health & Wellbeing',
  'obat': 'Health & Wellbeing',
  'dokter': 'Health & Wellbeing',
  'doctor': 'Health & Wellbeing',
  'pharmacy': 'Health & Wellbeing',
  'apotek': 'Health & Wellbeing',
  'gym': 'Health & Wellbeing',
  'fitness': 'Health & Wellbeing',
  'olahraga': 'Health & Wellbeing',
  'hospital': 'Health & Wellbeing',
  'rumah sakit': 'Health & Wellbeing',

  // Other
  'other': 'Other',
  'lainnya': 'Other',
  'lain': 'Other',
  'misc': 'Other',
  'miscellaneous': 'Other',

  // Shopping
  'shopping': 'Shopping',
  'shop': 'Shopping',
  'clothes': 'Shopping',
  'baju': 'Shopping',
  'pakaian': 'Shopping',
  'shoes': 'Shopping',
  'sepatu': 'Shopping',
  'electronics': 'Shopping',
  'elektronik': 'Shopping',
  'gadget': 'Shopping',

  // Transport
  'transport': 'Transport',
  'transportation': 'Transport',
  'transportasi': 'Transport',
  'ojol': 'Transport',
  'ojek': 'Transport',
  'gojek': 'Transport',
  'grab': 'Transport',
  'taxi': 'Transport',
  'taksi': 'Transport',
  'bus': 'Transport',
  'kereta': 'Transport',
  'train': 'Transport',
  'mrt': 'Transport',
  'krl': 'Transport',
  'bensin': 'Transport',
  'fuel': 'Transport',
  'parkir': 'Transport',
  'parking': 'Transport',
  'tol': 'Transport',
  'toll': 'Transport',

  // Travel
  'travel': 'Travel',
  'traveling': 'Travel',
  'travelling': 'Travel',
  'liburan': 'Travel',
  'vacation': 'Travel',
  'holiday': 'Travel',
  'hotel': 'Travel',
  'flight': 'Travel',
  'pesawat': 'Travel',
  'tiket': 'Travel',

  // Business
  'business': 'Business',
  'bisnis': 'Business',
  'kerja': 'Business',
  'work': 'Business',
  'kantor': 'Business',
  'office': 'Business',

  // Gifts
  'gifts': 'Gifts',
  'gift': 'Gifts',
  'kado': 'Gifts',
  'hadiah': 'Gifts',
  'present': 'Gifts',
  'sumbangan': 'Gifts',
  'donation': 'Gifts',
  'donasi': 'Gifts',
};

// Income source aliases
const INCOME_SOURCE_ALIASES = {
  'Salary': 'Salary',
  'salary': 'Salary',
  'gaji': 'Salary',
  '1': 'Salary',

  'Freelance': 'Freelance',
  'freelance': 'Freelance',
  'sampingan': 'Freelance',
  '2': 'Freelance',

  'Religious Holiday Allowance': 'Religious Holiday Allowance',
  'religious holiday allowance': 'Religious Holiday Allowance',
  'thr': 'Religious Holiday Allowance',
  '3': 'Religious Holiday Allowance',

  'Bonus': 'Bonus',
  'bonus': 'Bonus',
  '4': 'Bonus',
};

// Keywords that indicate income
const INCOME_KEYWORDS = [
  'income', 'pemasukan', 'pendapatan', 'salary', 'gaji',
  'freelance', 'bonus', 'commission', 'komisi', 'dividen',
  'dividend', 'investment', 'investasi', 'refund', 'cashback',
  'transfer', 'kiriman', 'side hustle', 'project', 'proyek',
  'honor', 'honorarium', 'thr', 'allowance', 'tunjangan', 'thr'
];

/**
 * Check if message contains income keywords
 * @param {string} message - User message
 * @returns {boolean}
 */
function isIncomeMessage(message) {
  if (!message) return false;
  const lower = message.toLowerCase();
  return INCOME_KEYWORDS.some(keyword => lower.includes(keyword));
}

/**
 * Normalize category input to standard category name
 * @param {string} input - User input category
 * @returns {string|null} - Normalized category or null if not found
 */
function normalizeCategory(input) {
  if (!input) return null;

  const normalized = input.toLowerCase().trim();

  // Check exact match first
  const exactMatch = EXPENSE_CATEGORIES.find(
    cat => cat.toLowerCase() === normalized
  );
  if (exactMatch) return exactMatch;

  // Check aliases
  if (CATEGORY_ALIASES[normalized]) {
    return CATEGORY_ALIASES[normalized];
  }

  // Partial match - check if input contains or is contained in category
  const partialMatch = EXPENSE_CATEGORIES.find(
    cat => cat.toLowerCase().includes(normalized) ||
           normalized.includes(cat.toLowerCase())
  );
  if (partialMatch) return partialMatch;

  return null;
}

/**
 * Normalize income source input
 * @param {string} input - User input
 * @returns {string|null} - Normalized income source or null
 */
function normalizeIncomeSource(input) {
  if (!input) return null;

  const normalized = input.toLowerCase().trim();

  // Check exact match first
  const exactMatch = INCOME_SOURCES.find(
    src => src.toLowerCase() === normalized
  );
  if (exactMatch) return exactMatch;

  // Check aliases
  if (INCOME_SOURCE_ALIASES[normalized]) {
    return INCOME_SOURCE_ALIASES[normalized];
  }

  return null;
}

/**
 * Get formatted list of expense categories
 * @returns {string} - Formatted category list
 */
function getExpenseCategoryList() {
  return EXPENSE_CATEGORIES.map((cat, index) => `${index + 1}. ${cat}`).join('\n');
}

/**
 * Get formatted list of income sources
 * @returns {string} - Formatted income source list
 */
function getIncomeSourceList() {
  return INCOME_SOURCES.map((src, index) => `${index + 1}. ${src}`).join('\n');
}

/**
 * Get formatted list of all categories
 * @returns {string} - Formatted category list
 */
function getCategoryList() {
  let list = '*Expense Categories:*\n';
  list += getExpenseCategoryList();
  list += '\n\n*Income Sources:*\n';
  list += getIncomeSourceList();
  return list;
}

module.exports = {
  CATEGORIES,
  EXPENSE_CATEGORIES,
  INCOME_SOURCES,
  CATEGORY_ALIASES,
  INCOME_SOURCE_ALIASES,
  INCOME_KEYWORDS,
  isIncomeMessage,
  normalizeCategory,
  normalizeIncomeSource,
  getCategoryList,
  getExpenseCategoryList,
  getIncomeSourceList,
};
