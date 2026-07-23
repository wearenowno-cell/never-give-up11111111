import { parseSignalsLocally } from "./src/services/parser/regex.js";
const msgs = [
  { id: 1, text: "XAUUSD SELL NOW 4015", date: 1000 },
  { id: 2, text: "SL 4021", date: 1005 },
  { id: 3, text: "TP 3995", date: 1010 }
];
console.log(parseSignalsLocally("", msgs));
