export type SignalType = "BUY" | "SELL" | "BUY_LIMIT" | "SELL_LIMIT" | "BUY_STOP" | "SELL_STOP";

export interface TradingSignal {
  id?: string;
  asset: string;
  type: SignalType;
  entryPrice: number;
  stopLoss: number;
  takeProfits: number[];
  datetime?: string | null;
  lotMultiplier?: number;
  notes?: string | null;
  channelSource?: string; // Telegram channel tag for multi-channel benchmarking
  ingested_epoch?: number; // Raw, immutable Unix epoch timestamp
}

// ── Optimizer ────────────────────────────────────────────────────────────────
export interface OptimizationProfile {
  label: string;
  riskPercent: number;
  tp1ExitRatio: number;
  moveSlToEntryAtTp1: boolean;
  trailingStopTrigger: number;
  trailingStopDistance: number;
  breakEvenPipsTrigger: number;
}

export interface OptimizationResult {
  profile: OptimizationProfile;
  winRate: number;
  profitFactor: number;
  maxDrawdownPercent: number;
  sharpeRatio: number;
  netProfit: number;
  expectancy: number;
  totalTrades: number;
  score: number; // composite ranking score
}

// ── Multi-Channel Benchmarking ───────────────────────────────────────────────
export interface ChannelBenchmarkResult {
  channelName: string;
  totalSignals: number;
  winRate: number;
  netROI: number;
  profitFactor: number;
  avgPipDrawdown: number;
  signalFrequencyPerWeek: number;
  accuracyDecay: number; // win-rate difference: first-half vs second-half of signals
  maxDrawdownPercent: number;
  sharpeRatio: number;
}

export interface BacktestConfig {
  initialBalance: number;
  sizingMode: "FIXED_LOT" | "RISK_PERCENT";
  fixedLotSize: number; // e.g. 0.1 lots
  riskPercent: number; // e.g. 1% or 2% of current balance
  tp1ExitRatio: number; // e.g. 0.50 (close 50% at TP1)
  moveSlToEntryAtTp1: boolean;
  breakEvenPipsTrigger: number; // move to entry after X pips in profit (0 to disable)
  trailingStopTrigger: number; // activate after Y pips in profit
  trailingStopDistance: number; // trail by Z pips
  claimedWinRate: number; // Channel's claimed win rate (to compare vs actual)
  spreadPips: number; // e.g., 1.5 pips for EURUSD
  slippagePips: number; // e.g., 0.5 pips slippage
  commissionPerLot: number; // e.g., $7.00 per standard lot (round turn)
  backtestMode: "real_data" | "instant_local"; // "real_data": fetch real historical candles (with automatic fallback + synthetic warning); "instant_local": fully synthetic, offline, deterministic
  backtestPrecision: "candle" | "every_tick"; // candle close vs every tick
  // Item B — Timezone alignment
  sourceTimezoneOffsetHours?: number; // signal channel UTC offset, e.g. +2 for GMT+2 (default 0 = UTC)
  // Item C — Dynamic macro-event spread filter
  newsFilterEnabled?: boolean;        // apply 3–5× spread multiplier during high-impact event windows
  // Item A — Portfolio / margin tracking
  accountLeverage?: number;           // e.g. 100 for 1:100 leverage (used by portfolio engine)
  maintenanceMarginRate?: number;     // margin call threshold, e.g. 0.5 = 50% of used margin
  strictRealData?: boolean;           // strict mode: disable synthetic fallbacks and enforce retry backoff
}

// ── Portfolio Engine (Item A) ─────────────────────────────────────────────────
export interface PortfolioTimelinePoint {
  utcMs: number;
  openTradeCount: number;
  usedMarginUSD: number;
  floatingPnLUSD: number;
  equityUSD: number;
  freeMarginUSD: number;
  isMarginCall: boolean;
  marginCallTrades?: string[];
}

export interface PortfolioBacktestResult {
  trades: SimulatedTrade[];
  timeline: PortfolioTimelinePoint[];
  initialBalance: number;
  finalBalance: number;
  netProfit: number;
  maxFloatingDrawdownUSD: number;
  maxFloatingDrawdownPct: number;
  maxConcurrentTrades: number;
  maxUsedMarginUSD: number;
  marginCallEvents: { utcMs: number; equityUSD: number; usedMarginUSD: number }[];
  peakEquityUSD: number;
}

// ── Walk-Forward Validation (Enhancement 1) ───────────────────────────────────
export interface WalkForwardSummary {
  isSignalCount: number;
  oosSignalCount: number;
  isSplitPercent: number;    // 70
  oosSplitPercent: number;   // 30
  avgIsWinRate: number;
  avgOosWinRate: number;
  avgIsProfitFactor: number;
  avgOosProfitFactor: number;
  avgIsSharpe: number;
  avgOosSharpe: number;
  avgIsMaxDD: number;
  avgOosMaxDD: number;
  degradedConfigCount: number;   // configs where OOS metrics fell >15% vs IS
  totalConfigCount: number;
  overfitRiskLevel: "LOW" | "MEDIUM" | "HIGH";
}

export interface TradeEvent {
  time: string; // "10:15" or relative index
  type: "INFO" | "OPEN" | "TP" | "SL" | "BE" | "TRAILING" | "CLOSE" | "PARTIAL_CLOSE";
  message: string;
  price: number;
  balanceAfter?: number;
  stopLoss?: number;
}

export interface SimulatedTrade {
  id: string;
  signal: TradingSignal;
  entryPrice: number;
  stopLoss: number;
  takeProfits: number[];
  finalExitPrice: number;
  status: "WIN" | "LOSS" | "BREAKEVEN" | "PARTIAL_WIN" | "OPEN";
  pipsGained: number;
  profitAmount: number; // in USD
  maxDrawdownPips: number;
  maxExcursionPips: number;
  events: TradeEvent[];
  pricePath: number[]; // Tick series for visualization
  lotsTraded: number;
  openTime: string;
  closeTime: string;
  isRealData?: boolean;
  dataSource?: string; // e.g. "yahoo", "yahoo_1h", "twelvedata", "polygon", "synthetic"
  candles?: {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
  }[];
}

export interface BalancePoint {
  tradeIndex: number;
  tradeId: string;
  asset: string;
  balance: number;
  profit: number;
}

export interface AgentConfig {
  id: string;
  name: string;
  apiKey: string;
  endpoint: string;
  isActive: boolean;
}


export interface PerAssetStat {
  trades: number;
  wins: number;
  losses: number;
  pnl: number;
  pips: number;
  avgPnl: number;
  winRate: number;
}

export interface BacktestResults {
  trades: SimulatedTrade[];
  initialBalance: number;
  finalBalance: number;
  netProfit: number;
  netProfitPercent: number;
  totalPipsGained: number;
  winRate: number;           // actual % of trades with profit > 0
  claimedWinRate: number;    // copied from config
  totalTrades: number;
  wonTrades: number;
  lostTrades: number;
  breakevenTrades: number;
  profitFactor: number;      // Gross Profits / Gross Losses
  maxDrawdownPercent: number;
  avgProfitPerTrade: number;
  avgLossPerTrade: number;
  theoreticalRiskReward: number; // based on SL vs TP1/TP2 midpoint
  realizedRiskReward: number;    // actual average win vs average loss size
  balanceHistory: BalancePoint[];

  // Extended study metrics (added for quality analysis)
  expectancy: number;            // (winRate × avgWin) − (lossRate × avgLoss): EV per trade in $
  maxConsecutiveWins: number;    // longest winning streak
  maxConsecutiveLosses: number;  // longest losing streak
  recoveryFactor: number;        // |netProfit| / absoluteMaxDrawdown — how efficiently recovered
  largestWin: number;            // single biggest winning trade in $
  largestLoss: number;           // single biggest losing trade in $ (positive number)
  avgTradeDurationMinutes: number; // average time from open to close
  sharpeRatio: number;           // trade-level Sharpe (mean return / std-dev of returns)
  perAssetStats: Record<string, PerAssetStat>;  // breakdown by symbol
  monthlyPnl: Record<string, number>;           // "YYYY-MM" → net PnL for that month
}

declare global {
  interface Window {
    targetChannels?: string;
    testLimit?: string;
    currentJobId?: string;
    currentJob?: any;
    jobInterval?: any;
    convertToLimit?: boolean;
  }
}
