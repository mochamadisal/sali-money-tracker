/**
 * Google Sheets Service
 * Handles all interactions with Google Sheets API
 * Separate sheets for Expenses and Income
 */

const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const { config } = require('../config');

// Sheet headers
const EXPENSE_HEADERS = ['Timestamp', 'Purchase Date', 'Item', 'Amount', 'Category'];
const INCOME_HEADERS = ['Timestamp', 'Date', 'Income Source', 'Description/Invoice No.', 'Income Amount'];

let doc = null;
let expenseSheet = null;
let incomeSheet = null;

/**
 * Initialize Google Sheets connection
 */
async function initializeSheets() {
  try {
    // Create JWT client
    const serviceAccountAuth = new JWT({
      email: config.google.serviceAccountEmail,
      key: config.google.privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // Initialize document
    doc = new GoogleSpreadsheet(config.google.spreadsheetId, serviceAccountAuth);
    await doc.loadInfo();

    console.log(`Connected to spreadsheet: ${doc.title}`);

    // Setup Expenses sheet
    expenseSheet = doc.sheetsByTitle['Expenses'];
    if (!expenseSheet) {
      console.log('Creating new sheet: Expenses');
      expenseSheet = await doc.addSheet({
        title: 'Expenses',
        headerValues: EXPENSE_HEADERS,
      });
    } else {
      await expenseSheet.loadHeaderRow();
      if (expenseSheet.headerValues.length === 0) {
        await expenseSheet.setHeaderRow(EXPENSE_HEADERS);
      }
    }
    console.log('✅ Expenses sheet ready');

    // Setup Income sheet
    incomeSheet = doc.sheetsByTitle['Income'];
    if (!incomeSheet) {
      console.log('Creating new sheet: Income');
      incomeSheet = await doc.addSheet({
        title: 'Income',
        headerValues: INCOME_HEADERS,
      });
    } else {
      await incomeSheet.loadHeaderRow();
      if (incomeSheet.headerValues.length === 0) {
        await incomeSheet.setHeaderRow(INCOME_HEADERS);
      }
    }
    console.log('✅ Income sheet ready');

    return true;
  } catch (error) {
    console.error('Failed to initialize Google Sheets:', error.message);
    throw error;
  }
}

/**
 * Add expense row to Expenses sheet
 * @param {Object} expense - Expense data
 * @param {string} expense.timestamp - ISO timestamp
 * @param {string} expense.purchaseDate - Date in YYYY-MM-DD
 * @param {string} expense.item - Item description
 * @param {number} expense.amount - Amount
 * @param {string} expense.category - Category
 */
async function addExpense(expense) {
  if (!expenseSheet) {
    throw new Error('Google Sheets not initialized');
  }

  try {
    await expenseSheet.addRow({
      'Timestamp': expense.timestamp,
      'Purchase Date': expense.purchaseDate,
      'Item': expense.item,
      'Amount': expense.amount,
      'Category': expense.category,
    });

    return true;
  } catch (error) {
    console.error('Failed to add expense:', error.message);
    throw error;
  }
}

/**
 * Add income row to Income sheet
 * @param {Object} income - Income data
 * @param {string} income.timestamp - ISO timestamp
 * @param {string} income.date - Date in YYYY-MM-DD
 * @param {string} income.incomeSource - Income source (Workplace 1, 2, 3)
 * @param {string} income.description - Description or Invoice No.
 * @param {number} income.amount - Income amount
 */
async function addIncome(income) {
  if (!incomeSheet) {
    throw new Error('Google Sheets not initialized');
  }

  try {
    await incomeSheet.addRow({
      'Timestamp': income.timestamp,
      'Date': income.date,
      'Income Source': income.incomeSource,
      'Description/Invoice No.': income.description,
      'Income Amount': income.amount,
    });

    return true;
  } catch (error) {
    console.error('Failed to add income:', error.message);
    throw error;
  }
}

/**
 * Get summary of transactions
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Object} - Summary data with income, expenses, and balance
 */
async function getSummary(startDate = null, endDate = null) {
  if (!expenseSheet || !incomeSheet) {
    throw new Error('Google Sheets not initialized');
  }

  try {
    // Get expenses
    const expenseRows = await expenseSheet.getRows();
    const expensesByCategory = {};
    let totalExpenses = 0;

    for (const row of expenseRows) {
      const purchaseDate = row.get('Purchase Date');
      const amount = parseFloat(row.get('Amount')) || 0;
      const category = row.get('Category');

      // Filter by date if provided
      if (startDate && purchaseDate < startDate) continue;
      if (endDate && purchaseDate > endDate) continue;

      if (!expensesByCategory[category]) {
        expensesByCategory[category] = 0;
      }
      expensesByCategory[category] += amount;
      totalExpenses += amount;
    }

    // Get income
    const incomeRows = await incomeSheet.getRows();
    const incomeBySource = {};
    let totalIncome = 0;

    for (const row of incomeRows) {
      const date = row.get('Date');
      const amount = parseFloat(row.get('Income Amount')) || 0;
      const source = row.get('Income Source');

      // Filter by date if provided
      if (startDate && date < startDate) continue;
      if (endDate && date > endDate) continue;

      if (!incomeBySource[source]) {
        incomeBySource[source] = 0;
      }
      incomeBySource[source] += amount;
      totalIncome += amount;
    }

    return {
      expenses: expensesByCategory,
      income: incomeBySource,
      totalExpenses,
      totalIncome,
      balance: totalIncome - totalExpenses,
    };
  } catch (error) {
    console.error('Failed to get summary:', error.message);
    throw error;
  }
}

/**
 * Get monthly report
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {Object} - Monthly report data
 */
async function getMonthlyReport(year, month) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

  return getSummary(startDate, endDate);
}

/**
 * Get all expenses for a date range
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {Array} - List of expenses
 */
async function getExpenses(startDate = null, endDate = null) {
  if (!expenseSheet) {
    throw new Error('Google Sheets not initialized');
  }

  try {
    const rows = await expenseSheet.getRows();
    const expenses = [];

    for (const row of rows) {
      const purchaseDate = row.get('Purchase Date');

      // Filter by date if provided
      if (startDate && purchaseDate < startDate) continue;
      if (endDate && purchaseDate > endDate) continue;

      expenses.push({
        timestamp: row.get('Timestamp'),
        purchaseDate: row.get('Purchase Date'),
        item: row.get('Item'),
        amount: parseFloat(row.get('Amount')) || 0,
        category: row.get('Category'),
      });
    }

    return expenses;
  } catch (error) {
    console.error('Failed to get expenses:', error.message);
    throw error;
  }
}

/**
 * Get all income for a date range
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {Array} - List of income
 */
async function getIncomeRecords(startDate = null, endDate = null) {
  if (!incomeSheet) {
    throw new Error('Google Sheets not initialized');
  }

  try {
    const rows = await incomeSheet.getRows();
    const incomeRecords = [];

    for (const row of rows) {
      const date = row.get('Date');

      // Filter by date if provided
      if (startDate && date < startDate) continue;
      if (endDate && date > endDate) continue;

      incomeRecords.push({
        timestamp: row.get('Timestamp'),
        date: row.get('Date'),
        incomeSource: row.get('Income Source'),
        description: row.get('Description/Invoice No.'),
        amount: parseFloat(row.get('Income Amount')) || 0,
      });
    }

    return incomeRecords;
  } catch (error) {
    console.error('Failed to get income records:', error.message);
    throw error;
  }
}

module.exports = {
  initializeSheets,
  addExpense,
  addIncome,
  getSummary,
  getMonthlyReport,
  getExpenses,
  getIncomeRecords,
};
