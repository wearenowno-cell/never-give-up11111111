const fs = require('fs');
let code = fs.readFileSync('src/services/parser/regex.ts', 'utf8');

const targetStr = `export const parseSignalsLocally = (textToParse: string, msgsToParse?: any[]): any[] => {
  const individualMessages = msgsToParse && msgsToParse.length > 0 
    ? msgsToParse.map(m => m.text)
    : (textToParse || "").split("\\n\\n");
  
  const extractedSignals: any[] = [];
  
  individualMessages.forEach((rawMsgText, idx) => {
    if (!rawMsgText) return;
    
    // Absolute Time Extraction (Ignore manual text date strings)
    let datetimeStr = "";
    let msgId: string | number = "unknown";
    
    if (msgsToParse && msgsToParse[idx]) {
      const rawMsg = msgsToParse[idx];
      msgId = rawMsg.id || "unknown";
      const rawDate = rawMsg.date || rawMsg.original_utc_timestamp || rawMsg.provided_timestamp;
      if (rawDate !== undefined && rawDate !== null) {
        if (typeof rawDate === "number") {
          const ms = rawDate < 10000000000 ? rawDate * 1000 : rawDate;
          datetimeStr = new Date(ms).toISOString();
        } else if (typeof rawDate === "string") {
          const parsedMs = Date.parse(rawDate);
          if (!isNaN(parsedMs)) {
            datetimeStr = new Date(parsedMs).toISOString();
          } else if (!isNaN(Number(rawDate))) {
            const ms = Number(rawDate) < 10000000000 ? Number(rawDate) * 1000 : Number(rawDate);
            datetimeStr = new Date(ms).toISOString();
          } else {
            datetimeStr = rawDate;
          }
        } else {
          datetimeStr = String(rawDate);
        }
      } else {
        datetimeStr = new Date().toISOString();
      }
    } else {
      // Fallback
      datetimeStr = new Date().toISOString();
    }`;

const newStr = `export const parseSignalsLocally = (textToParse: string, msgsToParse?: any[]): any[] => {
  let individualMessages: string[] = [];
  let msgIds: (string | number)[] = [];
  let msgDates: any[] = [];
  
  if (msgsToParse && msgsToParse.length > 0) {
    let currentGroupText = "";
    let currentGroupId: string | number = "unknown";
    let currentGroupDate: any = null;
    
    for (let i = 0; i < msgsToParse.length; i++) {
      const msg = msgsToParse[i];
      const textUpper = (msg.text || "").toUpperCase();
      
      const hasAsset = /(XAUUSD|GOLD|XAU|BTCUSD|BTC|ETHUSD|ETH|SOLUSD|SOL|EURUSD|GBPUSD|USDJPY|AUDUSD|USDCAD|US30|NAS100|SPX500|EURJPY|AUDJPY)/i.test(textUpper) || /(?:^|\\W)([A-Z]{3}[A-Z]{3})(?:\\W|$)/.test(textUpper);
      const hasAction = /(BUY|SELL|LONG|SHORT|BEARISH|BULLISH)/i.test(textUpper);
      
      if (hasAsset && hasAction) {
        if (currentGroupText) {
          individualMessages.push(currentGroupText);
          msgIds.push(currentGroupId);
          msgDates.push(currentGroupDate);
        }
        currentGroupText = msg.text;
        currentGroupId = msg.id || "unknown";
        currentGroupDate = msg.date || msg.original_utc_timestamp || msg.provided_timestamp;
      } else if (currentGroupText) {
        // This looks like a continuation (e.g. SL or TP updates)
        currentGroupText += "\\n" + msg.text;
      } else {
        // No current group, just treat as standalone
        individualMessages.push(msg.text);
        msgIds.push(msg.id || "unknown");
        msgDates.push(msg.date || msg.original_utc_timestamp || msg.provided_timestamp);
      }
    }
    if (currentGroupText) {
      individualMessages.push(currentGroupText);
      msgIds.push(currentGroupId);
      msgDates.push(currentGroupDate);
    }
  } else {
    individualMessages = (textToParse || "").split("\\n\\n");
    msgIds = individualMessages.map(() => "unknown");
    msgDates = individualMessages.map(() => Date.now());
  }

  const extractedSignals: any[] = [];
  
  individualMessages.forEach((rawMsgText, idx) => {
    if (!rawMsgText) return;
    
    // Absolute Time Extraction (Ignore manual text date strings)
    let datetimeStr = "";
    let msgId = msgIds[idx];
    const rawDate = msgDates[idx];
    
    if (rawDate !== undefined && rawDate !== null) {
      if (typeof rawDate === "number") {
        const ms = rawDate < 10000000000 ? rawDate * 1000 : rawDate;
        datetimeStr = new Date(ms).toISOString();
      } else if (typeof rawDate === "string") {
        const parsedMs = Date.parse(rawDate);
        if (!isNaN(parsedMs)) {
          datetimeStr = new Date(parsedMs).toISOString();
        } else if (!isNaN(Number(rawDate))) {
          const ms = Number(rawDate) < 10000000000 ? Number(rawDate) * 1000 : Number(rawDate);
          datetimeStr = new Date(ms).toISOString();
        } else {
          datetimeStr = rawDate;
        }
      } else {
        datetimeStr = String(rawDate);
      }
    } else {
      datetimeStr = new Date().toISOString();
    }`;

const regexTarget = targetStr.replace(/\s+/g, '\\s*').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const globalRegex = new RegExp(regexTarget);
if (globalRegex.test(code)) {
    code = code.replace(globalRegex, newStr);
    fs.writeFileSync('src/services/parser/regex.ts', code);
    console.log("Success");
} else {
    console.log("Not found");
}
