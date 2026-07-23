const fs = require('fs');
let code = fs.readFileSync('src/utils/jsonCleaner.ts', 'utf8');

const oldCode = `  // 1. Strip Markdown code blocks if they exist`;
const newCode = `  // 0. Strip <think>...</think> blocks from DeepSeek R1 reasoning models
  clean = clean.replace(/<think>[\\s\\S]*?<\\/think>/gi, '').trim();

  // 1. Strip Markdown code blocks if they exist`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/utils/jsonCleaner.ts', code);
console.log("Patched jsonCleaner.ts");
