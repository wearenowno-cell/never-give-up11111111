import { logger } from "./logger.js";

export interface AssetSpecs {
  pipSize: number;
  lotMultiplier: number;
  pipValuePerLot: number;
}

export function normalizeAssetTicker(assetName: string): string {
  const raw = assetName.toUpperCase().trim();
  return raw
    .replace(/^[#@!+]/, "")
    .replace(/[._\-](SB|PRO|ECN|MINI|MICRO|NDD|STP|A|B)$/i, "")
    .replace(/[._\-].+$/, "")
    .replace(/M$/, (_m, _off, full) => full.length > 7 ? "M" : "")
    .replace(/[^A-Z0-9]/g, "");
}

export function getAssetSpecs(assetName: string): AssetSpecs {
  const asset = normalizeAssetTicker(assetName);

  if (asset.includes("JPY")) {
    return { pipSize: 0.01, lotMultiplier: 100000, pipValuePerLot: 10 };
  }

  if (asset.includes("BTC") || asset.includes("BITCOIN")) {
    return { pipSize: 1.00, lotMultiplier: 1, pipValuePerLot: 1 };
  }
  if (asset.includes("ETH") || asset.includes("ETHEREUM")) {
    return { pipSize: 0.10, lotMultiplier: 1, pipValuePerLot: 1 };
  }
  if (asset.includes("SOL") || asset.includes("BNB") || asset.includes("ADA") ||
      asset.includes("DOT") || asset.includes("LTC") || asset.includes("AVAX") ||
      asset.includes("MATIC") || asset.includes("LINK") || asset.includes("XRP")) {
    return { pipSize: 0.01, lotMultiplier: 1, pipValuePerLot: 1 };
  }
  if (asset.includes("CRYPTO")) {
    return { pipSize: 1.00, lotMultiplier: 1, pipValuePerLot: 1 };
  }

  if (asset.includes("XAU") || asset.includes("GOLD") || asset === "GC") {
    return { pipSize: 0.10, lotMultiplier: 100, pipValuePerLot: 10 };
  }
  if (asset.includes("XAG") || asset.includes("SILVER") || asset === "SI") {
    return { pipSize: 0.010, lotMultiplier: 5000, pipValuePerLot: 50 };
  }
  if (asset.includes("XPT") || asset.includes("PLATINUM") || asset.includes("XPD") || asset.includes("PALLADIUM")) {
    return { pipSize: 0.10, lotMultiplier: 50, pipValuePerLot: 5 };
  }

  if (asset.includes("WTI") || asset.includes("USOIL") || asset.includes("CRUDEOI") ||
      asset.includes("NGAS") || asset === "CL") {
    return { pipSize: 0.01, lotMultiplier: 1000, pipValuePerLot: 10 };
  }
  if (asset.includes("BRENT") || asset.includes("UKOIL") || asset === "EB") {
    return { pipSize: 0.01, lotMultiplier: 1000, pipValuePerLot: 10 };
  }

  if (asset.includes("US30") || asset.includes("DOW") || asset.includes("DJI") ||
      asset.includes("WALLT") || asset.includes("USA30")) {
    return { pipSize: 1.00, lotMultiplier: 10, pipValuePerLot: 10 };
  }
  if (asset.includes("NAS100") || asset.includes("NAS") || asset.includes("NDX") ||
      asset.includes("USTEC") || asset.includes("US100")) {
    return { pipSize: 0.10, lotMultiplier: 20, pipValuePerLot: 20 };
  }
  if (asset.includes("SPX500") || asset.includes("SPX") || asset.includes("SP500") ||
      asset.includes("US500") || asset.includes("SPXUSD")) {
    return { pipSize: 0.10, lotMultiplier: 50, pipValuePerLot: 50 };
  }
  if (asset.includes("GER") || asset.includes("DAX") || asset.includes("DE30") ||
      asset.includes("DE40") || asset.includes("GER30") || asset.includes("GER40")) {
    return { pipSize: 1.00, lotMultiplier: 25, pipValuePerLot: 25 };
  }
  if (asset.includes("UK100") || asset.includes("FTSE") || asset.includes("UKX")) {
    return { pipSize: 1.00, lotMultiplier: 10, pipValuePerLot: 10 };
  }
  if (asset.includes("FRA40") || asset.includes("CAC") || asset.includes("FR40")) {
    return { pipSize: 1.00, lotMultiplier: 10, pipValuePerLot: 10 };
  }
  if (asset.includes("JP225") || asset.includes("JPN225") || asset.includes("NIKKEI")) {
    return { pipSize: 1.00, lotMultiplier: 10, pipValuePerLot: 1.25 };
  }
  if (asset.includes("AUS200") || asset.includes("ASX200") || asset.includes("AU200")) {
    return { pipSize: 1.00, lotMultiplier: 10, pipValuePerLot: 10 };
  }
  if (asset.includes("HK50") || asset.includes("HSI") || asset.includes("HANGSENG")) {
    return { pipSize: 1.00, lotMultiplier: 50, pipValuePerLot: 1 };
  }
  if (asset.includes("EU50") || asset.includes("STOXX") || asset.includes("EUSTX50")) {
    return { pipSize: 1.00, lotMultiplier: 10, pipValuePerLot: 10 };
  }

  return { pipSize: 0.0001, lotMultiplier: 100000, pipValuePerLot: 10 };
}

export function calculatePips(asset: string, price1: number, price2: number): number {
  const specs = getAssetSpecs(asset);
  return (price1 - price2) / specs.pipSize;
}

export interface TradeParameters {
  asset: string;
  isBuy: boolean;
  entry: number;
  exit: number;
  lots: number;
}

export function calculatePnL(params: TradeParameters): { pips: number; pnl: number } {
  const { asset, isBuy, entry, exit, lots } = params;
  const specs = getAssetSpecs(asset);
  const pips = isBuy ? (exit - entry) / specs.pipSize : (entry - exit) / specs.pipSize;
  const pnl = pips * lots * specs.pipValuePerLot;
  return { pips, pnl };
}

export function calculatePipDifference(symbol: string, entry: number, exit: number): number {
  const specs = getAssetSpecs(symbol);
  return Math.abs(entry - exit) / specs.pipSize;
}

export function computeMarginRequiredUSD(
  asset: string,
  lots: number,
  entryPrice: number,
  leverage: number
): number {
  const specs = getAssetSpecs(asset);
  const lev = Math.max(1, leverage || 100);
  
  let notional = lots * specs.lotMultiplier * entryPrice;
  const upperAsset = asset.toUpperCase().trim();
  if (upperAsset.startsWith("USD") && (upperAsset.endsWith("JPY") || upperAsset.endsWith("CAD") || upperAsset.endsWith("CHF") || upperAsset.endsWith("SEK") || upperAsset.endsWith("NOK") || upperAsset.endsWith("SGD") || upperAsset.endsWith("MXN"))) {
    notional = lots * specs.lotMultiplier;
  } else if (upperAsset.includes("JPY")) {
    notional = (lots * specs.lotMultiplier * entryPrice) / 150.0;
  }
  return notional / lev;
}

export function mapSymbolForProvider(asset: string, provider: "twelvedata" | "polygon" | "oanda" | "yahoo"): string {
  const clean = asset.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (provider === "yahoo") {
    if (clean === "XAUUSD" || clean === "GOLD" || clean === "XAU") return "GC=F";
    if (clean === "XAGUSD" || clean === "SILVER" || clean === "XAG") return "SI=F";
    if (clean === "BTCUSD" || clean === "BTC") return "BTC-USD";
    if (clean === "ETHUSD" || clean === "ETH") return "ETH-USD";
    if (clean === "SOLUSD" || clean === "SOL") return "SOL-USD";
    if (clean === "US30" || clean === "DOW") return "^DJI";
    if (clean === "NAS100" || clean === "NAS" || clean === "USTEC") return "^NDX";
    if (clean === "SPX500" || clean === "SPX") return "^GSPC";
    if (clean.length === 6) return `${clean}=X`;
    return clean;
  }
  if (provider === "twelvedata") {
    if (clean === "XAUUSD" || clean === "GOLD" || clean === "XAU") return "XAU/USD";
    if (clean === "BTCUSD" || clean === "BTC") return "BTC/USD";
    if (clean === "ETHUSD" || clean === "ETH") return "ETH/USD";
    if (clean === "SOLUSD" || clean === "SOL") return "SOL/USD";
    if (clean === "EURUSD") return "EUR/USD";
    if (clean === "GBPUSD") return "GBP/USD";
    if (clean === "USDJPY") return "USD/JPY";
    if (clean === "AUDUSD") return "AUD/USD";
    if (clean === "USDCAD") return "USD/CAD";
    if (clean === "US30" || clean === "DOW") return "DJI";
    if (clean === "NAS100" || clean === "NAS" || clean === "USTEC") return "IXIC";
    if (clean === "SPX500" || clean === "SPX") return "SPX";
    if (clean.length === 6) return `${clean.slice(0,3)}/${clean.slice(3)}`;
    return clean;
  }
  if (provider === "polygon") {
    if (clean === "XAUUSD" || clean === "GOLD" || clean === "XAU") return "C:XAUUSD";
    if (clean === "BTCUSD" || clean === "BTC") return "X:BTCUSD";
    if (clean === "ETHUSD" || clean === "ETH") return "X:ETHUSD";
    if (clean === "SOLUSD" || clean === "SOL") return "X:SOLUSD";
    if (clean === "EURUSD") return "C:EURUSD";
    if (clean === "GBPUSD") return "C:GBPUSD";
    if (clean === "USDJPY") return "C:USDJPY";
    if (clean === "AUDUSD") return "C:AUDUSD";
    if (clean === "USDCAD") return "C:USDCAD";
    if (clean === "US30" || clean === "DOW") return "DIA";
    if (clean === "NAS100" || clean === "NAS" || clean === "USTEC") return "QQQ";
    if (clean === "SPX500" || clean === "SPX") return "SPY";
    if (clean.length === 6) return `C:${clean}`;
    return clean;
  }
  if (provider === "oanda") {
    if (clean === "XAUUSD" || clean === "GOLD" || clean === "XAU") return "XAU_USD";
    if (clean === "BTCUSD" || clean === "BTC") return "BTC_USD";
    if (clean === "ETHUSD" || clean === "ETH") return "ETH_USD";
    if (clean === "SOLUSD" || clean === "SOL") return "SOL_USD";
    if (clean === "EURUSD") return "EUR_USD";
    if (clean === "GBPUSD") return "GBP_USD";
    if (clean === "USDJPY") return "USD_JPY";
    if (clean === "AUDUSD") return "AUD_USD";
    if (clean === "USDCAD") return "USD_CAD";
    if (clean === "US30" || clean === "DOW") return "US30_USD";
    if (clean === "NAS100" || clean === "NAS" || clean === "USTEC") return "NAS100_USD";
    if (clean === "SPX500" || clean === "SPX") return "SPX500_USD";
    if (clean.length === 6) return `${clean.slice(0,3)}_${clean.slice(3)}`;
  }
  return clean;
}
