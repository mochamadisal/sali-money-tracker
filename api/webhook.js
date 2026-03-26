/**
 * Vercel Serverless Function - Telegram Webhook
 * This handles incoming updates from Telegram
 */

const { Telegraf } = require('telegraf');
const { initializeSheets } = require('../src/services/googleSheets');
const {
  handleStart,
  handleHelp,
  handleCategories,
  handleIncomeCommand,
  handleExpenseCommand,
  handleSummary,
  handleMonthly,
  handleBalance,
  handleCancel,
  handleMessage,
  handleConfirmSave,
  handleConfirmCancel,
  handleEditItem,
  handleEditCategory,
  handleEditAmount,
  handleEditDescription,
  handleEditSource,
} = require('../src/bot/handlers');

// Initialize bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Flag to track initialization
let isInitialized = false;

// Setup bot commands and handlers
function setupBot() {
  // Commands
  bot.command('start', handleStart);
  bot.command('help', handleHelp);
  bot.command('categories', handleCategories);
  bot.command('income', handleIncomeCommand);
  bot.command('expense', handleExpenseCommand);
  bot.command('summary', handleSummary);
  bot.command('monthly', handleMonthly);
  bot.command('balance', handleBalance);
  bot.command('cancel', handleCancel);

  // Callback queries (inline buttons)
  bot.action('confirm_save', handleConfirmSave);
  bot.action('confirm_cancel', handleConfirmCancel);
  bot.action('edit_item', handleEditItem);
  bot.action('edit_category', handleEditCategory);
  bot.action('edit_amount', handleEditAmount);
  bot.action('edit_description', handleEditDescription);
  bot.action('edit_source', handleEditSource);

  // Text messages
  bot.on('text', handleMessage);

  // Error handling
  bot.catch((err, ctx) => {
    console.error(`Error for ${ctx.updateType}:`, err);
  });
}

// Initialize once
setupBot();

/**
 * Vercel serverless handler
 */
module.exports = async (req, res) => {
  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      res.status(200).json({ status: 'Bot is running! Use POST for webhook.' });
      return;
    }

    // Initialize Google Sheets (only once per cold start)
    if (!isInitialized) {
      await initializeSheets();
      isInitialized = true;
      console.log('Google Sheets initialized');
    }

    // Process the update
    await bot.handleUpdate(req.body);

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
