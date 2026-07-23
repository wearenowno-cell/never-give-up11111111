const fs = require('fs');

let apiCode = fs.readFileSync('src/routes/api.ts', 'utf8');

// Extract deduplicateSignals
const dedupeMatch = apiCode.match(/\/\/ Helper to deduplicate signals[\s\S]*?function deduplicateSignals\([\s\S]*?^}/m);
if (dedupeMatch) {
  let dedupeCode = dedupeMatch[0];
  dedupeCode = dedupeCode.replace('function deduplicateSignals', 'export function deduplicateSignals');
  
  // Remove from api.ts
  apiCode = apiCode.replace(dedupeMatch[0], '');
  // Add import to api.ts
  apiCode = apiCode.replace(/import \{ parseSignalsLocally \}/, 'import { parseSignalsLocally, deduplicateSignals }');
  fs.writeFileSync('src/routes/api.ts', apiCode);
  
  // Add to regex.ts
  let regexCode = fs.readFileSync('src/services/parser/regex.ts', 'utf8');
  regexCode += '\n' + dedupeCode + '\n';
  fs.writeFileSync('src/services/parser/regex.ts', regexCode);
  
  console.log("Moved deduplicateSignals to regex.ts");
} else {
  console.log("Could not find deduplicateSignals in api.ts");
}
