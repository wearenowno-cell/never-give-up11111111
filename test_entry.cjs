const text = "The market is trading on 112.70 pivot level.";
const entryRegexes = [
      /(?:NOW\s*@|ENTRY\s*@|BUY\s*@|SELL\s*@|LONG\s*@|SHORT\s*@|@)\s*(\d+(?:\.\d+)?)/i,
      /(?:ENTRY|PRICE|NOW|AT|ON|ZONE|POINT|LEVEL|FROM|AROUND)\s*(?:PRICE\s*)?(?:IS\s*)?(\d+(?:\.\d+)?)/i,
      /(\d+(?:\.\d+)?)\s*(?:pivot)?\s*level/i,
      /(?:BUY|SELL|LONG|SHORT)\s*(?:GOLD|XAUUSD|BTCUSD|EURUSD|GBPUSD|[A-Z]{6})?\s*(?:NOW\s*)?(?:AT|AROUND|FROM)?\s*(\d+(?:\.\d+)?)/i
];
for (const regex of entryRegexes) {
  const match = text.toUpperCase().match(regex);
  if (match) {
    console.log("Entry:", parseFloat(match[1]));
    break;
  }
}
