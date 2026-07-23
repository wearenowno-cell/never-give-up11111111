const fs = require('fs');
let code = fs.readFileSync('src/services/testing/engine.ts', 'utf8');

code = code.replace(/const parsedChannelSignals: any\[\] = \[\];/, 'let parsedChannelSignals: any[] = [];');

fs.writeFileSync('src/services/testing/engine.ts', code);
console.log("Patched engine.ts");
