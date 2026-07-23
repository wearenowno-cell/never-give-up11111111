const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldMap = `                    <tbody className="divide-y divide-slate-900 bg-slate-950/20">
                      {signals?.map((sig) => (`;
const newMap = `                    <tbody className="divide-y divide-slate-900 bg-slate-950/20">
                      {filteredSignals.map((sig) => (`;

if (code.includes(oldMap)) {
  code = code.replace(oldMap, newMap);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched array mapping in App.tsx");
} else {
  console.log("Failed to find mapping");
}
