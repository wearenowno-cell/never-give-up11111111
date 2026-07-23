import yahooFinanceModule from "yahoo-finance2";
const YahooFinance = (yahooFinanceModule as any).default || yahooFinanceModule;
const yahooFinance = new YahooFinance();
import { Candle } from "../database/db.js";

// Global configurations and credentials
const DEFAULT_ALLTICK_TOKEN = "2c8f066bf41965d140b0cc0bb030051c-c-app";

// Twelve Data multi-key rotating pool
const TWELVE_DATA_KEYS = [
  "0ae07c6c357c4a59b359e978fcf7bccc",
  "e66eb1c06c0943feaefab0b8ad969d0a",
  "7c78999d0ef94e119a05cf636e085d89"
];

interface TwelveKeyState {
  disabledUntil: number;
}
const twelveKeyStates = new Map<string, TwelveKeyState>();

let currentTwelveKeyIndex = 0;

function getTwelveDataKey(keysPool: string[] = TWELVE_DATA_KEYS): string {
  const now = Date.now();
  for (let i = 0; i < keysPool.length; i++) {
    const idx = (currentTwelveKeyIndex + i) % keysPool.length;
    const key = keysPool[idx];
    const state = twelveKeyStates.get(key) || { disabledUntil: 0 };
    if (now >= state.disabledUntil) {
      currentTwelveKeyIndex = idx;
      return key;
    }
  }
  const key = keysPool[currentTwelveKeyIndex % keysPool.length];
  currentTwelveKeyIndex = (currentTwelveKeyIndex + 1) % keysPool.length;
  return key;
}

function handleTwelveKeySuccess(key: string) {
  twelveKeyStates.set(key, { disabledUntil: 0 });
}

function handleTwelveKeyFailure(key: string, statusCode?: number) {
  const now = Date.now();
  if (statusCode === 429) {
    twelveKeyStates.set(key, { disabledUntil: now + 60 * 1000 }); // 1 min cooldown
    console.warn(`[Twelve Data API] Key ${key.slice(0, 8)}... rate limited (429). Cooldown for 1 min.`);
  } else if (statusCode === 400 || statusCode === 401 || statusCode === 403) {
    twelveKeyStates.set(key, { disabledUntil: now + 60 * 60 * 1000 }); // 1 hour cooldown for auth/quota errors
    console.warn(`[Twelve Data API] Key ${key.slice(0, 8)}... encountered error ${statusCode}. Cooldown for 1 hour.`);
  } else {
    twelveKeyStates.set(key, { disabledUntil: now + 10 * 1000 }); // 10 seconds default cooldown
  }
}


// Rate-limiting and health tracking for AllTick
interface TokenState {
  consecutiveFailures: number;
  disabledUntil: number;
}
const allTickTokenStates = new Map<string, TokenState>();

function getAllTickTokenState(token: string): TokenState {
  let state = allTickTokenStates.get(token);
  if (!state) {
    state = { consecutiveFailures: 0, disabledUntil: 0 };
    allTickTokenStates.set(token, state);
  }
  return state;
}

function handleAllTickSuccess(token: string) {
  const state = getAllTickTokenState(token);
  state.consecutiveFailures = 0;
}

function handleAllTickFailure(token: string, statusCode?: number) {
  const state = getAllTickTokenState(token);
  state.consecutiveFailures++;
  
  // If unauthorized (401) or forbidden (403), disable permanently for this process runtime
  if (statusCode === 401 || statusCode === 403) {
    console.warn(`[AllTick API] Token ${token.slice(0, 8)}... received status ${statusCode}. Disabling permanently.`);
    state.disabledUntil = Infinity;
  } else if (state.consecutiveFailures >= 3) {
    // Disable for 10 minutes if we hit 3 consecutive failures
    const disableDuration = 10 * 60 * 1000;
    state.disabledUntil = Date.now() + disableDuration;
    console.warn(`[AllTick API] Token ${token.slice(0, 8)}... hit ${state.consecutiveFailures} consecutive failures. Disabling for 10 minutes.`);
  }
}

function isAllTickTokenDisabled(token: string): boolean {
  const state = getAllTickTokenState(token);
  return Date.now() < state.disabledUntil;
}

// Rate-Limit Shield (AllTick is limited to 10 req/min, which is max 1 request per 6 seconds)
let lastAllTickCallTime = 0;
const ALLTICK_MIN_INTERVAL = 6100; // 6.1 seconds to be safe from network jitter

let lastTwelveDataCallTime = 0;
const TWELVEDATA_MIN_INTERVAL = 6100; // 6.1 seconds for Twelve Data

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function throttleAllTick(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastAllTickCallTime;
  if (elapsed < ALLTICK_MIN_INTERVAL) {
    const delay = ALLTICK_MIN_INTERVAL - elapsed;
    console.log(`[Rate-Limit Shield] Throttling AllTick request. Sleeping for ${delay}ms...`);
    await sleep(delay);
  }
  lastAllTickCallTime = Date.now();
}

async function throttleTwelveData(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastTwelveDataCallTime;
  if (elapsed < TWELVEDATA_MIN_INTERVAL) {
    const delay = TWELVEDATA_MIN_INTERVAL - elapsed;
    console.log(`[Rate-Limit Shield] Throttling Twelve Data request. Sleeping for ${delay}ms...`);
    await sleep(delay);
  }
  lastTwelveDataCallTime = Date.now();
}

// Request queuing system to serialize requests and prevent concurrent 429 cascading
class RequestQueue {
  private queue: Promise<any> = Promise.resolve();
  constructor(private throttleFn: () => Promise<void>) {}

  public enqueue<T>(fn: () => Promise<T>): Promise<T> {
    const result = this.queue.then(async () => {
      await this.throttleFn();
      return fn();
    });
    // Append but swallow error so subsequent items in queue can continue running
    this.queue = result.catch(() => {});
    return result;
  }
}

const allTickQueue = new RequestQueue(throttleAllTick);
const twelveDataQueue = new RequestQueue(throttleTwelveData);

/**
 * Normalizes symbol to AllTick format:
 * - XAUUSD or XAU/USD -> "GOLD"
 * - Other currency pairs (e.g. EURUSD) -> Capitalized letters only (e.g. "EURUSD")
 */
function mapSymbolForAllTick(asset: string): string {
  const clean = asset.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (clean === "XAUUSD" || clean === "XAU" || clean === "GOLD") {
    return "GOLD";
  }
  return clean;
}

/**
 * Normalizes symbol to Twelve Data format:
 * - XAUUSD or XAU/USD -> "XAU/USD"
 * - Currency pairs (e.g. EURUSD) -> "EUR/USD"
 */
function mapSymbolForTwelveData(asset: string): string {
  const clean = asset.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (clean === "XAUUSD" || clean === "XAU" || clean === "GOLD") {
    return "XAU/USD";
  }
  if (clean.length === 6) {
    return `${clean.slice(0, 3)}/${clean.slice(3)}`;
  }
  return clean;
}

/**
 * Dynamic ATR(14) calculation helper for outlier sanitization.
 * TR = max(High - Low, abs(High - Close_prev), abs(Low - Close_prev))
 */
function calculateATR14(candles: Candle[], currentIndex: number, asset: string): number {
  if (candles.length === 0) return 0;
  const start = Math.max(0, currentIndex - 14);
  let totalTR = 0;
  let count = 0;

  for (let j = start; j < currentIndex; j++) {
    const c = candles[j];
    const prevC = j > 0 ? candles[j - 1] : c;
    const tr = Math.max(
      c.high - c.low,
      Math.abs(c.high - prevC.close),
      Math.abs(c.low - prevC.close)
    );
    totalTR += tr;
    count++;
  }

  if (count === 0) {
    const current = candles[currentIndex];
    // Baseline minimum ATR to avoid division by zero or extreme clamps
    return current.high - current.low || (current.close * 0.0005);
  }

  return totalTR / count;
}

/**
 * Dynamic outlier sanitization:
 * If a high-to-low spread exceeds 5 * ATR(14), clamp high/low of that candle to 1.5 * ATR(14).
 */
export function sanitizeCandlesWithATR(candles: Candle[], asset: string): Candle[] {
  if (candles.length === 0) return [];
  
  // 1. Strict validation of candles structure and values
  const validCandles = (candles || []).filter((c: Candle) => 
    c &&
    typeof c.timestamp === "number" && c.timestamp > 0 && !isNaN(c.timestamp) &&
    typeof c.open === "number" && !isNaN(c.open) && c.open > 0 &&
    typeof c.high === "number" && !isNaN(c.high) && c.high > 0 &&
    typeof c.low === "number" && !isNaN(c.low) && c.low > 0 &&
    typeof c.close === "number" && !isNaN(c.close) && c.close > 0
  );
  if (validCandles.length === 0) return [];

  // 2. Compute global median of closes to protect against extreme outliers (e.g. timestamp mapped as price)
  const sortedAllCloses = validCandles.map(c => c.close).sort((a, b) => a - b);
  const globalMedian = sortedAllCloses[Math.floor(sortedAllCloses.length / 2)];

  // Filter out candles that deviate from global median by >50% (unrealistic for short-term data)
  const filteredCandles = validCandles.filter((c: Candle) => {
    const maxLimit = globalMedian * 1.5;
    const minLimit = globalMedian * 0.5;
    const isExtreme = 
      c.open > maxLimit || c.open < minLimit ||
      c.high > maxLimit || c.high < minLimit ||
      c.low > maxLimit || c.low < minLimit ||
      c.close > maxLimit || c.close < minLimit;
    return !isExtreme;
  });

  if (filteredCandles.length === 0) return [];

  const result: Candle[] = [];
  for (let i = 0; i < filteredCandles.length; i++) {
    const c = { ...filteredCandles[i] };
    const atr = calculateATR14(filteredCandles, i, asset);
    const range = c.high - c.low;

    if (atr > 0 && range > 5 * atr) {
      const clampedHigh = c.open + 1.5 * atr;
      const clampedLow = c.open - 1.5 * atr;

      console.log(`[ATR Clamp] Outlier detected on ${asset} candle at ${new Date(c.timestamp * 1000).toISOString()}`);
      console.log(`  Original Range: ${range.toFixed(5)} | ATR(14): ${atr.toFixed(5)} (Threshold: ${(5 * atr).toFixed(5)})`);
      console.log(`  Clamped High: ${clampedHigh.toFixed(5)} | Clamped Low: ${clampedLow.toFixed(5)}`);

      c.high = Number(Math.max(clampedHigh, c.open, c.close).toFixed(5));
      c.low = Number(Math.min(clampedLow, c.open, c.close).toFixed(5));
    }
    result.push(c);
  }

  return result;
}

/**
 * Highly resilient fetch wrapper that implements progressive exponential backoff, retry jitter,
 * and handles rate limits (HTTP 429) and transient errors (5xx).
 */
async function fetchWithBackoff(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 4,
  baseDelayMs: number = 2000
): Promise<Response> {
  let attempt = 0;
  while (true) {
    attempt++;
    try {
      const response = await fetch(url, options);

      // Handle Rate Limiting (429) or Server Errors (5xx) with automatic progressive delay
      if (response.status === 429 || (response.status >= 500 && response.status <= 599)) {
        if (attempt >= maxRetries) {
          console.warn(`[Resilient Fetch] Max retries (${maxRetries}) reached for: ${url}. Status: ${response.status}`);
          return response;
        }

        let delay = baseDelayMs * Math.pow(2, attempt - 1);
        const jitter = (Math.random() - 0.5) * 0.3 * delay;
        delay = Math.max(500, delay + jitter);

        const retryAfterHeader = response.headers.get("retry-after");
        if (retryAfterHeader) {
          const retryAfterSec = parseInt(retryAfterHeader, 10);
          if (!isNaN(retryAfterSec) && retryAfterSec > 0) {
            delay = Math.min(20000, retryAfterSec * 1000);
            console.log(`[Resilient Fetch] HTTP ${response.status}. Retry-After header: ${retryAfterHeader}s. Waiting ${delay}ms...`);
          }
        } else {
          console.log(`[Resilient Fetch] HTTP ${response.status}. Attempt ${attempt}/${maxRetries}. Retrying in ${delay.toFixed(0)}ms...`);
        }

        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      return response;
    } catch (error: any) {
      if (attempt >= maxRetries) {
        console.error(`[Resilient Fetch] Network failure on final attempt ${attempt}/${maxRetries}:`, error);
        throw error;
      }

      let delay = baseDelayMs * Math.pow(2, attempt - 1);
      const jitter = (Math.random() - 0.5) * 0.3 * delay;
      delay = Math.max(500, delay + jitter);

      console.warn(`[Resilient Fetch] Network exception on attempt ${attempt}/${maxRetries}: ${error.message || error}. Retrying in ${delay.toFixed(0)}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Fetch 1-minute historical candles using AllTick (primary) with Twelve Data as fallback.
 * Automatically handles symbol mapping, rate-limiting shield, and outlier clamp.
 */
export async function fetchOnline1mCandles(
  asset: string,
  startTimeSecInput: number,
  endTimeSecInput: number,
  apiKeys?: { AllTickToken?: string; twelveData?: string }
): Promise<{ candles: Candle[]; source: "alltick" | "twelvedata" | "yahoo" }> {
  const nowSec = Math.floor(Date.now() / 1000);
  let endTimeSec = Math.min(endTimeSecInput, nowSec);
  let startTimeSec = Math.min(startTimeSecInput, endTimeSec);

  // Safety-clamping logic for boundary padding: ensure minimum 15-minute lookback window
  if (endTimeSec - startTimeSec < 900) {
    startTimeSec = endTimeSec - 900;
  }

  // Tier 1: Yahoo Finance (Primary)
  try {
    const yahooSymbol = mapSymbolForYahoo(asset);
    console.log(`[Yahoo Finance] Fetching ${yahooSymbol}: [${startTimeSec} - ${endTimeSec}]`);
    const result = await yahooFinance.chart(yahooSymbol, {
      period1: new Date(startTimeSec * 1000),
      period2: new Date(endTimeSec * 1000),
      interval: "1m"
    });
    
    if (result && result.quotes && result.quotes.length > 0) {
      const mapped: Candle[] = result.quotes.map(q => ({
        timestamp: Math.floor(new Date(q.date).getTime() / 1000),
        open: Number(q.open),
        high: Number(q.high),
        low: Number(q.low),
        close: Number(q.close)
      })).filter(c => c.timestamp > 0 && !isNaN(c.open) && !isNaN(c.close));

      if (mapped.length > 0) {
        console.log(`[Yahoo Finance API] Successfully ingested ${mapped.length} primary candles for ${asset}`);
        const sanitized = sanitizeCandlesWithATR(mapped, asset);
        return { candles: sanitized, source: "yahoo" };
      }
    }
  } catch (err: any) {
    console.warn(`[Yahoo Finance API] Ingestion failed/bypassed: ${err.message || err}. Rolling back to Twelve Data...`);
  }

  // Tier 2: Twelve Data (Fallback with Multi-Key Rotating Pool)
  const userTwelveKey = apiKeys?.twelveData;
  const twelveKeysPool = userTwelveKey ? [userTwelveKey, ...TWELVE_DATA_KEYS] : TWELVE_DATA_KEYS;
  
  let twelveAttempt = 0;
  const maxTwelveAttempts = twelveKeysPool.length;
  let twelveFetchedSuccess = false;
  let twelveCandlesResult: Candle[] = [];

  while (twelveAttempt < maxTwelveAttempts && !twelveFetchedSuccess) {
    twelveAttempt++;
    const currentKey = getTwelveDataKey(twelveKeysPool);
    
    try {
      const twelveSymbol = mapSymbolForTwelveData(asset);
      const startStr = new Date(startTimeSec * 1000).toISOString().replace("T", " ").slice(0, 19);
      const endStr = new Date(endTimeSec * 1000).toISOString().replace("T", " ").slice(0, 19);
      const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(twelveSymbol)}&interval=1min&outputsize=5000&start_date=${encodeURIComponent(startStr)}&end_date=${encodeURIComponent(endStr)}&timezone=UTC&apikey=${currentKey}`;

      console.log(`[Twelve Data API] Queueing fallback fetch for ${twelveSymbol} using key ${currentKey.slice(0, 8)}...: [${startStr} - ${endStr}] (Attempt ${twelveAttempt}/${maxTwelveAttempts})`);

      const valid = await twelveDataQueue.enqueue(async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        try {
          const response = await fetchWithBackoff(url, { signal: controller.signal });
          clearTimeout(timeoutId);
          if (!response.ok) {
            handleTwelveKeyFailure(currentKey, response.status);
            throw new Error(`Twelve Data API returned status code ${response.status}`);
          }
          const resJson = await response.json();
          
          if (resJson.status === "error") {
            const isRateLimit = resJson.message?.toLowerCase().includes("rate") || resJson.code === 429;
            const msgLower = (resJson.message || "").toLowerCase();
            const isNoData = msgLower.includes("no data") || msgLower.includes("market closed");
            
            const date = new Date(endTimeSec * 1000);
            const day = date.getUTCDay();
            const hours = date.getUTCHours();
            const isWeekend = (day === 5 && hours >= 22) || (day === 6) || (day === 0 && hours < 22);
            if ((resJson.code === 400 || isNoData) && (isWeekend || isNoData)) {
              throw new Error("WEEKEND_MARKET_CLOSED");
            }
            handleTwelveKeyFailure(currentKey, isRateLimit ? 429 : (resJson.code || 400));
            throw new Error(`Twelve Data error: ${resJson.message || "Unknown error"}`);
          }

          const rawValues = resJson.values || [];
          if (rawValues.length === 0) {
            throw new Error(`Twelve Data returned 0 candles for ${twelveSymbol}`);
          }

          const mapped: Candle[] = rawValues.map((v: any) => ({
            timestamp: Math.floor(Date.parse(v.datetime + " UTC") / 1000),
            open: Number(v.open),
            high: Number(v.high),
            low: Number(v.low),
            close: Number(v.close)
          })).sort((a: any, b: any) => a.timestamp - b.timestamp);

          handleTwelveKeySuccess(currentKey);
          return mapped.filter((c: any) => c.timestamp > 0 && !isNaN(c.open) && !isNaN(c.close));
        } catch (innerErr: any) {
          clearTimeout(timeoutId);
          throw innerErr;
        }
      });

      if (valid && valid.length > 0) {
        twelveFetchedSuccess = true;
        twelveCandlesResult = valid;
        console.log(`[Twelve Data API] Successfully ingested ${valid.length} fallback candles for ${asset}`);
      }
    } catch (err: any) {
      console.warn(`[Twelve Data API] Attempt ${twelveAttempt} failed: ${err.message || err}`);
    }
  }

  if (twelveFetchedSuccess && twelveCandlesResult.length > 0) {
    const sanitized = sanitizeCandlesWithATR(twelveCandlesResult, asset);
    return { candles: sanitized, source: "twelvedata" };
  }

  throw new Error(`Dual-Source Online Engine failed: both Yahoo Finance and Twelve Data could not fetch candles for ${asset}`);
}

/**
 * Normalizes symbol to Yahoo Finance format.
 */
function mapSymbolForYahoo(asset: string): string {
  const clean = asset.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (clean === "XAUUSD" || clean === "GOLD" || clean === "XAU") return "GC=F";
  if (clean === "XAGUSD" || clean === "SILVER" || clean === "XAG") return "SI=F";
  if (clean === "BTCUSD" || clean === "BTC") return "BTC-USD";
  if (clean === "ETHUSD" || clean === "ETH") return "ETH-USD";
  if (clean === "SOLUSD" || clean === "SOL") return "SOL-USD";
  if (clean === "US30" || clean === "DOW") return "^DJI";
  if (clean === "NAS100" || clean === "NAS" || clean === "USTEC") return "^NDX";
  if (clean === "SPX500" || clean === "SPX") return "^GSPC";
  if (clean.length === 6) {
    return `${clean}=X`;
  }
  return clean;
}
