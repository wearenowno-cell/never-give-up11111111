const fs = require('fs');
let code = fs.readFileSync('src/services/testing/engine.ts', 'utf8');

// 1. Add yielding before parsing
code = code.replace(
  `for (let i = 0; i < validMessages.length; i += CHUNK_SIZE) {`,
  `for (let i = 0; i < validMessages.length; i += CHUNK_SIZE) {\n         await sleep(100); // Lazy loading: Yield to event loop to avoid bottlenecks`
);

// 2. Add convertToLimit handling before backtesting
const backtestTarget = `logJob(job, \`Backtesting \${channelJob.signalsFound} signals for \${channelJob.chatId}...\`);
      
      try {
        if (parsedChannelSignals.length > 0) {
            const result = await runPortfolioBacktest(parsedChannelSignals, backtestConfig, []);`;

const backtestReplacement = `logJob(job, \`Backtesting \${channelJob.signalsFound} signals for \${channelJob.chatId}...\`);
      
      try {
        if (parsedChannelSignals.length > 0) {
            if (job.config.convertToLimit) {
               parsedChannelSignals.forEach((s: any) => {
                   if (s) s.actionType = "LIMIT";
               });
               logJob(job, \`Converted \${parsedChannelSignals.length} signals to LIMIT orders.\`);
            }
            await sleep(200); // Lazy loading: Yield before heavy backtest
            const result = await runPortfolioBacktest(parsedChannelSignals, backtestConfig, []);`;

code = code.replace(backtestTarget, backtestReplacement);

fs.writeFileSync('src/services/testing/engine.ts', code);
console.log("Patched engine.ts for lazy loading and convertToLimit");
