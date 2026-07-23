const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `const data = await res.json();
                       if (data.jobId) window.currentJobId = data.jobId;
                       window.jobInterval = setInterval(async () => {`;

const replacement = `const data = await res.json();
                       if (data.jobId) window.currentJobId = data.jobId;
                       if (window.jobInterval) clearInterval(window.jobInterval);
                       window.jobInterval = setInterval(async () => {`;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code);
console.log("Fixed interval leak");
