/**
 * Telegram Expense Tracker Bot
 * Main entry point
 */

const { config, validateConfig } = require('./config');
const { initializeSheets } = require('./services/googleSheets');
const { startBot } = require('./bot');

async function main() {
  console.log('🚀 Starting Expense Tracker Bot...\n');

  try {
    // Validate configuration
    console.log('⚙️  Validating configuration...');
    validateConfig();
    console.log('✅ Configuration valid\n');

    // Initialize Google Sheets
    console.log('📊 Connecting to Google Sheets...');
    await initializeSheets();
    console.log('✅ Google Sheets connected\n');

    // Start the bot
    console.log('🤖 Starting Telegram bot...');
    await startBot();
    console.log('\n✅ Bot is running and ready to receive messages!');
    console.log('Press Ctrl+C to stop.\n');

  } catch (error) {
    console.error('❌ Failed to start:', error.message);
    process.exit(1);
  }
}

main();
