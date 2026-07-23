# Telegram Signals Backtester & Parser Pro

A high-fidelity trading signal parser and chronological backtesting suite. This application automates parsing raw multi-lingual, free-format Telegram trading signals using custom AI prompts, resolves time zone offsets, simulates execution against real-world 1-minute historical candles, and renders fully interactive high-fidelity chart previews of trade Lifetimes.

---

## 🚀 Key Features

* **Advanced AI Signal Parsing**: Built-in support for **Google Gemini (2.0-Flash)** and **Groq Cloud API** models. Includes robust stripping for markdown code block fences and an **automatic failover** system.
* **Bulletproof Local Fail-Safe (regex-v1.0)**: Automatic ultimate fallback parser. If all AI APIs are unconfigured, rate-limited, or offline, signals are extracted with premium local regex heuristic parsing. No API key required for preview mode!
* **High-Fidelity Chronological Backtester**:
  - Simulates trading lifetime minute-by-minute with zero look-ahead bias.
  - Accounts for commissions, slippage, and real spreads.
  - Dynamically triggers stop-losses, partial targets, break-even protection, and trailing stops.
  - Resolves same-minute TP/SL conflicts using wick dominance tick-interpolation.
  - **Dynamic Macro-Event News Filter**: Real-time multiplier increases spreads and slippage during major global financial news announcements.
* **Premium Interactive Candlestick Charts**: Fully-custom, high-contrast, optimized trade-framing zoom visualizations showing exactly when positions were opened, closed, active take-profits, and Stop-Loss limits.

---

## 🛠️ Environment Variables Configuration

To run the application, configure the following environment variables in your `.env` or system environment panel:

```env
# Google Gemini API key (Server-side)
GEMINI_API_KEY="your_google_gemini_api_key_here"

# Groq Cloud API key (Server-side)
GROQ_API_KEY="your_groq_api_key_here"

# Telegram API credentials (for live channel stream listening)
TELEGRAM_API_ID="your_telegram_api_id"
TELEGRAM_API_HASH="your_telegram_api_hash"
```

---

## 🏁 Step-by-Step Setup Guide

Follow these steps to run the application locally or deploy it to a server:

### 1. Install Dependencies
Ensure you have Node.js (v18+) installed. Cleanly install package dependencies:
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your keys:
```bash
cp .env.example .env
```

### 3. Start Development Server
Boot the Express back-end and the integrated Vite front-end on port `3000`:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### 4. Build for Production
To build a highly optimized, single-bundle compiled CJS server and React SPA static assets:
```bash
npm run build
```

### 5. Start Production Server
Launch the self-contained production bundle:
```bash
npm start
```

---

## 📝 Changelog (v1.2.0 - Current Session Updates)

* **Groq Cloud API Integration**:
  - Implemented robust regex-based Markdown fence-tag stripping to clean output blocks like `` ```json ... ``` `` prior to JSON parsing.
  - Handled json parsing exceptions with helpful fallback error logging.
* **Bulletproof Parser Failover Architecture**:
  - Integrated dynamic failover loops. If the primary provider (e.g. Groq) encounters failure or missing credentials, it automatically routes through the chosen Backup Provider.
  - Added an ultimate fallback to the **high-performance local regex parser** (`regex-v1.0`). If both primary and backup AI providers are unreachable or unconfigured, the application extracts signals locally without throwing blocking connection errors.
* **Interactive Candlestick Trade Framing (UI/UX)**:
  - Redesigned the chart preview renderer to dynamically zoom and lock onto the exact lifetime of each trade (from open time to close time) plus logical padding. This completely resolves squishing issues with thousands of daily candles.
  - Added a **shaded P&L background rectangle** that visually communicates positive or negative profit-zones over the trade's span.
  - Improved active target and stop-loss lines by rendering high-contrast vibrant segments exclusively across the duration of the trade, alongside subtle horizontal dotted guide lines.
  - Added an elegant **vertical exit timeline guide** and a circular node labeled with the precise final exit price.
