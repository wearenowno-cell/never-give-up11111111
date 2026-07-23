const fs = require('fs');
let code = fs.readFileSync('src/services/parser/mastermind.ts', 'utf8');

const oldStr = `          chunkSignals = valid;
          chunkProvider = \`\${tier.name} (Attempts: \${attempts})\`;
               
          if (hasInvalid) {
             logger.warn(\`[\${tier.name}] Emitted partially invalid schema. Supplementing with regex fallback...\`);
             const recovered = parseSignalsLocally(chunk.map((c: any) => c.text).join('\\n\\n'), chunk);
             chunkSignals = [...chunkSignals, ...recovered];
          }
          break; // Success, exit tier loop`;

const newStr = `          chunkSignals = valid;
          chunkProvider = \`\${tier.name} (Attempts: \${attempts})\`;
               
          // ALWAYS supplement with regex fallback to ensure 100% of signals are detected
          const recovered = parseSignalsLocally(chunk.map((c: any) => c.text).join('\\n\\n'), chunk);
          chunkSignals = [...chunkSignals, ...recovered];
          
          break; // Success, exit tier loop`;

if (code.includes(oldStr)) {
  code = code.replace(oldStr, newStr);
  fs.writeFileSync('src/services/parser/mastermind.ts', code);
  console.log("Success");
} else {
  console.log("Not found");
}
