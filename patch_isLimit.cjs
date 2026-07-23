const fs = require('fs');
let code = fs.readFileSync('src/services/backtest/engine.ts', 'utf8');

const oldStr = `const isLimit = signal.type.toUpperCase().includes("LIMIT") || signal.type.toUpperCase().includes("PENDING");`;
const newStr = `const isLimit = (signal.type && signal.type.toUpperCase().includes("LIMIT")) || 
                    (signal.actionType && (signal.actionType.toUpperCase().includes("LIMIT") || signal.actionType.toUpperCase().includes("PENDING"))) ||
                    (signal.type && signal.type.toUpperCase().includes("PENDING"));`;

code = code.replace(oldStr, newStr);
fs.writeFileSync('src/services/backtest/engine.ts', code);
console.log("Patched isLimit logic.");
