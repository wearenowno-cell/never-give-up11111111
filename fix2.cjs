const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = 'const blocks = rawText.split("';
const target2 = '");';
const fullTarget = 'const blocks = rawText.split("\\n\\n");';

if (code.includes('const blocks = rawText.split("')) {
  // It's broken.
  // We need to replace the broken multiline string.
  const lines = code.split('\\n');
  let newLines = [];
  for(let i=0; i<lines.length; i++) {
     if (lines[i].includes('const blocks = rawText.split("')) {
        newLines.push('    const blocks = rawText.split("\\n\\n");');
        i++; // skip the empty line
        i++; // skip the ");"
     } else {
        newLines.push(lines[i]);
     }
  }
  fs.writeFileSync('src/App.tsx', newLines.join('\\n'));
  console.log("Fixed multiline split");
}
