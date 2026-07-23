const fs = require('fs');
let code = fs.readFileSync('src/services/testing/engine.ts', 'utf8');

code = code.replace(/import \{ parseSignalsLocally \} from "\.\.\/parser\/regex\.js";/, 'import { parseSignalsLocally, deduplicateSignals } from "../parser/regex.js";');

code = code.replace(/channelJob\.signalsFound = parsedChannelSignals\.length;/g, 
`parsedChannelSignals = deduplicateSignals(parsedChannelSignals);
      channelJob.signalsFound = parsedChannelSignals.length;`);

fs.writeFileSync('src/services/testing/engine.ts', code);
console.log("Patched engine.ts");
