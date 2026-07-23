import { logger } from "../../utils/logger.js";
import { executeMastermindPipeline, ProviderConfig } from "../parser/mastermind.js";
import { runPortfolioBacktest } from "../portfolio/manager.js";
import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { parseSignalsLocally } from "../parser/regex.js";

export interface TestingJob {
  id: string;
  status: "running" | "paused" | "completed" | "failed";
  progress: number;
  logs: string[];
  report: any;
  channels: {
    id: string;
    chatId: string;
    status: "pending" | "fetching" | "parsing" | "backtesting" | "completed" | "failed";
    messagesProcessed: number;
    totalMessages: number;
    signalsFound: number;
    metrics: any;
    errors: string[];
  }[];
  config: any;
}

export const testingJobs = new Map<string, TestingJob>();

function logJob(job: TestingJob, msg: string) {
  logger.info(`[TestingJob ${job.id}] ${msg}`);
  job.logs.push(`[${new Date().toISOString()}] ${msg}`);
}

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

// 429 and limit recovery helper
async function handleRateLimits(job: TestingJob) {
  while (true) {
    if (job.status === "paused") {
       logJob(job, "Job is paused by user. Waiting...");
       await sleep(5000);
       continue;
    }
    // We break out if not paused. The actual quotas are handled by catch blocks
    break;
  }
}

export async function startLargeScaleTest(jobId: string, req: any) {
  const job = testingJobs.get(jobId);
  if (!job) return;

  const { channels, limit, providerConfig, tgSession, apiId, apiHash, backtestConfig, uniqueGroqKeys } = job.config;

  try {
    const parsedApiId = parseInt(apiId, 10);
    const session = new StringSession(tgSession);
    const client = new TelegramClient(session, parsedApiId, apiHash, {
      useWSS: false,
      requestRetries: 10,
      connectionRetries: 10,
      timeout: 120000,
      retryDelay: 2000
    });

    await client.connect();
    logJob(job, "Connected to Telegram.");

    const allParsedSignals: any[] = [];

    for (let cIdx = 0; cIdx < job.channels.length; cIdx++) {
      const channelJob = job.channels[cIdx];
      channelJob.status = "fetching";
      logJob(job, `Started processing channel ${channelJob.chatId}...`);

      let targetEntity: any = null;
      try {
         const cleanId = channelJob.chatId.trim();
         targetEntity = await client.getEntity(cleanId);
      } catch (e: any) {
         try {
            const dialogs = await client.getDialogs({});
            const cleanId = channelJob.chatId.trim().toLowerCase();
            for (const d of dialogs) {
              const title = (d.title || "").toLowerCase();
              const name = (d.name || "").toLowerCase();
              if (title.includes(cleanId) || name.includes(cleanId) || (d.id && d.id.toString() === cleanId)) {
                targetEntity = d.entity;
                break;
              }
            }
         } catch(e2) {}
      }

      if (!targetEntity) {
         channelJob.status = "failed";
         channelJob.errors.push("Could not resolve Telegram entity.");
         logJob(job, `Failed to resolve entity ${channelJob.chatId}`);
         continue;
      }

      // Fetch messages with pagination and sleep to avoid TG flood wait
      let allMessages: any[] = [];
      let offsetId = 0;
      let left = limit;

      while (left > 0) {
         await handleRateLimits(job);
         const batchSize = Math.min(left, 100);
         try {
           const history: any = await client.invoke(new Api.messages.GetHistory({
              peer: targetEntity,
              limit: batchSize,
              offsetId: offsetId
           }));
           
           if (!history || !history.messages || history.messages.length === 0) break;
           
           const msgs = history.messages;
           allMessages.push(...msgs);
           offsetId = msgs[msgs.length - 1].id;
           left -= msgs.length;
           
           channelJob.messagesProcessed = allMessages.length;
           logJob(job, `Fetched ${allMessages.length} messages from ${channelJob.chatId}...`);
           
           await sleep(1000); // Prevent TG Flood wait
         } catch (err: any) {
           if (err.message && err.message.includes("FLOOD_WAIT")) {
             const waitSecs = parseInt(err.message.match(/\d+/)?.[0] || "30");
             logJob(job, `TG Flood wait ${waitSecs}s. Automatically pausing...`);
             await sleep(waitSecs * 1000 + 5000);
           } else {
             channelJob.errors.push(`Fetch error: ${err.message}`);
             break;
           }
         }
      }

      channelJob.totalMessages = allMessages.length;
      channelJob.status = "parsing";
      
      const CHUNK_SIZE = 50;
      const validMessages = allMessages.filter(m => m.message && m.message.trim().length > 0);
      const parsedChannelSignals: any[] = [];

      for (let i = 0; i < validMessages.length; i += CHUNK_SIZE) {
         await handleRateLimits(job);
         
         const chunk = validMessages.slice(i, i + CHUNK_SIZE);
         const rawItems = chunk.map((m: any) => ({
            id: m.id,
            text: m.message,
            date: m.date
         }));
         
         logJob(job, `Parsing chunk ${i/CHUNK_SIZE + 1} for ${channelJob.chatId}...`);
         
         let attempts = 0;
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
            const fallbackSigs = parseSignalsLocally(chunk.map((c: any) => c.message).join("\n\n"), rawItems);
            parsedChannelSignals.push(...fallbackSigs);
         }
      }

      channelJob.signalsFound = parsedChannelSignals.length;
      allParsedSignals.push(...parsedChannelSignals);
      channelJob.status = "backtesting";
      
      logJob(job, `Backtesting ${channelJob.signalsFound} signals for ${channelJob.chatId}...`);
      
      try {
        if (parsedChannelSignals.length > 0) {
            const result = await runPortfolioBacktest(parsedChannelSignals, backtestConfig, []);
            channelJob.metrics = {
               winRate: result.winRate,
               netROI: result.netProfitPercent,
               profitFactor: result.profitFactor,
               maxDrawdownPercent: result.maxDrawdownPercent,
               sharpeRatio: result.sharpeRatio,
               totalTrades: result.trades.length
            };
        } else {
            channelJob.metrics = { winRate: 0, netROI: 0, profitFactor: 0, maxDrawdownPercent: 0, sharpeRatio: 0, totalTrades: 0 };
        }
        channelJob.status = "completed";
      } catch (err: any) {
        channelJob.errors.push(`Backtest error: ${err.message}`);
        channelJob.status = "failed";
      }
      
      job.progress = Math.round(((cIdx + 1) / job.channels.length) * 100);
    }
    
    // Overall Report Generation
    const validMetrics = job.channels.filter(c => c.status === "completed" && c.metrics);
    job.report = {
      overallSignals: allParsedSignals.length,
      channelsTested: job.channels.length,
      successChannels: validMetrics.length,
      failedChannels: job.channels.filter(c => c.status === "failed").length,
      averageWinRate: validMetrics.reduce((s, c) => s + (c.metrics.winRate || 0), 0) / (validMetrics.length || 1),
      averageROI: validMetrics.reduce((s, c) => s + (c.metrics.netROI || 0), 0) / (validMetrics.length || 1),
      totalTrades: validMetrics.reduce((s, c) => s + (c.metrics.totalTrades || 0), 0)
    };
    
    job.status = "completed";
    logJob(job, "Large Scale Testing Job Completed Successfully.");

  } catch (err: any) {
    job.status = "failed";
    job.error = err.message;
    logJob(job, `Job Failed: ${err.message}`);
  }
}
