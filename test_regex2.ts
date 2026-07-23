import { parseSignalsLocally } from "./src/services/parser/regex.js";
const text = `#XAUUSD_SELL NOW  4015 -  4018 🔱
SL: 4021 ❌
TP:3995🎯
TP:3950🎯`;
console.log(parseSignalsLocally(text, [{id: 4, text: text, date: Date.now()}]));
