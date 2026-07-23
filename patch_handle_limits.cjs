const fs = require('fs');
let code = fs.readFileSync('src/services/testing/engine.ts', 'utf8');

const oldCode = `async function handleRateLimits(job: TestingJob) {
  while (true) {
    if (job.status === "paused") {
       logJob(job, "Job is paused by user. Waiting...");
       await sleep(5000);
       return;
    }
    // We break out if not paused. The actual quotas are handled by catch blocks
    break;
  }
}`;

const newCode = `async function handleRateLimits(job: TestingJob) {
  while (job.status === "paused") {
    logJob(job, "Job is paused by user. Waiting...");
    await sleep(5000);
  }
}`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/services/testing/engine.ts', code);
console.log("Fixed handleRateLimits");
