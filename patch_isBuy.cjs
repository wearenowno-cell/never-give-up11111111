const fs = require('fs');
let code = fs.readFileSync('src/services/backtest/engine.ts', 'utf8');

const oldStr = `const isBuy = signal.type.toUpperCase().includes("BUY");`;
const newStr = `const isBuy = ((signal.type || "") + (signal.action || "")).toUpperCase().includes("BUY");`;

code = code.replace(oldStr, newStr);

const oldStr2 = `const isBuy = signal.type.toUpperCase().includes("BUY");`;
if(code.includes(oldStr2)){
   code = code.replace(oldStr2, newStr);
}

fs.writeFileSync('src/services/backtest/engine.ts', code);
console.log("Patched isBuy logic.");
