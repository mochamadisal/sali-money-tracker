/**
 * Set Telegram Webhook
 * Run this after deploying to Vercel
 *
 * Usage: node scripts/set-webhook.js <VERCEL_URL>
 * Example: node scripts/set-webhook.js https://your-app.vercel.app
 */

require('dotenv').config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const VERCEL_URL = process.argv[2];

if (!VERCEL_URL) {
  console.error('❌ Please provide your Vercel URL');
  console.error('Usage: node scripts/set-webhook.js https://your-app.vercel.app');
  process.exit(1);
}

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN not found in .env');
  process.exit(1);
}

const WEBHOOK_URL = `${VERCEL_URL}/api/webhook`;

async function setWebhook() {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: WEBHOOK_URL,
          allowed_updates: ['message', 'callback_query'],
        }),
      }
    );

    const data = await response.json();

    if (data.ok) {
      console.log('✅ Webhook set successfully!');
      console.log(`📌 Webhook URL: ${WEBHOOK_URL}`);
    } else {
      console.error('❌ Failed to set webhook:', data.description);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function getWebhookInfo() {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`
    );
    const data = await response.json();
    console.log('\n📊 Current Webhook Info:');
    console.log(JSON.stringify(data.result, null, 2));
  } catch (error) {
    console.error('❌ Error getting webhook info:', error.message);
  }
}

setWebhook().then(getWebhookInfo);
