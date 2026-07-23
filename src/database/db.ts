import Database from "better-sqlite3";
import * as path from "path";
import { logger } from "../utils/logger.js";

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

let db: Database.Database;

export function initDatabase() {
  if (db) return db;
  
  const dbPath = path.join(process.cwd(), "cache.db");
  
  // Initialize with timeout to prevent locks
  db = new Database(dbPath, { timeout: 10000 });
  
  // Force WAL mode for simultaneous read/write
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  
  // Create table for 1-minute candles
  db.exec(`
    CREATE TABLE IF NOT EXISTS candles (
      symbol TEXT,
      timestamp INTEGER,
      open REAL,
      high REAL,
      low REAL,
      close REAL,
      PRIMARY KEY (symbol, timestamp)
    )
  `);

  // Create an index for faster range querying
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_candles_lookup 
    ON candles (symbol, timestamp)
  `);

  // Signals table: persists parsed signals with their channel source tag
  db.exec(`
    CREATE TABLE IF NOT EXISTS signals (
      id TEXT PRIMARY KEY,
      asset TEXT NOT NULL,
      type TEXT NOT NULL,
      entryPrice REAL,
      stopLoss REAL,
      takeProfits TEXT,
      datetime TEXT,
      notes TEXT,
      channelSource TEXT,
      createdAt INTEGER DEFAULT (strftime('%s','now'))
    )
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_signals_channel
    ON signals (channelSource)
  `);

  logger.info(`[SQLite Cache] Initialized SQLite database successfully at: ${dbPath} in WAL mode`);
  
  return db;
}

export function saveSignal(signal: {
  id: string; asset: string; type: string; entryPrice: number;
  stopLoss: number; takeProfits: number[]; datetime?: string | null;
  notes?: string | null; channelSource?: string;
}): void {
  initDatabase();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO signals
      (id, asset, type, entryPrice, stopLoss, takeProfits, datetime, notes, channelSource)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    signal.id, signal.asset, signal.type, signal.entryPrice,
    signal.stopLoss, JSON.stringify(signal.takeProfits || []),
    signal.datetime ?? null, signal.notes ?? null, signal.channelSource ?? null
  );
}

export function getSignalsByChannel(channelSource: string): any[] {
  initDatabase();
  const stmt = db.prepare(`
    SELECT * FROM signals WHERE channelSource = ? ORDER BY createdAt ASC
  `);
  const rows = stmt.all(channelSource) as any[];
  return rows.map(r => ({
    ...r,
    takeProfits: JSON.parse(r.takeProfits || "[]")
  }));
}

export function getAllChannels(): string[] {
  initDatabase();
  const stmt = db.prepare(`
    SELECT DISTINCT channelSource FROM signals WHERE channelSource IS NOT NULL
  `);
  return (stmt.all() as any[]).map(r => r.channelSource);
}

export function getCachedCandles(
  symbol: string,
  startTimeSec: number,
  endTimeSec: number
): Candle[] {
  initDatabase();
  const stmt = db.prepare(`
    SELECT timestamp, open, high, low, close 
    FROM candles 
    WHERE symbol = ? AND timestamp >= ? AND timestamp <= ?
    ORDER BY timestamp ASC
  `);
  
  const rows = stmt.all(symbol, startTimeSec, endTimeSec) as any[];
  return rows.map(r => ({
    timestamp: Number(r.timestamp),
    open: Number(r.open),
    high: Number(r.high),
    low: Number(r.low),
    close: Number(r.close)
  }));
}

export function saveCandlesToCache(symbol: string, candles: Candle[]): void {
  if (!candles || candles.length === 0) return;
  initDatabase();
  
  // High-Performance SQLite Chunked Insertion
  const CHUNK_SIZE = 500;
  for (let i = 0; i < candles.length; i += CHUNK_SIZE) {
    const chunk = candles.slice(i, i + CHUNK_SIZE);
    const placeholders = chunk.map(() => "(?, ?, ?, ?, ?, ?)").join(", ");
    const sql = `INSERT OR REPLACE INTO candles (symbol, timestamp, open, high, low, close) VALUES ${placeholders}`;
    const stmt = db.prepare(sql);
    
    const params: any[] = [];
    for (const c of chunk) {
      params.push(symbol, c.timestamp, c.open, c.high, c.low, c.close);
    }
    stmt.run(...params);
  }
  
  logger.info(`[SQLite Cache] Saved/Updated ${candles.length} candles in cache for symbol: ${symbol} using chunked insertion`);
}

export function getCacheCoverage(
  symbol: string,
  startTimeSec: number,
  endTimeSec: number
): { hasCoverage: boolean; count: number } {
  initDatabase();
  
  // Get count of existing candles
  const stmt = db.prepare(`
    SELECT COUNT(*) as cnt 
    FROM candles 
    WHERE symbol = ? AND timestamp >= ? AND timestamp <= ?
  `);
  const row = stmt.get(symbol, startTimeSec, endTimeSec) as { cnt: number };
  const count = row ? row.cnt : 0;
  
  const rangeSeconds = endTimeSec - startTimeSec;
  const expectedCount = Math.floor(rangeSeconds / 60);

  const threshold = Math.max(50, Math.floor(expectedCount * 0.3));
  
  return {
    hasCoverage: count >= threshold,
    count
  };
}
