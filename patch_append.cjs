const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldAppend = `        // Append to the existing Signal Database instead of replacing it -- otherwise each
        // new parse silently wipes out every signal found in earlier batches.
        setSignals(prev => [...prev, ...structuredSignals]);`;

const newAppend = `        // Append to the existing Signal Database, but deduplicate based on Asset + Entry Price + Type
        setSignals(prev => {
          const merged = [...prev];
          for (const newSig of structuredSignals) {
            const isModify = newSig.actionType?.toUpperCase() === "MODIFY" || newSig.type?.toUpperCase() === "MODIFY";
            if (isModify) {
              merged.push(newSig);
              continue;
            }
            const duplicateIdx = merged.findIndex(existing => {
              if (existing.actionType?.toUpperCase() === "MODIFY" || existing.type?.toUpperCase() === "MODIFY") return false;
              const sameAsset = existing.asset?.toUpperCase().trim() === newSig.asset?.toUpperCase().trim();
              const sameType = existing.type?.toUpperCase().includes("BUY") === newSig.type?.toUpperCase().includes("BUY");
              const priceDiff = Math.abs(existing.entryPrice - newSig.entryPrice) / (existing.entryPrice || 1);
              return sameAsset && sameType && priceDiff <= 0.0005; // 0.05% tolerance
            });
            if (duplicateIdx === -1) {
              merged.push(newSig);
            } else {
               // Merge take profits
               const existing = merged[duplicateIdx];
               if (newSig.takeProfits) {
                 const combinedTps = [...(existing.takeProfits || []), ...newSig.takeProfits];
                 existing.takeProfits = Array.from(new Set(combinedTps)).sort((a, b) => {
                    const dir = existing.type?.toUpperCase().includes("BUY") ? "BUY" : "SELL";
                    return dir === "BUY" ? a - b : b - a;
                 });
               }
            }
          }
          return merged;
        });`;

if (code.includes(oldAppend)) {
  code = code.replace(oldAppend, newAppend);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched append deduplication in App.tsx");
} else {
  console.log("oldAppend not found");
}
