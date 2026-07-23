const fs = require("fs");
const file = "src/services/backtest/engine.ts";
let code = fs.readFileSync(file, "utf8");

// We want to replace the "// Sanitize entry price" block:
const target = `    // Sanitize entry price
    let entryPrice = Number(signal.entryPrice);
    if (isNaN(entryPrice) || entryPrice <= 0) {
      if (candles.length > 0 && startIndex >= 0) {
        entryPrice = candles[startIndex].open;
      } else {
        entryPrice = 1.0;
      }
    }`;

const replacement = `    // Sanitize entry price & Real-World Execution Fill Logic
    let entryPrice = Number(signal.entryPrice);
    const isLimit = signal.type.toUpperCase().includes("LIMIT") || signal.type.toUpperCase().includes("PENDING");
    
    if (candles.length > 0 && startIndex >= 0) {
      if (!isLimit) {
        // Market Execution: Fills at the currently available market price at signal time, not the theoretical price.
        const originalEntry = entryPrice;
        entryPrice = candles[startIndex].open;
        if (!isNaN(originalEntry) && originalEntry > 0) {
          const deviation = Math.abs(entryPrice - originalEntry) / originalEntry;
          if (deviation > 0.05) { // 5% deviation is massive, maybe corrupted signal or wrong asset mapping, but we execute at market.
            logger.warn(\`[Realism] Market fill deviated >5% from signal price for \${signal.asset}: \${originalEntry} -> \${entryPrice}\`);
          }
        }
      } else {
        // Limit Order Execution: Wait for price to touch the limit price.
        let filledIndex = -1;
        const maxLimitWaitCandles = 60 * 48; // wait up to 48 hours
        const endLimitWait = Math.min(candles.length, startIndex + maxLimitWaitCandles);
        
        for (let j = startIndex; j < endLimitWait; j++) {
           const c = candles[j];
           if (isBuy) {
             if (c.open <= entryPrice) { filledIndex = j; entryPrice = c.open; break; }
             if (c.low <= entryPrice)  { filledIndex = j; break; } // entryPrice remains the limit price
           } else {
             if (c.open >= entryPrice) { filledIndex = j; entryPrice = c.open; break; }
             if (c.high >= entryPrice) { filledIndex = j; break; }
           }
        }
        
        if (filledIndex !== -1) {
           startIndex = filledIndex;
        } else {
           return {
             signal,
             id: "EXPIRED_LIMIT_" + Math.random().toString(36).substr(2, 5),
             profitAmount: 0,
             pipsGained: 0,
             status: "EXPIRED",
             events: [{ 
               time: signal.datetime || new Date().toISOString(),
               type: "INFO", 
               price: entryPrice, 
               message: \`Limit order never reached entry price \${entryPrice} within 48 hours. Trade expired unfilled.\` 
             }]
           };
        }
      }
    } else {
      if (isNaN(entryPrice) || entryPrice <= 0) {
        entryPrice = 1.0;
      }
    }`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync(file, code);
  console.log("Patched engine.ts successfully.");
} else {
  console.log("Could not find target in engine.ts.");
}
