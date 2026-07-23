const text = "Target - 4077.0";
const tpRegexes = [
      /(?:TP\d*|TAKE\s*PROFIT\d*|TARGET\d*|GOAL\d*)\s*(?:IS\s*|:\s*|=\s*|\s+|-|@|\.)\s*(\d+(?:\.\d+)?)/gi
];
const takeProfits = [];
for (const regex of tpRegexes) {
  let m;
  while ((m = regex.exec(text.toUpperCase())) !== null) {
    takeProfits.push(parseFloat(m[1]));
  }
}
console.log(takeProfits);
