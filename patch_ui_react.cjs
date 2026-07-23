const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/React\.useState/g, 'useState');
code = code.replace(/React\.useEffect/g, 'useEffect');

code = code.replace(/backtestConfig: backtestConfig/g, 'backtestConfig: {}'); // Mock config since UI isn't defining it right here

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx react issues");
