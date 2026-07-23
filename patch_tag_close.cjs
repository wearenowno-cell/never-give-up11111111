const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `: "bg-slate-950/20 border-slate-900/60 text-slate-400 hover:bg-slate-900 hover:text-slate-200 hover:border-slate-800"
                            }\``;
const replacement = `: "bg-slate-950/20 border-slate-900/60 text-slate-400 hover:bg-slate-900 hover:text-slate-200 hover:border-slate-800"
                            }\`}`;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code);
console.log("Fixed JSX className brace");
