const fs = require('fs');
let code = fs.readFileSync('src/services/parser/queue.ts', 'utf8');

code = code.replace(/import \{ executeMastermindPipeline \} from "\.\/mastermind\.js";/, 'import { executeMastermindPipeline } from "./mastermind.js";\nimport { deduplicateSignals } from "./regex.js";');

code = code.replace(/if \(result\.signals && result\.signals\.length > 0\) \{/g, 
`if (result.signals && result.signals.length > 0) {
           result.signals = deduplicateSignals(result.signals);`);

fs.writeFileSync('src/services/parser/queue.ts', code);
console.log("Patched queue.ts");
