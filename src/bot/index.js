/**
 * Telegram Bot
 * Main bot initialization and setup
 * Separate sheets for Income and Expenses
 */

const { Telegraf } = require('telegraf');
const { config } = require('../config');
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
} = require('./handlers');

/**
 * Create and configure the bot
 */
function createBot() {
  const bot = new Telegraf(config.telegram.botToken);

  // Error handling
  bot.catch((err, ctx) => {
    console.error(`Error for ${ctx.updateType}:`, err);
    ctx.reply('❌ An error occurred. Please try again.').catch(() => {});
  });

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

  // Text messages (expense/income input)
  bot.on('text', handleMessage);

  return bot;
}

/**
 * Start the bot
 */
async function startBot() {
  const bot = createBot();

  // Graceful shutdown
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));

  // Start polling
  await bot.launch();
  console.log('🤖 Bot is running!');

  return bot;
}

module.exports = { createBot, startBot };
