import { logger } from "./logger.js";
import { getAssetSpecs } from "./assets.js";

// Timezone/UTC normalization handlers
export function normalizeSignalTimeToUTC(
  datetime: string | null | undefined,
  sourceTimezoneOffsetHours: number
): number {
  if (!datetime) return 0;
  const rawMs = new Date(datetime).getTime();
  if (isNaN(rawMs)) return 0;
  const offsetMs = sourceTimezoneOffsetHours * 3600 * 1000;
  return Math.floor((rawMs - offsetMs) / 1000);
}

// News window detection algorithms
export function detectNewsWindow(utcMs: number): { isEvent: boolean; eventName: string; multiplier: number } {
  const d = new Date(utcMs);
  const day  = d.getUTCDay();
  const h    = d.getUTCHours();
  const min  = d.getUTCMinutes();
  const dom  = d.getUTCDate();
  const totalMinInDay = h * 60 + min;

  const near = (refH: number, refMin: number) => Math.abs(totalMinInDay - (refH * 60 + refMin)) <= 15;

  if (day === 5 && dom <= 7 && near(13, 30))
    return { isEvent: true, eventName: "NFP", multiplier: 5 };
  if (day === 3 && dom >= 10 && dom <= 16 && near(13, 30))
    return { isEvent: true, eventName: "CPI", multiplier: 4 };
  if ((day === 3 || day === 2) && near(19, 0))
    return { isEvent: true, eventName: "FOMC", multiplier: 4 };
  if (day === 4 && dom >= 23 && near(13, 30))
    return { isEvent: true, eventName: "GDP", multiplier: 3 };
  if (dom <= 4 && day >= 1 && day <= 5 && near(15, 0))
    return { isEvent: true, eventName: "ISM", multiplier: 3 };

  return { isEvent: false, eventName: "", multiplier: 1 };
}

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}


