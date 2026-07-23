const fs = require('fs');
let code = fs.readFileSync('src/services/parser/mastermind.ts', 'utf8');

const targetStr = `6. EXTREME PRECISION: Extract the Entry Price, Stop Loss, and Take Profits with absolute mathematical precision exactly as written in the text. DO NOT GUESS OR ROUND. If an entry price is a zone (e.g., 2045-2048), extract the average or the first number. Maintain all decimal places (e.g., 1.09245).
7. MULTI-MESSAGE SIGNALS: Sometimes a signal is split across multiple consecutive messages (e.g., Message 1 says "SELL AUDJPY" and Message 2 says "Entry: 112.70, SL: 112.80"). If you see this, COMBINE the information into a single JSON object. Use the ID of the primary message (usually the first one) for the "messageId".`;

const newStr = `6. EXTREME PRECISION: Extract the Entry Price, Stop Loss, and Take Profits with absolute mathematical precision exactly as written in the text. DO NOT GUESS OR ROUND. If an entry price is a zone (e.g., 2045-2048), extract the average or the first number. Maintain all decimal places (e.g., 1.09245).
7. MULTI-MESSAGE SIGNALS: Sometimes a signal is split across multiple consecutive messages (e.g., Message 1 says "SELL AUDJPY" and Message 2 says "Entry: 112.70, SL: 112.80"). If you see this, COMBINE the information into a single JSON object. Use the ID of the primary message (usually the first one) for the "messageId".
8. MULTIPLE TAKE PROFITS: If a message contains multiple Take Profit targets (e.g., TP1, TP2, TP3, Target, Goal), extract ALL of them into the takeProfits array.`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('src/services/parser/mastermind.ts', code);
  console.log("Patched mastermind prompt.");
} else {
  console.log("Not found.");
}
