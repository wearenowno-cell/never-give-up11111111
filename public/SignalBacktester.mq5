//+------------------------------------------------------------------+
//|                               SignalReplayEngine.mq5             |
//|          Multi-TP Scale-Out Edition v2.0 — Institutional EA      |
//|                                                                  |
//|  CSV format (Enhancement 2):                                     |
//|  Timestamp,Symbol,Type,Price,SL,TP1,Lots1,TP2,Lots2,TP3,Lots3   |
//|                                                                  |
//|  Each CSV row spawns up to 3 independent MT5 market orders,      |
//|  one per TP level with its own lot size. Orders are identified   |
//|  by unique magic numbers (MagicBase + signalIdx*10 + tpSlot).   |
//+------------------------------------------------------------------+
#property copyright "Copyright 2026"
#property version   "2.00"
#property strict

#include <Trade\Trade.mqh>
CTrade trade;

//--- Signal struct: one row from the multi-TP CSV
struct TradingSignal {
   datetime timestamp;
   string   symbol;
   int      orderType;   // 0=Buy, 1=Sell
   double   price;       // informational entry price; EA executes at market
   double   sl;
   double   tp1;  double lots1;  // TP1 level and lot size for that slice
   double   tp2;  double lots2;  // 0 lots = skip this TP slot
   double   tp3;  double lots3;
   bool     executed;
};

TradingSignal signals[];
int signalCount = 0;

//--- Inputs
input string InputFileName  = "mt5_signals_export.csv";
input double DefaultLotSize = 0.10;   // fallback if CSV lots column is 0 or blank
input int    MagicBase      = 88000;  // unique magic = MagicBase + signalIdx*10 + tpSlot (1/2/3)
input int    SlippagePoints = 30;     // max allowed slippage in points
input bool   VerboseLog     = true;   // print trade details to Experts log

//+------------------------------------------------------------------+
//| Strip everything except A-Z / 0-9 and uppercase.                |
//| Handles broker suffixes: XAUUSDm, XAUUSD.a, #XAUUSD, XAUUSDm   |
//+------------------------------------------------------------------+
string NormalizeSymbol(string s) {
   string out = "";
   StringToUpper(s);
   int len = StringLen(s);
   for(int i = 0; i < len; i++) {
      ushort ch = StringGetCharacter(s, i);
      if((ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9'))
         out += ShortToString(ch);
   }
   return out;
}

//+------------------------------------------------------------------+
//| True when a CSV symbol and the chart symbol refer to the same    |
//| instrument, tolerating broker-specific suffixes/prefixes.        |
//+------------------------------------------------------------------+
bool SymbolsMatch(string csvSym, string chartSym) {
   string a = NormalizeSymbol(csvSym);
   string b = NormalizeSymbol(chartSym);
   if(StringLen(a) == 0 || StringLen(b) == 0) return false;
   if(a == b) return true;
   // Tolerate prefix/suffix mismatch on ≥5-char core (XAUUSDm vs XAUUSD)
   int shorter = MathMin(StringLen(a), StringLen(b));
   if(shorter < 5) return false;
   return (StringFind(a, b) == 0) || (StringFind(b, a) == 0);
}

//+------------------------------------------------------------------+
//| Safely read one CSV field, return "" on line-end / file-end     |
//+------------------------------------------------------------------+
string ReadField(int fh) {
   if(FileIsLineEnding(fh) || FileIsEnding(fh)) return "";
   return FileReadString(fh);
}

//+------------------------------------------------------------------+
//| EA initialization: load and parse the multi-TP CSV               |
//+------------------------------------------------------------------+
int OnInit() {
   ArrayFree(signals);
   signalCount = 0;

   // Try Common\Files first (live/demo); fall back to local MQL5\Files
   // (Strategy Tester sandbox often cannot reach Common\Files)
   int fh = FileOpen(InputFileName, FILE_READ | FILE_CSV | FILE_COMMON, ',');
   if(fh == INVALID_HANDLE) {
      Print("[SignalReplayEngine] Common\\Files failed (err ", GetLastError(),
            "). Retrying from local MQL5\\Files...");
      fh = FileOpen(InputFileName, FILE_READ | FILE_CSV, ',');
   }
   if(fh == INVALID_HANDLE) {
      Print("[SignalReplayEngine] ERROR: Cannot open '", InputFileName,
            "'. Error code: ", GetLastError());
      return INIT_FAILED;
   }

   // --- Skip header row --------------------------------------------------
   // Header: Timestamp,Symbol,Type,Price,SL,TP1,Lots1,TP2,Lots2,TP3,Lots3
   if(!FileIsEnding(fh)) {
      for(int h = 0; h < 11; h++) { ReadField(fh); }
      if(FileIsLineEnding(fh)) FileReadString(fh); // consume newline
   }

   // --- Parse data rows --------------------------------------------------
   while(!FileIsEnding(fh)) {
      string f0  = ReadField(fh); if(f0 == "") { if(!FileIsEnding(fh)) FileReadString(fh); continue; }
      string f1  = ReadField(fh);
      string f2  = ReadField(fh);
      string f3  = ReadField(fh);
      string f4  = ReadField(fh);
      string f5  = ReadField(fh);
      string f6  = ReadField(fh);
      string f7  = ReadField(fh);
      string f8  = ReadField(fh);
      string f9  = ReadField(fh);
      string f10 = ReadField(fh);
      // Consume trailing newline
      if(FileIsLineEnding(fh)) FileReadString(fh);

      ArrayResize(signals, signalCount + 1);
      TradingSignal &sig = signals[signalCount];

      sig.timestamp  = StringToTime(f0);
      sig.symbol     = f1;
      sig.orderType  = (int)StringToInteger(f2);
      sig.price      = StringToDouble(f3);
      sig.sl         = StringToDouble(f4);
      sig.tp1        = StringToDouble(f5);
      sig.lots1      = StringToDouble(f6);
      sig.tp2        = StringToDouble(f7);
      sig.lots2      = StringToDouble(f8);
      sig.tp3        = StringToDouble(f9);
      sig.lots3      = StringToDouble(f10);
      sig.executed   = false;

      // Apply default lot size to TP1 if missing; zero lots = skip slot
      if(sig.lots1 <= 0) sig.lots1 = DefaultLotSize;
      if(sig.lots2 <  0) sig.lots2 = 0;
      if(sig.lots3 <  0) sig.lots3 = 0;

      signalCount++;
   }

   FileClose(fh);
   Print("[SignalReplayEngine] Loaded ", signalCount, " signal(s) from '", InputFileName, "'.");
   Print("[SignalReplayEngine] Multi-TP scale-out mode active — up to 3 independent orders per signal.");
   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
//| Main tick handler — scan for pending signals                     |
//+------------------------------------------------------------------+
void OnTick() {
   datetime now = TimeCurrent();
   string   chartSym = Symbol();

   for(int i = 0; i < signalCount; i++) {
      TradingSignal &sig = signals[i];
      if(sig.executed) continue;

      // Skip signals for other symbols or future signals
      if(!SymbolsMatch(sig.symbol, chartSym)) continue;
      if(sig.timestamp > now) continue;

      // --- Place up to 3 independent scale-out orders ---
      bool anyPlaced = false;

      // TP1 slice (always present if lots1 > 0)
      if(sig.lots1 > 0 && sig.tp1 > 0) {
         if(PlaceScaleOrder(sig, sig.lots1, sig.tp1, MagicBase + i * 10 + 1))
            anyPlaced = true;
      }
      // TP2 slice (optional)
      if(sig.lots2 > 0 && sig.tp2 > 0) {
         if(PlaceScaleOrder(sig, sig.lots2, sig.tp2, MagicBase + i * 10 + 2))
            anyPlaced = true;
      }
      // TP3 slice (optional)
      if(sig.lots3 > 0 && sig.tp3 > 0) {
         if(PlaceScaleOrder(sig, sig.lots3, sig.tp3, MagicBase + i * 10 + 3))
            anyPlaced = true;
      }

      if(anyPlaced) {
         sig.executed = true;
         if(VerboseLog)
            Print("[SignalReplayEngine] Signal #", i, " (", sig.symbol, " ",
                  sig.orderType == 0 ? "BUY" : "SELL", ") executed — orders placed.");
      }
   }
}

//+------------------------------------------------------------------+
//| Place one market order for a single TP slice                     |
//+------------------------------------------------------------------+
bool PlaceScaleOrder(TradingSignal &sig, double lots, double tp, int magic) {
   trade.SetExpertMagicNumber(magic);
   trade.SetDeviationInPoints(SlippagePoints);

   string sym = Symbol();
   double ask = SymbolInfoDouble(sym, SYMBOL_ASK);
   double bid = SymbolInfoDouble(sym, SYMBOL_BID);

   // Normalize lot size to broker's volume step
   double volMin  = SymbolInfoDouble(sym, SYMBOL_VOLUME_MIN);
   double volStep = SymbolInfoDouble(sym, SYMBOL_VOLUME_STEP);
   double volMax  = SymbolInfoDouble(sym, SYMBOL_VOLUME_MAX);
   lots = MathMax(volMin, MathMin(volMax, MathRound(lots / volStep) * volStep));

   bool ok = false;
   if(sig.orderType == 0) {          // BUY
      ok = trade.Buy(lots, sym, ask, sig.sl, tp,
                     StringFormat("Signal@%.5f TP%d", sig.price,
                                  magic - (MagicBase + (magic - MagicBase) / 10 * 10 - MagicBase)));
   } else {                           // SELL
      ok = trade.Sell(lots, sym, bid, sig.sl, tp,
                      StringFormat("Signal@%.5f TP%d", sig.price,
                                   magic - (MagicBase + (magic - MagicBase) / 10 * 10 - MagicBase)));
   }

   if(VerboseLog) {
      if(ok) {
         Print("[ScaleOrder] Placed ", sig.orderType==0?"BUY":"SELL",
               " ", DoubleToString(lots,2), " lots | TP=", DoubleToString(tp,5),
               " SL=", DoubleToString(sig.sl,5),
               " | Magic=", magic, " | Ticket=", trade.ResultOrder());
      } else {
         Print("[ScaleOrder] FAILED magic=", magic,
               " retcode=", trade.ResultRetcode(),
               " (", trade.ResultRetcodeDescription(), ")");
      }
   }
   return ok;
}

//+------------------------------------------------------------------+
void OnDeinit(const int reason) {
   int pending = 0;
   for(int i = 0; i < signalCount; i++)
      if(!signals[i].executed) pending++;
   if(pending > 0)
      Print("[SignalReplayEngine] Deinitialized — ", pending, " signal(s) were not executed.");
}
