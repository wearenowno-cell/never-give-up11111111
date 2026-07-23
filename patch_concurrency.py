import re

with open('src/services/testing/engine.ts', 'r') as f:
    code = f.read()

# 1. Update the parsing retry logic
old_parse = """         let attempts = 0;
         let success = false;
         while (attempts < 3 && !success) {
           try {
             const fakeReq = { body: {} };
             const res = await executeMastermindPipeline(fakeReq, rawItems, providerConfig, uniqueGroqKeys, []);
             parsedChannelSignals.push(...res.signals);
             success = true;
           } catch (err: any) {
             attempts++;
             logJob(job, `Parse chunk failed (Attempt ${attempts}): ${err.message}`);
             if (err.message.includes("429") || err.message.includes("quota") || err.message.includes("TIMEOUT")) {
                logJob(job, `API Quota/Rate Limit reached. Automatically pausing for recovery (60s)...`);
                await sleep(60000);
             } else {
                await sleep(5000);
             }
           }
         }
         
         if (!success) {
            logJob(job, `Chunk failed permanently, falling back to local regex...`);
            const fallbackSigs = parseSignalsLocally(chunk.map((c: any) => c.message).join("\\n\\n"), rawItems);
            parsedChannelSignals.push(...fallbackSigs);
         }"""

new_parse = """         let success = false;
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
                logJob(job, `API Quota/Rate Limit hit. Halting AI parser to recover (Sleeping 60s)...`);
                await sleep(60000);
             } else {
                fallbackAttempts++;
                logJob(job, `Parse chunk failed: ${err.message}. Retrying...`);
                await sleep(5000);
                if (fallbackAttempts > 5) {
                   logJob(job, `Fatal error persists. Falling back to local regex parser for this chunk.`);
                   const fallbackSigs = parseSignalsLocally(chunk.map((c: any) => c.message).join("\\n\\n"), rawItems);
                   parsedChannelSignals.push(...fallbackSigs);
                   success = true;
                }
             }
           }
         }"""
         
code = code.replace(old_parse, new_parse)

# 2. Make channels process concurrently (e.g., limit 3)
old_loop_start = """    const allParsedSignals: any[] = [];

    for (let cIdx = 0; cIdx < job.channels.length; cIdx++) {
      const channelJob = job.channels[cIdx];"""

new_loop_start = """    const allParsedSignals: any[] = [];
    
    // Concurrent processing with limit
    let completedCount = 0;
    const concurrencyLimit = 3;
    let activePromises = [];
    
    for (let cIdx = 0; cIdx < job.channels.length; cIdx++) {
      const channelJob = job.channels[cIdx];
      
      const processChannel = async () => {"""

code = code.replace(old_loop_start, new_loop_start)


old_loop_end = """      job.progress = Math.round(((cIdx + 1) / job.channels.length) * 100);
    }
    
    // Overall Report Generation"""

new_loop_end = """      completedCount++;
      job.progress = Math.round((completedCount / job.channels.length) * 100);
    };
    
    const p = processChannel();
    activePromises.push(p);
    if (activePromises.length >= concurrencyLimit) {
        await Promise.race(activePromises);
        activePromises = activePromises.filter(prom => {
            // Need a way to clear finished promises, but Promise.allSettled at end is safer.
            // Let's use a simpler concurrency model inside the block.
            return true;
        });
    }
    """

# Actually, the activePromises logic above is flawed. Let's rewrite the loop completely using a robust pattern.
