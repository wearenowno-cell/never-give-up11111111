const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/split\("\n\n"\)/g, 'split("\\n\\n")');
code = code.replace(/join\("\n"\)/g, 'join("\\n")');
code = code.replace(/replace\(\/\\n\/\g/g, 'replace(/\\n/g'); 
code = code.replace(/\\n\\n/g, '\\n\\n'); // wait, the previous run replaced literal \n with actual newline.
