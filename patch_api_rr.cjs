const fs = require('fs');
let code = fs.readFileSync('src/routes/api.ts', 'utf8');

const oldAPI = `      const riskPips = Math.abs(t.entryPrice - t.stopLoss) / specs.pipSize;
      if (riskPips > 0 && t.takeProfits && t.takeProfits.length > 0) {
        const rewardPips = Math.abs(t.takeProfits[0] - t.entryPrice) / specs.pipSize;
        sumRR += rewardPips / riskPips;
        countRR++;
      }`;

const newAPI = `      const isBuy = t.signal?.type?.toUpperCase().includes("BUY");
      const riskPips = (isBuy ? t.entryPrice - t.stopLoss : t.stopLoss - t.entryPrice) / specs.pipSize;
      if (riskPips > 0 && t.takeProfits && t.takeProfits.length > 0) {
        const rewardPips = (isBuy ? t.takeProfits[0] - t.entryPrice : t.entryPrice - t.takeProfits[0]) / specs.pipSize;
        if (rewardPips > 0) {
          sumRR += rewardPips / riskPips;
          countRR++;
        }
      }`;

if(code.includes(oldAPI)){
   code = code.replace(oldAPI, newAPI);
   fs.writeFileSync('src/routes/api.ts', code);
   console.log("Patched RR in api.ts");
} else {
   console.log("oldAPI not found in api.ts");
}
