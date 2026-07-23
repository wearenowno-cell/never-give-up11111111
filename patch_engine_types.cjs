const fs = require('fs');
let code = fs.readFileSync('src/services/testing/engine.ts', 'utf8');
code = code.replace('config: any;\n}', 'config: any;\n  error?: string;\n}');
code = code.replace('winRate: result.winRate,', 'winRate: result.winRate || 0,');
code = code.replace('netROI: result.netProfitPercent,', 'netROI: result.netProfitPercent || ((result.finalBalanceUSD - result.initialBalanceUSD) / result.initialBalanceUSD) * 100,');
code = code.replace('maxDrawdownPercent: result.maxDrawdownPercent,', 'maxDrawdownPercent: result.maxDrawdownPercent || 0,');
code = code.replace('totalTrades: result.trades.length', 'totalTrades: result.simulatedTrades ? result.simulatedTrades.length : result.totalTrades');

fs.writeFileSync('src/services/testing/engine.ts', code);
console.log("Patched engine types");
