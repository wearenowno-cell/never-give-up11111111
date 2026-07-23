import { logger } from "./logger.js";

export function extractDateFromText(text: string): string | null {
  if (!text) return null;

  // 1. Matches YYYY[-./]MM[-./]DD HH:MM[:SS]
  const isoLikeRegex = /\b(\d{4})[-.\/](\d{2})[-.\/](\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?\b/;
  const isoLikeMatch = text.match(isoLikeRegex);
  if (isoLikeMatch) {
    const [_, y, m, d, hr, min, sec = "00"] = isoLikeMatch;
    const dateStr = `${y}-${m}-${d}T${hr}:${min}:${sec}.000Z`;
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  // 2. Matches DD[-./]MM[-./]YYYY HH:MM[:SS]
  const dmyRegex = /\b(\d{2})[-.\/](\d{2})[-.\/](\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?\b/;
  const dmyMatch = text.match(dmyRegex);
  if (dmyMatch) {
    const [_, d, m, y, hr, min, sec = "00"] = dmyMatch;
    const dateStr = `${y}-${m}-${d}T${hr}:${min}:${sec}.000Z`;
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  // 3. Matches YYYY-MM-DD
  const dateOnlyRegex = /\b(\d{4})[-.\/](\d{2})[-.\/](\d{2})\b/;
  const dateOnlyMatch = text.match(dateOnlyRegex);
  if (dateOnlyMatch) {
    const [_, y, m, d] = dateOnlyMatch;
    const dateStr = `${y}-${m}-${d}T00:00:00.000Z`;
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  return null;
}

// Helper to deduplicate signals (Symbol, Direction, Entry Price) within 15m windows
export function deduplicateSignals(signals: any[]): any[] {
  if (!signals || !Array.isArray(signals)) return [];
  const result: any[] = [];
  
  // Sort signals by datetime so we process chronologically
  const sorted = [...signals].sort((a, b) => {
    const tA = a.datetime ? new Date(a.datetime).getTime() : 0;
    const tB = b.datetime ? new Date(b.datetime).getTime() : 0;
    return tA - tB;
  });

  for (const sig of sorted) {
    const sigTime = sig.datetime ? new Date(sig.datetime).getTime() : 0;
    
    // Check if there is an existing signal in `result` that duplicates this one within 15 mins
    const duplicateIdx = result.findIndex(existing => {
      const isSameAsset = (existing.asset || "").toUpperCase().trim() === (sig.asset || "").toUpperCase().trim();
      const existingDir = (existing.type || "").toUpperCase().includes("BUY") ? "BUY" : "SELL";
      const sigDir = (sig.type || "").toUpperCase().includes("BUY") ? "BUY" : "SELL";
      const isSameDirection = existingDir === sigDir;
      
      // Check entry price (within 0.05% tolerance)
      const priceDiffRatio = Math.abs(existing.entryPrice - sig.entryPrice) / (existing.entryPrice || 1);
      const isNearPrice = priceDiffRatio <= 0.0005;
      
      // Check if within 15 minutes
      const existingTime = existing.datetime ? new Date(existing.datetime).getTime() : 0;
      const isWithinTime = Math.abs(sigTime - existingTime) <= 15 * 60 * 1000;
      
      return isSameAsset && isSameDirection && isNearPrice && isWithinTime;
    });

    if (duplicateIdx === -1) {
      result.push(sig);
    } else {
      logger.info(`[Signal Ingestion] Duplicate message detected within 15m. Merging signal inputs...`);
      const existing = result[duplicateIdx];
      // Merge take profits by combining and unique filtering
      if (sig.takeProfits && Array.isArray(sig.takeProfits)) {
        const combinedTps = [...(existing.takeProfits || []), ...sig.takeProfits];
        existing.takeProfits = Array.from(new Set(combinedTps)).sort((a, b) => (a as number) - (b as number));
      }
      // Merge notes
      if (sig.notes) {
        existing.notes = existing.notes ? `${existing.notes} | ${sig.notes}` : sig.notes;
      }
    }
  }

  return result;
}
