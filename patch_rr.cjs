const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldRR = `    if (!entry || !sl || !tp1 || sl === entry) return { grade: "?", color: "text-slate-500 bg-slate-800", rr: 0 };
    const risk   = Math.abs(entry - sl);
    const reward = Math.abs(tp1   - entry);
    const rr     = reward / risk;`;

const newRR = `    if (!entry || !sl || !tp1 || sl === entry) return { grade: "?", color: "text-slate-500 bg-slate-800", rr: 0 };
    
    const isBuy = sig.type?.toUpperCase().includes("BUY");
    const risk   = isBuy ? entry - sl : sl - entry;
    const reward = isBuy ? tp1 - entry : entry - tp1;
    
    if (risk <= 0 || reward <= 0) {
      return { grade: "ERR", color: "text-rose-500 bg-rose-500/10 border border-rose-500/20", rr: 0 };
    }
    const rr = reward / risk;`;

if(code.includes(oldRR)){
   code = code.replace(oldRR, newRR);
   fs.writeFileSync('src/App.tsx', code);
   console.log("Patched RR in App.tsx");
} else {
   console.log("oldRR not found in App.tsx");
}
