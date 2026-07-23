const text = "My Stop Loss - 112.80";
const slRegexes = [
      /(?:SL|STOP LOSS|STOPLOSS|STOP|LIMIT)\s*(?:IS\s*|:\s*|=\s*|\s+|-|@|\.)\s*(\d+(?:\.\d+)?)/i
];
for (const regex of slRegexes) {
  const match = text.toUpperCase().match(regex);
  if (match) {
    console.log("SL:", parseFloat(match[1]));
  }
}
