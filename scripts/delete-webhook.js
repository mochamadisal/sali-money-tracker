/**
 * Delete Telegram Webhook
 * Run this to switch back to polling mode for local development
 *
 * Usage: node scripts/delete-webhook.js
 */

require('dotenv').config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN not found in .env');
  process.exit(1);
}

async function deleteWebhook() {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`,
      { method: 'POST' }
    );

    const data = await response.json();

    if (data.ok) {
      console.log('✅ Webhook deleted successfully!');
      console.log('🔄 You can now use polling mode (npm start)');
    } else {
      console.error('❌ Failed to delete webhook:', data.description);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

deleteWebhook();
