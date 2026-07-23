const textUpper = "#XAUUSD_SELL NOW  4015 -  4018 🔱\nSL: 4021 ❌\nTP:3995🎯\nTP:3950🎯";
let asset = "";
const assetRegex = /(XAUUSD|GOLD|XAU|BTCUSD|BTC|ETHUSD|ETH|SOLUSD|SOL|EURUSD|GBPUSD|USDJPY|AUDUSD|USDCAD|US30|NAS100|SPX500|EURJPY|AUDJPY)/i;
const assetMatch = textUpper.match(assetRegex);
if (assetMatch) {
  asset = assetMatch[1];
  if (asset === "GOLD" || asset === "XAU") asset = "XAUUSD";
}
console.log("Asset:", asset);
