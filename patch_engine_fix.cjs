const fs = require('fs');
let code = fs.readFileSync('src/services/testing/engine.ts', 'utf8');

code = code.replace('const channelJob = job.channels[cIdx];', '');
code = code.replace(/continue;/g, 'return;');

fs.writeFileSync('src/services/testing/engine.ts', code);
console.log("Fixed compile errors in engine.ts");
