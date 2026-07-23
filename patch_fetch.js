const fs = require('fs');
let code = fs.readFileSync('src/utils/onlineDataEngine.ts', 'utf8');

const startMarker = 'export async function fetchOnline1mCandles(';
const endMarker = 'function mapSymbolForYahoo(';

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

const replacement = `export async function fetchOnline1mCandles(
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
    console.log(\`[Yahoo Finance] Fetching \${yahooSymbol}: [\${startTimeSec} - \${endTimeSec}]\`);
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
        console.log(\`[Yahoo Finance API] Successfully ingested \${mapped.length} primary candles for \${asset}\`);
        const sanitized = sanitizeCandlesWithATR(mapped, asset);
        return { candles: sanitized, source: "yahoo" };
      }
    }
  } catch (err: any) {
    console.warn(\`[Yahoo Finance API] Ingestion failed/bypassed: \${err.message || err}. Rolling back to Twelve Data...\`);
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
      const url = \`https://api.twelvedata.com/time_series?symbol=\${encodeURIComponent(twelveSymbol)}&interval=1min&outputsize=5000&start_date=\${encodeURIComponent(startStr)}&end_date=\${encodeURIComponent(endStr)}&timezone=UTC&apikey=\${currentKey}\`;

      console.log(\`[Twelve Data API] Queueing fallback fetch for \${twelveSymbol} using key \${currentKey.slice(0, 8)}...: [\${startStr} - \${endStr}] (Attempt \${twelveAttempt}/\${maxTwelveAttempts})\`);

      const valid = await twelveDataQueue.enqueue(async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        try {
          const response = await fetchWithBackoff(url, { signal: controller.signal });
          clearTimeout(timeoutId);
          if (!response.ok) {
            handleTwelveKeyFailure(currentKey, response.status);
            throw new Error(\`Twelve Data API returned status code \${response.status}\`);
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
            throw new Error(\`Twelve Data error: \${resJson.message || "Unknown error"}\`);
          }

          const rawValues = resJson.values || [];
          if (rawValues.length === 0) {
            throw new Error(\`Twelve Data returned 0 candles for \${twelveSymbol}\`);
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
        console.log(\`[Twelve Data API] Successfully ingested \${valid.length} fallback candles for \${asset}\`);
      }
    } catch (err: any) {
      console.warn(\`[Twelve Data API] Attempt \${twelveAttempt} failed: \${err.message || err}\`);
    }
  }

  if (twelveFetchedSuccess && twelveCandlesResult.length > 0) {
    const sanitized = sanitizeCandlesWithATR(twelveCandlesResult, asset);
    return { candles: sanitized, source: "twelvedata" };
  }

  throw new Error(\`Dual-Source Online Engine failed: both Yahoo Finance and Twelve Data could not fetch candles for \${asset}\`);
}

/**
 * Normalizes symbol to Yahoo Finance format.
 */
`;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex + endMarker.length);
fs.writeFileSync('src/utils/onlineDataEngine.ts', code);
