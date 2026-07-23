const fs = require('fs');
let code = fs.readFileSync('src/services/testing/engine.ts', 'utf8');

const old_parse = `         let attempts = 0;
         let success = false;
         while (attempts < 3 && !success) {
           try {
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

const new_parse = `         let success = false;
         let fallbackAttempts = 0;
         while (!success) {
           await handleRateLimits(job);
           try {
             const fakeReq = { body: {} };
             const res = await executeMastermindPipeline(fakeReq, rawItems, providerConfig, uniqueGroqKeys, []);
             parsedChannelSignals.push(...res.signals);
             success = true;
           } catch (err: any) {
             const errMsg = (err.message || "").toLowerCase();
             if (errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("timeout") || errMsg.includes("exhausted") || errMsg.includes("resource_exhausted") || errMsg.includes("rate limit")) {
                logJob(job, \`API Quota/Rate Limit hit. Halting AI parser to recover (Sleeping 60s)...\`);
                await sleep(60000);
             } else {
                fallbackAttempts++;
                logJob(job, \`Parse chunk failed: \${err.message}. Retrying...\`);
                await sleep(5000);
                if (fallbackAttempts > 5) {
                   logJob(job, \`Fatal error persists. Falling back to local regex parser for this chunk.\`);
                   const fallbackSigs = parseSignalsLocally(chunk.map((c: any) => c.message).join("\\n\\n"), rawItems);
                   parsedChannelSignals.push(...fallbackSigs);
                   success = true;
                }
             }
           }
         }`;

code = code.replace(old_parse, new_parse);

// Now for concurrency
const loopRegex = /for \(let cIdx = 0; cIdx < job\.channels\.length; cIdx\+\+\) \{([\s\S]*?)job\.progress = Math\.round\(\(\(cIdx \+ 1\) \/ job\.channels\.length\) \* 100\);\s*\}/;

const match = code.match(loopRegex);
if (match) {
    let innerBody = match[1];
    
    // We will replace the for loop with a concurrent processor
    const concurrentCode = `
    let completedCount = 0;
    const concurrencyLimit = 5; // test tens of channels seamlessly 
    let activePromises = [];
    
    for (let cIdx = 0; cIdx < job.channels.length; cIdx++) {
      const channelJob = job.channels[cIdx];
      
      const processChannel = async () => {
         ${innerBody}
         completedCount++;
         job.progress = Math.round((completedCount / job.channels.length) * 100);
      };
      
      const p = processChannel().catch(e => logJob(job, \`Error in channel worker: \${e.message}\`));
      activePromises.push(p);
      
      if (activePromises.length >= concurrencyLimit) {
         await Promise.race(activePromises);
         activePromises = activePromises.filter(prom => {
             // To properly clean up, we just do a Promise.all at the end.
             // Actually, a better concurrency pool:
             return true; 
         });
      }
    }
    await Promise.all(activePromises);
    `;
    
    // A clean concurrency pool implementation:
    const betterConcurrentCode = `
    let completedCount = 0;
    const concurrencyLimit = 5;
    
    async function processChannel(channelJob: any, cIdx: number) {
        ${innerBody}
        completedCount++;
        job.progress = Math.round((completedCount / job.channels.length) * 100);
    }
    
    const executing = new Set<Promise<void>>();
    for (let cIdx = 0; cIdx < job.channels.length; cIdx++) {
        const channelJob = job.channels[cIdx];
        const p = processChannel(channelJob, cIdx).finally(() => executing.delete(p));
        executing.add(p);
        if (executing.size >= concurrencyLimit) {
            await Promise.race(executing);
        }
    }
    await Promise.all(executing);
    `;
    
    code = code.replace(loopRegex, betterConcurrentCode);
} else {
    console.log("Could not find loop to replace!");
}

fs.writeFileSync('src/services/testing/engine.ts', code);
console.log("Updated parsing and concurrency.");
