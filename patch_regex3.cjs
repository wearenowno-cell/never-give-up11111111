const fs = require('fs');
let code = fs.readFileSync('src/services/parser/regex.ts', 'utf8');

const targetStr = `  if (msgsToParse && msgsToParse.length > 0) {
    let currentGroupText = "";`;

const newStr = `  if (msgsToParse && msgsToParse.length > 0) {
    // Ensure chronological order for proper grouping
    const sortedMsgs = [...msgsToParse].sort((a, b) => {
      const tA = a.date || a.original_utc_timestamp || a.provided_timestamp || 0;
      const tB = b.date || b.original_utc_timestamp || b.provided_timestamp || 0;
      return Number(tA) - Number(tB);
    });

    let currentGroupText = "";`;

code = code.replace(targetStr, newStr);

// Also change the loop to use sortedMsgs
code = code.replace(/for \(let i = 0; i < msgsToParse\.length; i\+\+\) \{/g, 'for (let i = 0; i < sortedMsgs.length; i++) {');
code = code.replace(/const msg = msgsToParse\[i\];/g, 'const msg = sortedMsgs[i];');

fs.writeFileSync('src/services/parser/regex.ts', code);
console.log("Patched regex.ts");
