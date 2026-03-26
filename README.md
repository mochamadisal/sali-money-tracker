# Telegram Finance Tracker Bot

A Telegram bot that records both **expenses** and **income**, then saves them to Google Sheets. Supports natural language input in both English and Bahasa Indonesia.

## Features

- **Expense & Income Tracking**: Track both money in and money out
- **Natural Language Parsing**: Send transactions in plain text
- **Smart Category Detection**: Automatically recognizes categories from text
- **Multi-Language Support**: Works in English and Bahasa Indonesia
- **Confirmation Flow**: Review and edit before saving
- **Financial Reports**: View summaries, monthly reports, and net balance
- **Google Sheets Integration**: All data saved to spreadsheet

## Quick Start

### 1. Create Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` and follow the prompts
3. Copy the **Bot Token** (looks like `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Setup Google Sheets

#### Create Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
   ```

#### Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the **Google Sheets API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"
4. Create Service Account:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in details and click "Create"
   - Skip optional steps, click "Done"
5. Create Key:
   - Click on the service account you created
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Select "JSON" and download
6. Get credentials from downloaded JSON:
   - `client_email` → This is your service account email
   - `private_key` → This is your private key

#### Share Spreadsheet

1. Open your Google Spreadsheet
2. Click "Share" button
3. Add your service account email (from `client_email`)
4. Give "Editor" access
5. Click "Done"

### 3. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your values
```

Fill in your `.env`:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
SHEET_NAME=Expenses
```

> **Important**: The private key must include `\n` for newlines and be wrapped in quotes.

### 4. Install & Run

```bash
# Install dependencies
npm install

# Run the bot
npm start

# Or with auto-reload for development
npm run dev
```

## Usage

### Adding Expenses

Send messages in natural format:

```
beli makan category food 15000
netflix subscription 50000
gojek 25000 transport
kopi starbucks food 45000
```

### Adding Income

Use "income" as category or income-related keywords:

```
gaji category income 5000000
freelance income 750000
bonus 1000000 income
salary 8000000
```

The bot will:
1. Parse your message
2. Detect if it's Income or Expense
3. Show confirmation with detected values
4. Let you edit if needed
5. Save to Google Sheets on confirmation

### Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message and instructions |
| `/help` | Detailed help |
| `/categories` | List all categories |
| `/summary` | Total income vs expenses (all time) |
| `/monthly` | Current month's report |
| `/balance` | Quick balance check |
| `/cancel` | Cancel current operation |

### Supported Categories

#### Expense Categories

| Category | Aliases (EN) | Aliases (ID) |
|----------|--------------|--------------|
| Bills | bill, bills | tagihan, listrik, pln |
| Subscriptions | subscription, subs | langganan |
| Entertainment | entertainment | hiburan, film, bioskop |
| Food & Drink | food, drink, cafe | makan, minum, kopi, jajan |
| Groceries | grocery | belanja, supermarket, pasar |
| Health & Wellbeing | health, gym | kesehatan, obat, dokter |
| Other | other, misc | lainnya |
| Shopping | shop, clothes | beli, baju, sepatu |
| Transport | transport | transportasi, gojek, grab, ojol |
| Travel | travel, vacation | liburan, hotel, pesawat |
| Business | business, work | bisnis, kerja, kantor |
| Gifts | gift, present | kado, hadiah, donasi |

#### Income Category

| Category | Aliases (EN) | Aliases (ID) |
|----------|--------------|--------------|
| Income | salary, freelance, bonus, commission, dividend, refund, cashback | gaji, pendapatan, pemasukan, komisi, honor, tunjangan, thr |

## Example Conversations

### Expense Example
```
User: beli kopi category food 25000
Bot:  📝 Save this EXPENSE?
      📤 Type: Expense
      📦 Item: Beli kopi
      📂 Category: Food & Drink
      💰 Amount: Rp25.000
      📅 Date: 2024-01-15
      [Yes, Save] [Cancel]
User: [Clicks Yes, Save]
Bot:  ✅ Expense saved successfully!
```

### Income Example
```
User: gaji bulan januari income 8000000
Bot:  📝 Save this INCOME?
      📥 Type: Income
      📦 Item: Gaji bulan januari
      📂 Category: Income
      💰 Amount: Rp8.000.000
      📅 Date: 2024-01-15
      [Yes, Save] [Cancel]
User: [Clicks Yes, Save]
Bot:  ✅ Income saved successfully!
```

### Summary Example
```
User: /summary
Bot:  📊 Financial Summary (All Time)

      💰 INCOME
      • Income: Rp8.000.000
      Total Income: Rp8.000.000

      💸 EXPENSES
      • Food & Drink: Rp500.000 (50%)
      • Transport: Rp300.000 (30%)
      • Shopping: Rp200.000 (20%)
      Total Expenses: Rp1.000.000

      ━━━━━━━━━━━━━━━━━━
      ✅ Net Balance (Surplus): Rp7.000.000
```

### Balance Example
```
User: /balance
Bot:  💰 Quick Balance

      📥 Income: Rp8.000.000
      📤 Expenses: Rp1.000.000
      ━━━━━━━━━━━━━━━━━━
      ✅ Surplus: Rp7.000.000
```

## Google Sheets Structure

The bot creates/uses a sheet with these columns:

| Column | Format | Example |
|--------|--------|---------|
| Timestamp | ISO 8601 | 2024-01-15T14:30:00.000Z |
| Purchase Date | YYYY-MM-DD | 2024-01-15 |
| Item | Text | Beli kopi |
| Amount | Number | 25000 |
| Category | Text | Food & Drink |
| Type | Text | Expense / Income |

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Missing environment variables | `.env` not configured | Check all required vars are set |
| Google Sheets not accessible | Service account not shared | Share spreadsheet with service account email |
| Invalid private key | Key format wrong | Ensure key has `\n` newlines and is quoted |
| Bot not responding | Token invalid | Get new token from BotFather |

### Troubleshooting

1. **Bot doesn't respond**
   - Check bot token is correct
   - Ensure bot is started (`npm start`)
   - Check console for errors

2. **Google Sheets error**
   - Verify spreadsheet ID is correct
   - Ensure service account has edit access
   - Check private key format (must have `\n`)

3. **Category not recognized**
   - Use `/categories` to see valid options
   - Try using the exact category name

## Project Structure

```
telegram-finance-bot/
├── src/
│   ├── bot/
│   │   ├── index.js      # Bot setup and initialization
│   │   └── handlers.js   # Command and message handlers
│   ├── services/
│   │   └── googleSheets.js  # Google Sheets API integration
│   ├── utils/
│   │   ├── categories.js # Category constants and normalization
│   │   └── parser.js     # Message parser
│   ├── config/
│   │   └── index.js      # Configuration management
│   └── index.js          # Main entry point
├── .env.example          # Environment template
├── .gitignore
├── package.json
└── README.md
```

## Deployment

### Option 1: VPS/Server

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start src/index.js --name finance-bot

# Enable startup
pm2 startup
pm2 save
```

### Option 2: Railway

1. Push code to GitHub
2. Connect repo to [Railway](https://railway.app)
3. Add environment variables
4. Deploy

### Option 3: Heroku

1. Create `Procfile`:
   ```
   worker: node src/index.js
   ```
2. Deploy to Heroku
3. Set config vars
4. Scale worker: `heroku ps:scale worker=1`

## License

MIT
