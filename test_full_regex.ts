import { parseSignalsLocally } from "./src/services/parser/regex.js";
const text = "#XAUUSD_SELL NOW  4015 -  4018 🔱\nSL: 4021 ❌\nTP:3995🎯\nTP:3950🎯";
console.log(parseSignalsLocally(text, [{id: 4, text: text, date: Date.now()}]));
