/**
 * Application Configuration
 * Loads and validates environment variables
 */

require('dotenv').config();

const config = {
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
  },
  google: {
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    sheetName: process.env.SHEET_NAME || 'Expenses',
  },
};

/**
 * Validate required configuration
 */
function validateConfig() {
  const required = [
    { key: 'TELEGRAM_BOT_TOKEN', value: config.telegram.botToken },
    { key: 'GOOGLE_SPREADSHEET_ID', value: config.google.spreadsheetId },
    { key: 'GOOGLE_SERVICE_ACCOUNT_EMAIL', value: config.google.serviceAccountEmail },
    { key: 'GOOGLE_PRIVATE_KEY', value: config.google.privateKey },
  ];

  const missing = required.filter(({ value }) => !value);

  if (missing.length > 0) {
    const missingKeys = missing.map(({ key }) => key).join(', ');
    throw new Error(`Missing required environment variables: ${missingKeys}`);
  }
}

module.exports = { config, validateConfig };
