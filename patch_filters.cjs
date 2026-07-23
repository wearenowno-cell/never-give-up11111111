const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const hookAnchor = `const [filterValidation, setFilterValidation] = useState<string>("ALL");`;
const filterDefs = `
  const getAssetCategory = (asset: string) => {
    const a = (asset || "").toUpperCase();
    if (a.includes("XAU") || a.includes("GOLD") || a.includes("SILVER") || a.includes("XAG")) return "METALS";
    if (a.includes("BTC") || a.includes("ETH") || a.includes("SOL") || a.includes("CRYPTO")) return "CRYPTO";
    if (a.includes("US30") || a.includes("NAS") || a.includes("SPX") || a.includes("DOW") || a.includes("GER") || a.includes("UK100")) return "INDICES";
    return "FOREX";
  };

  const filteredSignals = (signals || []).filter(sig => {
    if (filterAssetCategory !== "ALL" && getAssetCategory(sig.asset) !== filterAssetCategory) return false;
    if (filterValidation === "MISSING_SL" && sig.stopLoss) return false;
    if (filterValidation === "MISSING_TP" && sig.takeProfits && sig.takeProfits.length > 0) return false;
    if (filterValidation === "INVALID_RR") {
      const rrGrade = getSignalRRGrade(sig);
      if (rrGrade.grade !== "ERR" && rrGrade.grade !== "?") return false;
    }
    if (filterValidation === "VALID") {
      const rrGrade = getSignalRRGrade(sig);
      if (rrGrade.grade === "ERR" || rrGrade.grade === "?") return false;
    }
    return true;
  });
`;

if (code.includes(hookAnchor) && !code.includes("const filteredSignals =")) {
  code = code.replace(hookAnchor, hookAnchor + "\n" + filterDefs);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Injected filteredSignals definition");
} else {
  console.log("Failed to inject filteredSignals");
}
