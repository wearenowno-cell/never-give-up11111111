const fs = require('fs');
let code = fs.readFileSync('src/services/parser/regex.ts', 'utf8');

code = code.replace(/pair: asset\.toUpperCase\(\),/g, 'asset: asset.toUpperCase(),\n      pair: asset.toUpperCase(),');
code = code.replace(/action: type,/g, 'type: type,\n      action: type,');

fs.writeFileSync('src/services/parser/regex.ts', code);
console.log("Replaced fields");
