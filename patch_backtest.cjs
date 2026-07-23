const fs = require('fs');
let code = fs.readFileSync('src/services/backtest/engine.ts', 'utf8');

const oldNormalizer = `    // Ensure candle prices match the magnitude of the signal's entry price
    const parsedEntry = Number(signal.entryPrice);
    if (!isNaN(parsedEntry) && parsedEntry > 0 && candles.length > 0) {
      const sampleClose = candles[0].close;
      if (sampleClose > 0) {
        const ratio = parsedEntry / sampleClose;
        let scaleFactor = 1.0;
        if (ratio > 5 && ratio < 15) scaleFactor = 10;
        else if (ratio > 50 && ratio < 150) scaleFactor = 100;
        else if (ratio > 500 && ratio < 1500) scaleFactor = 1000;
        else if (ratio < 0.2 && ratio > 0.05) scaleFactor = 0.1;
        else if (ratio < 0.02 && ratio > 0.005) scaleFactor = 0.01;
        else if (ratio < 0.002 && ratio > 0.0005) scaleFactor = 0.001;

        if (scaleFactor !== 1.0) {
          logger.info(\`[Price Normalizer] Scaling \${sourceLabel} candles by \${scaleFactor}x to match signal entry magnitude (\${sampleClose} -> \${sampleClose * scaleFactor})\`);
          for (const c of candles) {
            c.open *= scaleFactor;
            c.high *= scaleFactor;
            c.low *= scaleFactor;
            c.close *= scaleFactor;
          }
        }
      }
    }
    
    // Strict ATR/Price Boundary Clamp
    const allPrices = [parsedEntry, Number(signal.stopLoss), ...(signal.takeProfits || []).map(Number)].filter(p => !isNaN(p) && p > 0);`;

const newNormalizer = `    // Ensure signal prices match the magnitude of the real-world candles
    let parsedEntry = Number(signal.entryPrice);
    if (!isNaN(parsedEntry) && parsedEntry > 0 && candles.length > 0) {
      const sampleClose = candles[0].close;
      if (sampleClose > 0) {
        const ratio = parsedEntry / sampleClose;
        let scaleFactor = 1.0;
        if (ratio > 5 && ratio < 15) scaleFactor = 10;
        else if (ratio > 50 && ratio < 150) scaleFactor = 100;
        else if (ratio > 500 && ratio < 1500) scaleFactor = 1000;
        else if (ratio < 0.2 && ratio > 0.05) scaleFactor = 0.1;
        else if (ratio < 0.02 && ratio > 0.005) scaleFactor = 0.01;
        else if (ratio < 0.002 && ratio > 0.0005) scaleFactor = 0.001;

        if (scaleFactor !== 1.0) {
          logger.info(\`[Price Normalizer] Scaling SIGNAL PRICES by \${1/scaleFactor}x to match real market magnitude (\${parsedEntry} -> \${parsedEntry / scaleFactor})\`);
          signal.entryPrice = Number((parsedEntry / scaleFactor).toFixed(5));
          parsedEntry = signal.entryPrice;
          
          if (signal.stopLoss) signal.stopLoss = Number((Number(signal.stopLoss) / scaleFactor).toFixed(5));
          if (signal.takeProfits && Array.isArray(signal.takeProfits)) {
            signal.takeProfits = signal.takeProfits.map(p => Number((Number(p) / scaleFactor).toFixed(5)));
          }
        }
      }
    }
    
    // Strict ATR/Price Boundary Clamp
    const allPrices = [parsedEntry, Number(signal.stopLoss), ...(signal.takeProfits || []).map(Number)].filter(p => !isNaN(p) && p > 0);`;

code = code.replace(oldNormalizer, newNormalizer);

fs.writeFileSync('src/services/backtest/engine.ts', code);
console.log("Patched price normalizer.");
