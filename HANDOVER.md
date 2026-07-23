# Elite Technical Handover: Telegram Signals Backtester & Parser Pro

## 1. System Architecture Overview

### Initial State: "The Monolithic Monode"
Prior to this final migration phase, the application suffered from structural technical debt. The entire backend routing, signal parsing, market simulation, portfolio backtesting, data caching, and background Telegram daemon streaming were tightly coupled inside a single ~4,000-line `src/server.ts` monolith. This led to scope bleed, difficult testing, and complex logic overlaps (especially between local Regex parsing and LLM failovers).

### Final State: Decoupled & Layered Service Architecture
The codebase has been surgically refactored into a clean, highly modular, Domain-Driven Design (DDD) architecture.

```text
src/
├── config/           # Global environment verifications
├── database/         # SQLite high-concurrency WAL connection pool
├── routes/           # Central API Router isolating endpoints from server initialization
├── utils/            # Mathematical precision engines, loggers, formatting, and asset specs
└── services/
    ├── telegram/     # Robust background daemon with heartbeat and exponential backoff
    ├── parser/       # Multi-stage parsing pipeline (Regex + LLM Mastermind Orchestration)
    ├── llm/          # Failover multi-provider routing (SambaNova, Groq, Gemini, etc.) and telemetry
    ├── market/       # Financial asset polling and cache engines (Yahoo Finance, etc.)
    ├── backtest/     # O(1) Quantitative trade simulation engines for realistic metrics
    ├── portfolio/    # Global margin exposure calculations, PRNG simulation fallbacks, and multi-asset P&L
    └── ea/           # MQL5 standalone EA text generation engine
```

## 2. Key Engineering Upgrades
- **Mathematical Precision & Margin Tracking**: Fully abstracted logic in `src/services/portfolio/manager.ts`. Leverage constraints, maintenance margin calculations, and drawdown metrics are now rigorously enforced using standardized USD conversions.
- **Fail-Safe Background Stream**: `src/services/telegram/daemon.ts` now runs the persistent Telegram client. It utilizes exponential backoff for flawless auto-recovery if the WebSocket connection drops.
- **Micro-Bootstrapper Server**: `src/server.ts` has been stripped to roughly ~60 lines. Its only responsibilities are catching unhandled Node process exceptions, waking up the database pool, binding the centralized `apiRouter`, and mounting the Vite frontend SPA fallback.

## 3. Deployment & Operational Runbook

### Environment Variables
You must verify the `.env` file matches the configurations listed in `.env.example`:
- `PORT` (Default: 3000)
- `NODE_ENV` (development | production)
- LLM Keys: `GROQ_API_KEYS`, `SAMBANOVA_API_KEYS`, `GEMINI_API_KEYS`
- Telegram Credentials: `TELEGRAM_APP_ID`, `TELEGRAM_APP_HASH`

### Verification & Boot
To guarantee zero structural code rot after this cleanup, run standard type checks before deployment:
```bash
npx tsc --noEmit
```

**Build & Deploy:**
```bash
npm run build
npm start
```
The application uses a compiled backend (`dist/server.cjs`) leveraging ESBuild to bundle all dependencies together, eliminating latency during cold starts.
