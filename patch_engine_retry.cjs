const fs = require('fs');
let code = fs.readFileSync('src/services/testing/engine.ts', 'utf8');

// Replace the old while loop for chunk parsing
const target = `         let attempts = 0;
         let success = false;
         while (attempts < 3 && !success) {
           try {
             // Mock req for execution
             const fakeReq = { body: {} };
             const res = await executeMastermindPipeline(fakeReq, rawItems, providerConfig, uniqueGroqKeys, []);
             parsedChannelSignals.push(...res.signals);
             success = true;
           } catch (err: any) {
             attempts++;
             logJob(job, \`Parse chunk failed (Attempt \${attempts}): \${err.message}\`);
             if (err.message.includes("429") || err.message.includes("quota") || err.message.includes("TIMEOUT")) {
                logJob(job, \`API Quota/Rate Limit reached. Automatically pausing for recovery (60s)...\`);
                await sleep(60000);
             } else {
                await sleep(5000);
             }
           }
         }
         
         if (!success) {
            logJob(job, \`Chunk failed permanently, falling back to local regex...\`);
            const fallbackSigs = parseSignalsLocally(chunk.map((c: any) => c.message).join("\\n\\n"), rawItems);
            parsedChannelSignals.push(...fallbackSigs);
         }`;

const replacement = `         let success = false;
         let fallbackAttempts = 0;
         
         while (!success) {
           await handleRateLimits(job); // Check if user manually paused
           try {
             const fakeReq = { body: {} };
             const res = await executeMastermindPipeline(fakeReq, rawItems, providerConfig, uniqueGroqKeys, []);
             parsedChannelSignals.push(...res.signals);
             success = true;
           } catch (err: any) {
             const errMsg = (err.message || "").toLowerCase();
             if (errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("timeout") || errMsg.includes("exhausted") || errMsg.includes("resource_exhausted")) {
                logJob(job, \`API Quota/Rate Limit hit. Halting AI parser to recover (Sleeping 60s)...\`);
                await sleep(60000);
                // We do not increment fallbackAttempts here, so it waits indefinitely until limits recover.
             } else {
                fallbackAttempts++;
                logJob(job, \`Parse chunk failed: \${err.message}. Retrying...\`);
                await sleep(5000);
                
                if (fallbackAttempts > 5) {
                   logJob(job, \`Fatal error persists. Falling back to local regex parser for this chunk.\`);
                   const fallbackSigs = parseSignalsLocally(chunk.map((c: any) => c.message).join("\\n\\n"), rawItems);
                   parsedChannelSignals.push(...fallbackSigs);
                   success = true; // Move on
                }
             }
           }
         }`;

code = code.replace(target, replacement);
fs.writeFileSync('src/services/testing/engine.ts', code);
console.log("Updated parsing retry logic.");
