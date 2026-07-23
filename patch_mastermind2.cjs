const fs = require('fs');
let code = fs.readFileSync('src/services/parser/mastermind.ts', 'utf8');

code = code.replace(/if \(hasInvalid\) \{[\s\S]*?break; \/\/ Success, exit tier loop/m, 
`// ALWAYS supplement with regex fallback to ensure 100% of signals are detected
          const recovered = parseSignalsLocally(chunk.map((c: any) => c.text).join('\\n\\n'), chunk);
          chunkSignals = [...chunkSignals, ...recovered];
          break; // Success, exit tier loop`);

fs.writeFileSync('src/services/parser/mastermind.ts', code);
console.log("Success");
