/**
 * Bot Handlers
 * Handles all Telegram bot commands and messages
 * Separate flows for Income and Expense
 */

const { Markup } = require('telegraf');
const { parseExpenseMessage, formatAmount, getTimestamp, getPurchaseDate } = require('../utils/parser');
const {
  normalizeCategory,
  normalizeIncomeSource,
  getCategoryList,
  EXPENSE_CATEGORIES,
  INCOME_SOURCES,
  isIncomeMessage,
  getIncomeSourceList,
} = require('../utils/categories');
const { addExpense, addIncome, getSummary, getMonthlyReport } = require('../services/googleSheets');

// Store pending transactions per user
const pendingTransactions = new Map();

// User states for multi-step input
const userStates = new Map();

/**
 * Handle /start command
 */
async function handleStart(ctx) {
  const welcomeMessage = `
🎉 *Welcome to Finance Tracker Bot!*

I help you track your *expenses* and *income*, saving them to separate Google Sheets tabs.

*📤 Add Expense:*
\`beli makan category food 15000\`
\`netflix subscription 50000\`

*📥 Add Income:*
\`gaji 5000000\`
\`freelance project 750000\`
\`bonus 1000000\`

*Commands:*
/help - Show help
/summary - Income vs Expenses
/monthly - Monthly report
/categories - All categories
/balance - Quick balance
/income - Add income manually
/expense - Add expense manually

${getCategoryList()}
`.trim();

  await ctx.replyWithMarkdown(welcomeMessage);
}

/**
 * Handle /help command
 */
async function handleHelp(ctx) {
  const helpMessage = `
📖 *Finance Tracker Help*

*Adding Expenses:*
\`beli kopi category food 25000\`
\`gojek transport 15000\`

*Adding Income:*
Use income keywords like: gaji, salary, freelance, bonus, income
\`gaji 5000000\`
\`freelance project 750000\`

*Income Sources:*
${getIncomeSourceList()}

*Commands:*
/income - Add income (step by step)
/expense - Add expense (step by step)
/summary - Total income vs expenses
/monthly - Monthly report
/balance - Quick balance check
/categories - List all categories
/cancel - Cancel current operation

*Tips:*
• Income keywords: gaji, salary, freelance, bonus, income, thr
• Income is saved to "Income" sheet
• Expenses saved to "Expenses" sheet
`.trim();

  await ctx.replyWithMarkdown(helpMessage);
}

/**
 * Handle /categories command
 */
async function handleCategories(ctx) {
  const message = `
📂 *Available Categories:*

${getCategoryList()}

*Expense Aliases:*
• \`food\` → Food & Drink
• \`transport\` → Transport
• \`makan\` → Food & Drink

*Income Aliases:*
• \`wp1\` or \`1\` → Workplace 1
• \`wp2\` or \`2\` → Workplace 2
• \`wp3\` or \`3\` → Workplace 3
`.trim();

  await ctx.replyWithMarkdown(message);
}

/**
 * Handle /income command - manual income entry
 */
async function handleIncomeCommand(ctx) {
  const userId = ctx.from.id;

  pendingTransactions.set(userId, { type: 'income' });
  userStates.set(userId, { step: 'income_description' });

  await ctx.reply('📥 *Add Income*\n\nEnter description or invoice number:', { parse_mode: 'Markdown' });
}

/**
 * Handle /expense command - manual expense entry
 */
async function handleExpenseCommand(ctx) {
  const userId = ctx.from.id;

  pendingTransactions.set(userId, { type: 'expense' });
  userStates.set(userId, { step: 'expense_item' });

  await ctx.reply('📤 *Add Expense*\n\nWhat did you buy?', { parse_mode: 'Markdown' });
}

/**
 * Handle /summary command
 */
async function handleSummary(ctx) {
  try {
    await ctx.reply('📊 Calculating summary...');

    const { expenses, income, totalExpenses, totalIncome, balance } = await getSummary();

    if (Object.keys(expenses).length === 0 && Object.keys(income).length === 0) {
      await ctx.reply('No transactions recorded yet.');
      return;
    }

    let message = '📊 *Financial Summary (All Time)*\n\n';

    // Income section
    if (Object.keys(income).length > 0) {
      message += '💰 *INCOME*\n';
      const sortedIncome = Object.entries(income).sort((a, b) => b[1] - a[1]);
      for (const [source, amount] of sortedIncome) {
        message += `• ${source}: ${formatAmount(amount)}\n`;
      }
      message += `*Total Income:* ${formatAmount(totalIncome)}\n\n`;
    }

    // Expenses section
    if (Object.keys(expenses).length > 0) {
      message += '💸 *EXPENSES*\n';
      const sortedExpenses = Object.entries(expenses).sort((a, b) => b[1] - a[1]);
      for (const [category, amount] of sortedExpenses) {
        const percentage = ((amount / totalExpenses) * 100).toFixed(1);
        message += `• ${category}: ${formatAmount(amount)} (${percentage}%)\n`;
      }
      message += `*Total Expenses:* ${formatAmount(totalExpenses)}\n\n`;
    }

    // Balance
    const balanceEmoji = balance >= 0 ? '✅' : '⚠️';
    const balanceLabel = balance >= 0 ? 'Surplus' : 'Deficit';
    message += `━━━━━━━━━━━━━━━━━━\n`;
    message += `${balanceEmoji} *Net Balance (${balanceLabel}):* ${formatAmount(Math.abs(balance))}`;

    await ctx.replyWithMarkdown(message);
  } catch (error) {
    console.error('Summary error:', error);
    await ctx.reply('❌ Failed to get summary. Please try again.');
  }
}

/**
 * Handle /monthly command
 */
async function handleMonthly(ctx) {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    await ctx.reply('📅 Calculating monthly report...');

    const { expenses, income, totalExpenses, totalIncome, balance } = await getMonthlyReport(year, month);

    if (Object.keys(expenses).length === 0 && Object.keys(income).length === 0) {
      await ctx.reply('No transactions recorded this month.');
      return;
    }

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    let message = `📅 *Monthly Report - ${monthNames[month - 1]} ${year}*\n\n`;

    // Income section
    if (Object.keys(income).length > 0) {
      message += '💰 *INCOME*\n';
      const sortedIncome = Object.entries(income).sort((a, b) => b[1] - a[1]);
      for (const [source, amount] of sortedIncome) {
        message += `• ${source}: ${formatAmount(amount)}\n`;
      }
      message += `*Total Income:* ${formatAmount(totalIncome)}\n\n`;
    }

    // Expenses section
    if (Object.keys(expenses).length > 0) {
      message += '💸 *EXPENSES*\n';
      const sortedExpenses = Object.entries(expenses).sort((a, b) => b[1] - a[1]);
      for (const [category, amount] of sortedExpenses) {
        const percentage = totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0;
        message += `• ${category}: ${formatAmount(amount)} (${percentage}%)\n`;
      }
      message += `*Total Expenses:* ${formatAmount(totalExpenses)}\n\n`;
    }

    // Balance
    const balanceEmoji = balance >= 0 ? '✅' : '⚠️';
    const balanceLabel = balance >= 0 ? 'Surplus' : 'Deficit';
    message += `━━━━━━━━━━━━━━━━━━\n`;
    message += `${balanceEmoji} *Net Balance (${balanceLabel}):* ${formatAmount(Math.abs(balance))}`;

    await ctx.replyWithMarkdown(message);
  } catch (error) {
    console.error('Monthly report error:', error);
    await ctx.reply('❌ Failed to get monthly report. Please try again.');
  }
}

/**
 * Handle /balance command
 */
async function handleBalance(ctx) {
  try {
    const { totalExpenses, totalIncome, balance } = await getSummary();

    const balanceEmoji = balance >= 0 ? '✅' : '⚠️';
    const balanceStatus = balance >= 0 ? 'Surplus' : 'Deficit';

    const message = `
💰 *Quick Balance*

📥 Income: ${formatAmount(totalIncome)}
📤 Expenses: ${formatAmount(totalExpenses)}
━━━━━━━━━━━━━━━━━━
${balanceEmoji} *${balanceStatus}:* ${formatAmount(Math.abs(balance))}
`.trim();

    await ctx.replyWithMarkdown(message);
  } catch (error) {
    console.error('Balance error:', error);
    await ctx.reply('❌ Failed to get balance. Please try again.');
  }
}

/**
 * Handle /cancel command
 */
async function handleCancel(ctx) {
  const userId = ctx.from.id;
  pendingTransactions.delete(userId);
  userStates.delete(userId);
  await ctx.reply('❌ Operation cancelled.');
}

/**
 * Handle text messages
 */
async function handleMessage(ctx) {
  const userId = ctx.from.id;
  const message = ctx.message.text;

  // Check if user is in a state (answering questions)
  const state = userStates.get(userId);
  if (state) {
    await handleUserState(ctx, state, message);
    return;
  }

  // Check if this is an income message
  if (isIncomeMessage(message)) {
    await handleIncomeInput(ctx, message);
    return;
  }

  // Otherwise treat as expense
  await handleExpenseInput(ctx, message);
}

/**
 * Handle income input
 */
async function handleIncomeInput(ctx, message) {
  const userId = ctx.from.id;

  // Extract amount from message
  const amountMatch = message.match(/\b(\d{1,3}(?:[.,]\d{3})*|\d+)\b/g);
  let amount = null;
  if (amountMatch) {
    const amounts = amountMatch.map(a => parseInt(a.replace(/[.,]/g, ''), 10));
    amount = Math.max(...amounts);
  }

  // Extract description (remove numbers and common keywords)
  let description = message
    .replace(/\b(\d{1,3}(?:[.,]\d{3})*|\d+)\b/g, '')
    .replace(/\b(income|gaji|salary|bonus|freelance|pemasukan|pendapatan|thr|honor|komisi|tunjangan)\b/gi, '')
    .trim();

  if (description) {
    description = description.charAt(0).toUpperCase() + description.slice(1);
  }

  // Save partial data and ask for missing info
  pendingTransactions.set(userId, {
    type: 'income',
    description: description || null,
    amount: amount,
    incomeSource: null,
  });

  if (!amount) {
    userStates.set(userId, { step: 'income_amount' });
    await ctx.reply('💰 Enter income amount:');
    return;
  }

  // Ask for income source
  userStates.set(userId, { step: 'income_source' });
  await askForIncomeSource(ctx);
}

/**
 * Handle expense input
 */
async function handleExpenseInput(ctx, message) {
  const userId = ctx.from.id;
  const parsed = parseExpenseMessage(message);

  if (parsed.errors.length > 0) {
    pendingTransactions.set(userId, {
      type: 'expense',
      item: parsed.item,
      category: parsed.category,
      amount: parsed.amount,
    });

    if (parsed.errors.includes('amount')) {
      userStates.set(userId, { step: 'expense_amount' });
      await ctx.reply('💰 How much did you spend?');
      return;
    }

    if (parsed.errors.includes('category')) {
      userStates.set(userId, { step: 'expense_category' });
      await askForCategory(ctx);
      return;
    }

    if (parsed.errors.includes('item')) {
      userStates.set(userId, { step: 'expense_item' });
      await ctx.reply('📝 What did you buy?');
      return;
    }
  }

  // All fields present, ask for confirmation
  await askExpenseConfirmation(ctx, {
    item: parsed.item,
    category: parsed.category,
    amount: parsed.amount,
  });
}

/**
 * Handle user state (multi-step input)
 */
async function handleUserState(ctx, state, message) {
  const userId = ctx.from.id;
  const pending = pendingTransactions.get(userId) || {};

  switch (state.step) {
    // Income steps
    case 'income_description': {
      pending.description = message.trim();
      pendingTransactions.set(userId, pending);
      userStates.set(userId, { step: 'income_amount' });
      await ctx.reply('💰 Enter income amount:');
      break;
    }

    case 'income_amount': {
      const amount = parseInt(message.replace(/[.,\s]/g, ''), 10);
      if (isNaN(amount) || amount <= 0) {
        await ctx.reply('❌ Please enter a valid amount.');
        return;
      }
      pending.amount = amount;
      pendingTransactions.set(userId, pending);
      userStates.set(userId, { step: 'income_source' });
      await askForIncomeSource(ctx);
      break;
    }

    case 'income_source': {
      const source = normalizeIncomeSource(message);
      if (!source) {
        await ctx.reply('❌ Please select a valid income source.');
        await askForIncomeSource(ctx);
        return;
      }
      pending.incomeSource = source;
      pendingTransactions.set(userId, pending);

      // Check if description is missing
      if (!pending.description) {
        userStates.set(userId, { step: 'income_description_final' });
        await ctx.reply('📝 Enter description or invoice number:');
        return;
      }

      userStates.delete(userId);
      await askIncomeConfirmation(ctx, pending);
      break;
    }

    case 'income_description_final': {
      pending.description = message.trim() || 'No description';
      pendingTransactions.set(userId, pending);
      userStates.delete(userId);
      await askIncomeConfirmation(ctx, pending);
      break;
    }

    // Expense steps
    case 'expense_item': {
      pending.item = message.trim().charAt(0).toUpperCase() + message.trim().slice(1);
      pendingTransactions.set(userId, pending);

      if (!pending.amount) {
        userStates.set(userId, { step: 'expense_amount' });
        await ctx.reply('💰 How much did you spend?');
        return;
      }
      if (!pending.category) {
        userStates.set(userId, { step: 'expense_category' });
        await askForCategory(ctx);
        return;
      }
      userStates.delete(userId);
      await askExpenseConfirmation(ctx, pending);
      break;
    }

    case 'expense_amount': {
      const amount = parseInt(message.replace(/[.,\s]/g, ''), 10);
      if (isNaN(amount) || amount <= 0) {
        await ctx.reply('❌ Please enter a valid amount.');
        return;
      }
      pending.amount = amount;
      pendingTransactions.set(userId, pending);

      if (!pending.category) {
        userStates.set(userId, { step: 'expense_category' });
        await askForCategory(ctx);
        return;
      }
      if (!pending.item) {
        userStates.set(userId, { step: 'expense_item' });
        await ctx.reply('📝 What did you buy?');
        return;
      }
      userStates.delete(userId);
      await askExpenseConfirmation(ctx, pending);
      break;
    }

    case 'expense_category': {
      const category = normalizeCategory(message);
      if (!category) {
        await ctx.reply('❌ Category not recognized.');
        await askForCategory(ctx);
        return;
      }
      pending.category = category;
      pendingTransactions.set(userId, pending);

      if (!pending.item) {
        userStates.set(userId, { step: 'expense_item' });
        await ctx.reply('📝 What did you buy?');
        return;
      }
      if (!pending.amount) {
        userStates.set(userId, { step: 'expense_amount' });
        await ctx.reply('💰 How much did you spend?');
        return;
      }
      userStates.delete(userId);
      await askExpenseConfirmation(ctx, pending);
      break;
    }

    default:
      userStates.delete(userId);
  }
}

/**
 * Ask for income source
 */
async function askForIncomeSource(ctx) {
  const buttons = INCOME_SOURCES.map(src => [src]);

  await ctx.reply(
    '📂 Select income source:',
    Markup.keyboard(buttons).oneTime().resize()
  );
}

/**
 * Ask for expense category
 */
async function askForCategory(ctx) {
  const buttons = [];
  for (let i = 0; i < EXPENSE_CATEGORIES.length; i += 2) {
    const row = [EXPENSE_CATEGORIES[i]];
    if (EXPENSE_CATEGORIES[i + 1]) {
      row.push(EXPENSE_CATEGORIES[i + 1]);
    }
    buttons.push(row);
  }

  await ctx.reply(
    '📂 Select a category:',
    Markup.keyboard(buttons).oneTime().resize()
  );
}

/**
 * Ask for income confirmation
 */
async function askIncomeConfirmation(ctx, income) {
  const userId = ctx.from.id;
  pendingTransactions.set(userId, { ...income, type: 'income' });

  const confirmMessage = `
📥 *Save this INCOME?*

🏢 *Source*: ${income.incomeSource}
📝 *Description*: ${income.description || 'No description'}
💰 *Amount*: ${formatAmount(income.amount)}
📅 *Date*: ${getPurchaseDate()}
`.trim();

  await ctx.replyWithMarkdown(
    confirmMessage,
    Markup.inlineKeyboard([
      [
        Markup.button.callback('✅ Yes, Save', 'confirm_save'),
        Markup.button.callback('❌ Cancel', 'confirm_cancel'),
      ],
      [
        Markup.button.callback('✏️ Edit Description', 'edit_description'),
        Markup.button.callback('🏢 Edit Source', 'edit_source'),
      ],
      [
        Markup.button.callback('💰 Edit Amount', 'edit_amount'),
      ],
    ])
  );
}

/**
 * Ask for expense confirmation
 */
async function askExpenseConfirmation(ctx, expense) {
  const userId = ctx.from.id;
  pendingTransactions.set(userId, { ...expense, type: 'expense' });

  const confirmMessage = `
📤 *Save this EXPENSE?*

📦 *Item*: ${expense.item}
📂 *Category*: ${expense.category}
💰 *Amount*: ${formatAmount(expense.amount)}
📅 *Date*: ${getPurchaseDate()}
`.trim();

  await ctx.replyWithMarkdown(
    confirmMessage,
    Markup.inlineKeyboard([
      [
        Markup.button.callback('✅ Yes, Save', 'confirm_save'),
        Markup.button.callback('❌ Cancel', 'confirm_cancel'),
      ],
      [
        Markup.button.callback('✏️ Edit Item', 'edit_item'),
        Markup.button.callback('📂 Edit Category', 'edit_category'),
      ],
      [
        Markup.button.callback('💰 Edit Amount', 'edit_amount'),
      ],
    ])
  );
}

/**
 * Handle confirmation save
 */
async function handleConfirmSave(ctx) {
  const userId = ctx.from.id;
  const transaction = pendingTransactions.get(userId);

  if (!transaction) {
    await ctx.answerCbQuery('No pending transaction found.');
    return;
  }

  try {
    await ctx.answerCbQuery('Saving...');
    await ctx.editMessageText('⏳ Saving to Google Sheets...');

    if (transaction.type === 'income') {
      await addIncome({
        timestamp: getTimestamp(),
        date: getPurchaseDate(),
        incomeSource: transaction.incomeSource,
        description: transaction.description || 'No description',
        amount: transaction.amount,
      });

      await ctx.editMessageText(
        `✅ *Income saved!*\n\n` +
        `📥 Income\n` +
        `🏢 ${transaction.incomeSource}\n` +
        `📝 ${transaction.description || 'No description'}\n` +
        `💰 ${formatAmount(transaction.amount)}`,
        { parse_mode: 'Markdown' }
      );
    } else {
      await addExpense({
        timestamp: getTimestamp(),
        purchaseDate: getPurchaseDate(),
        item: transaction.item,
        amount: transaction.amount,
        category: transaction.category,
      });

      await ctx.editMessageText(
        `✅ *Expense saved!*\n\n` +
        `📤 Expense\n` +
        `📦 ${transaction.item}\n` +
        `📂 ${transaction.category}\n` +
        `💰 ${formatAmount(transaction.amount)}`,
        { parse_mode: 'Markdown' }
      );
    }

    pendingTransactions.delete(userId);
    userStates.delete(userId);
  } catch (error) {
    console.error('Save error:', error);
    await ctx.editMessageText('❌ Failed to save. Please try again.');
  }
}

/**
 * Handle confirmation cancel
 */
async function handleConfirmCancel(ctx) {
  const userId = ctx.from.id;
  pendingTransactions.delete(userId);
  userStates.delete(userId);

  await ctx.answerCbQuery('Cancelled');
  await ctx.editMessageText('❌ Transaction cancelled.');
}

/**
 * Handle edit callbacks
 */
async function handleEditItem(ctx) {
  const userId = ctx.from.id;
  userStates.set(userId, { step: 'expense_item' });
  await ctx.answerCbQuery();
  await ctx.reply('📝 Enter new item description:');
}

async function handleEditCategory(ctx) {
  const userId = ctx.from.id;
  userStates.set(userId, { step: 'expense_category' });
  await ctx.answerCbQuery();
  await askForCategory(ctx);
}

async function handleEditAmount(ctx) {
  const userId = ctx.from.id;
  const pending = pendingTransactions.get(userId) || {};

  if (pending.type === 'income') {
    userStates.set(userId, { step: 'income_amount' });
  } else {
    userStates.set(userId, { step: 'expense_amount' });
  }

  await ctx.answerCbQuery();
  await ctx.reply('💰 Enter new amount:');
}

async function handleEditDescription(ctx) {
  const userId = ctx.from.id;
  userStates.set(userId, { step: 'income_description_final' });
  await ctx.answerCbQuery();
  await ctx.reply('📝 Enter new description:');
}

async function handleEditSource(ctx) {
  const userId = ctx.from.id;
  userStates.set(userId, { step: 'income_source' });
  await ctx.answerCbQuery();
  await askForIncomeSource(ctx);
}

module.exports = {
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
};
