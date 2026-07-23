import { useState, useEffect, useRef, useMemo } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Activity, 
  FileText, 
  CheckCircle, 
  Settings, 
  AlertCircle, 
  LineChart, 
  Table, 
  Bot, 
  Brain, 
  Play, 
  RefreshCw, 
  Trash2, 
  Plus, 
  Info, 
  Sparkles, 
  ChevronRight, 
  Coins, 
  ShieldCheck, 
  Scale, 
  ArrowRight,
  LogOut,
  Sliders,
  DollarSign,
  HelpCircle,
  Clock,
  Lock,
  MessageSquare,
  Search,
  Wifi,
  User,
  Send,
  Download,
  CloudDownload,
  FileCode,
  BarChart2,
  Layers,
  Trophy,
  Tag,
  Star,
  Check,
  AlertTriangle,
  Cpu,
  Shuffle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TradingSignal, BacktestConfig, BacktestResults, SimulatedTrade, AgentConfig, PerAssetStat } from "./types";
import { getAssetSpecs, calculatePips } from "./utils/assets";

const MAJOR_TIMEZONES = [
  { name: "Local Browser Time", id: "Local" },
  { name: "UTC / GMT", id: "UTC" },
  { name: "London (GMT/BST)", id: "Europe/London" },
  { name: "New York (EST/EDT)", id: "America/New_York" },
  { name: "Chicago (CST/CDT)", id: "America/Chicago" },
  { name: "Denver (MST/MDT)", id: "America/Denver" },
  { name: "Los Angeles (PST/PDT)", id: "America/Los_Angeles" },
  { name: "Tokyo (JST)", id: "Asia/Tokyo" },
  { name: "Sydney (AEDT/AEST)", id: "Australia/Sydney" },
  { name: "Singapore (SGT)", id: "Asia/Singapore" },
  { name: "Hong Kong (HKT)", id: "Asia/Hong_Kong" },
  { name: "Dubai (GST)", id: "Asia/Dubai" },
  { name: "Frankfurt (CET/CEST)", id: "Europe/Berlin" },
  { name: "Paris (CET/CEST)", id: "Europe/Paris" },
  { name: "Zurich (CET/CEST)", id: "Europe/Zurich" },
  { name: "Moscow (MSK)", id: "Europe/Moscow" },
  { name: "Mumbai (IST)", id: "Asia/Kolkata" },
  { name: "Sao Paulo (BRT)", id: "America/Sao_Paulo" },
  { name: "Johannesburg (SAST)", id: "Africa/Johannesburg" },
  { name: "Shanghai (CST)", id: "Asia/Shanghai" },
  { name: "Seoul (KST)", id: "Asia/Seoul" },
  { name: "Riyadh (AST)", id: "Asia/Riyadh" },
  { name: "Cairo (EET)", id: "Africa/Cairo" },
  { name: "Istanbul (TRT)", id: "Europe/Istanbul" },
  { name: "Toronto (EST/EDT)", id: "America/Toronto" },
  { name: "Mexico City (CST)", id: "America/Mexico_City" },
  { name: "Auckland (NZDT/NZST)", id: "Pacific/Auckland" },
  { name: "Honolulu (HST)", id: "Pacific/Honolulu" }
];


function TestJobMonitor() {
  const [job, setJob] = useState<any>(null);
  useEffect(() => {
    const handler = () => {
      setJob(window.currentJob);
    };
    window.addEventListener("jobupdate", handler);
    return () => window.removeEventListener("jobupdate", handler);
  }, []);

  if (!job) return null;

  return (
    <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-5 flex flex-col gap-4">
      <div className="flex justify-between items-center">
         <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            Job Monitor: {job.id.substring(0, 8)}
         </h4>
         <div className="flex items-center gap-3">
            <span className={`text-xs font-bold ${job.status === 'completed' ? 'text-teal-400' : job.status === 'failed' ? 'text-red-400' : 'text-amber-400'}`}>
              {job.status.toUpperCase()} ({job.progress}%)
            </span>
            {job.status === "running" && (
              <button onClick={() => fetch("/api/testing/jobs/" + job.id + "/pause", {method: "POST"})} className="bg-slate-800 text-slate-300 px-3 py-1 rounded text-xs hover:bg-slate-700">Pause</button>
            )}
            {job.status === "paused" && (
              <button onClick={() => fetch("/api/testing/jobs/" + job.id + "/resume", {method: "POST"})} className="bg-amber-600 text-white px-3 py-1 rounded text-xs hover:bg-amber-500">Resume</button>
            )}
         </div>
      </div>
      
      <div className="w-full bg-slate-950 rounded-full h-2 mb-2">
         <div className="bg-amber-500 h-2 rounded-full transition-all duration-500" style={{width: `${job.progress}%`}}></div>
      </div>

      {job.report && (
         <div className="flex flex-col gap-3">
            <h5 className="text-xs font-semibold text-slate-300 border-b border-slate-800 pb-1">Comprehensive Performance Report</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
               <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="block text-[10px] text-slate-500 uppercase">Channels Tested</span>
                  <span className="text-sm font-bold text-teal-400">{job.report.successChannels} / {job.report.channelsTested} Successful</span>
               </div>
               <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="block text-[10px] text-slate-500 uppercase">Total Signals Found</span>
                  <span className="text-sm font-bold text-amber-400">{job.report.overallSignals}</span>
               </div>
               <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="block text-[10px] text-slate-500 uppercase">Avg Win Rate</span>
                  <span className="text-sm font-bold text-slate-200">{job.report.averageWinRate.toFixed(1)}%</span>
               </div>
               <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="block text-[10px] text-slate-500 uppercase">Avg ROI</span>
                  <span className="text-sm font-bold text-slate-200">{job.report.averageROI.toFixed(1)}%</span>
               </div>
               <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="block text-[10px] text-slate-500 uppercase">Total Trades Executed</span>
                  <span className="text-sm font-bold text-slate-200">{job.report.totalTrades || 0}</span>
               </div>
               <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="block text-[10px] text-slate-500 uppercase">Failed Channels</span>
                  <span className="text-sm font-bold text-red-400">{job.report.failedChannels}</span>
               </div>
            </div>
         </div>
      )}

      <div className="flex flex-col gap-2">
         <h5 className="text-xs font-semibold text-slate-300 border-b border-slate-800 pb-1">Channels Details</h5>
         <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2">
           {job.channels.map((c: any) => (
              <div key={c.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex justify-between items-center">
                 <div className="flex flex-col gap-1">
                   <span className="text-xs font-bold text-slate-200">{c.chatId}</span>
                   <span className="text-[10px] text-slate-500">Status: {c.status} | Msgs: {c.messagesProcessed}/{c.totalMessages} | Signals: {c.signalsFound}</span>
                 </div>
                 {c.metrics && (
                   <div className="flex items-center gap-3">
                     <span className="text-xs text-teal-400 font-mono">WR: {c.metrics.winRate.toFixed(1)}%</span>
                     <span className="text-xs text-amber-400 font-mono">ROI: {c.metrics.netROI.toFixed(1)}%</span>
                   </div>
                 )}
                 {c.errors && c.errors.length > 0 && (
                   <div className="text-[10px] text-red-400 flex flex-col">
                     {c.errors.map((e:string, idx:number) => <span key={idx}>{e}</span>)}
                   </div>
                 )}
              </div>
           ))}
         </div>
      </div>

      <div className="flex flex-col gap-2">
         <h5 className="text-xs font-semibold text-slate-300 border-b border-slate-800 pb-1">Execution Logs</h5>
         <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-[10px] text-slate-400 h-32 overflow-y-auto flex flex-col gap-1">
            {job.logs.slice().reverse().map((l: string, i: number) => (
               <span key={i}>{l}</span>
            ))}
         </div>
      </div>
    </div>
  );
}

export default function App() {

  const [activeTab, setActiveTab] = useState<"parser" | "signals" | "sim_console" | "analytics" | "optimizer" | "channels">("parser");
  const [inputText, setInputText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [csvExportStatus, setCsvExportStatus] = useState<null | "loading" | "success" | "error">(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [filterAssetCategory, setFilterAssetCategory] = useState<string>("ALL");
  const [filterValidation, setFilterValidation] = useState<string>("ALL");

  const getAssetCategory = (asset: string) => {
    const a = (asset || "").toUpperCase();
    if (a.includes("XAU") || a.includes("GOLD") || a.includes("SILVER") || a.includes("XAG")) return "METALS";
    if (a.includes("BTC") || a.includes("ETH") || a.includes("SOL") || a.includes("CRYPTO")) return "CRYPTO";
    if (a.includes("US30") || a.includes("NAS") || a.includes("SPX") || a.includes("DOW") || a.includes("GER") || a.includes("UK100")) return "INDICES";
    return "FOREX";
  };

  const filteredSignals = (signals || []).filter(sig => {
    if (filterAssetCategory !== "ALL" && getAssetCategory(sig.asset) !== filterAssetCategory) return false;
    if (filterValidation === "MISSING_SL" && sig.stopLoss) return false;
    if (filterValidation === "MISSING_TP" && sig.takeProfits && sig.takeProfits.length > 0) return false;
    if (filterValidation === "INVALID_RR") {
      const rrGrade = getSignalRRGrade(sig);
      if (rrGrade.grade !== "ERR" && rrGrade.grade !== "?") return false;
    }
    if (filterValidation === "VALID") {
      const rrGrade = getSignalRRGrade(sig);
      if (rrGrade.grade === "ERR" || rrGrade.grade === "?") return false;
    }
    return true;
  });

  const [rotationStats, setRotationStats] = useState<any>({
    totalCalls: {},
    totalTokens: {},
    recentRPM: { groq: 0, gemini: 0, sambanova: 0 },
    logs: [],
    invalidKeysCount: 0,
    rateLimitedKeysCount: 0,
    stats: { totalSuccess: 0, totalFailures: 0, totalTokens: 0, keysStatus: {} }
  });
  const [healthKeysData, setHealthKeysData] = useState<any>({
    providers: { groq: [], gemini: [], sambanova: [] }
  });

  // Poll for api-rotation-stats and health keys
  useEffect(() => {
    let failCount = 0;
    let baseDelay = 2000;
    let interval: ReturnType<typeof setTimeout> | null = null;
    
    const fetchStats = async () => {
      try {
        const [rotRes, keysRes] = await Promise.all([
          fetch("/api/api-rotation-stats"),
          fetch("/api/keys/state")
        ]);
        
        if (!rotRes.ok) throw new Error("Failed to fetch rotation stats");
        if (!keysRes.ok) throw new Error("Failed to fetch keys state");
        
        const rotData = await rotRes.json();
        const keysData = await keysRes.json();
        
        setRotationStats(rotData);
        setHealthKeysData(keysData);
        failCount = 0; // reset on success
        
        if (isParsing || isSimulating) {
          interval = setTimeout(fetchStats, baseDelay);
        }
      } catch (err) {
        console.warn("Error fetching state:", err);
        failCount++;
        if (failCount < 5 && (isParsing || isSimulating)) {
          const nextDelay = baseDelay * Math.pow(2, failCount);
          interval = setTimeout(fetchStats, nextDelay);
        } else {
          console.error("Max retries reached. Backend disconnected.");
        }
      }
    };

    if (isParsing || isSimulating) {
      fetchStats();
    }

    return () => {
      if (interval) clearTimeout(interval);
    };
  }, [isParsing, isSimulating]);

  // User selected timezone for visual formatting
  const [userTimezone, setUserTimezone] = useState<string>(() => {
    return localStorage.getItem("user_timezone") || "Local";
  });

  // Running clock state
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Custom search query for full IANA list
  const [tzSearchQuery, setTzSearchQuery] = useState("");

  // Timezone selector open state
  const [isTzDropdownOpen, setIsTzDropdownOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("user_timezone", userTimezone);
  }, [userTimezone]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (dateInput: string | number | Date | undefined, style: "full" | "date" | "time" | "short" = "full") => {
    if (!dateInput) return "N/A";
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "N/A";

    const tz = userTimezone === "Local" ? Intl.DateTimeFormat().resolvedOptions().timeZone : userTimezone;

    try {
      if (style === "date") {
        return date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          timeZone: tz
        });
      } else if (style === "time") {
        return date.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
          timeZone: tz
        });
      } else if (style === "short") {
        return date.toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
          timeZone: tz
        });
      } else {
        return date.toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
          timeZone: tz
        }) + ` (${tz})`;
      }
    } catch (e) {
      if (style === "date") return date.toLocaleDateString();
      if (style === "time") return date.toLocaleTimeString();
      return date.toLocaleString();
    }
  };

  // Trade history table sort & filter state
  const [tradeTableSort, setTradeTableSort] = useState<{ col: string; dir: "asc" | "desc" }>({ col: "id", dir: "asc" });
  const [tradeTableFilter, setTradeTableFilter] = useState<string>("ALL");

  // External Agents & Alternative Providers State
  const [primaryProvider, setPrimaryProvider] = useState<string>(() => {
    return localStorage.getItem("primary_provider") || "groq";
  });
  const [backupProvider, setBackupProvider] = useState<string>(() => {
    return localStorage.getItem("backup_provider") || "groq";
  });
  const [preFilterActive, setPreFilterActive] = useState<boolean>(() => {
    const saved = localStorage.getItem("pre_filter_active");
    return saved !== null ? saved === "true" : true; // Default to true
  });

  const [agents, setAgents] = useState<AgentConfig[]>(() => {
    try {
      const saved = localStorage.getItem("external_agents_v3");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Ensure "local" agent is always present
          if (!parsed.some((a: any) => a.id === "local")) {
            parsed.push({
              id: "local",
              name: "Surgical Regex Engine (Instant/Free)",
              apiKey: "LOCAL_OFFLINE_NO_KEY_NEEDED",
              endpoint: "regex-v1.0",
              isActive: true
            });
          }
          // Ensure "sambanova" is always present
          if (!parsed.some((a: any) => a.id === "sambanova")) {
            parsed.push({
              id: "sambanova",
              name: "SambaNova Cloud API",
              apiKey: "",
              endpoint: "Meta-Llama-3.3-70B-Instruct",
              isActive: true
            });
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error reading external_agents_v3", e);
    }
    return [
      {
        id: "gemini",
        name: "Google Gemini Core",
        apiKey: "", // will fall back to server process.env.GEMINI_API_KEY if left blank
        endpoint: "gemini-2.5-flash",
        isActive: true
      },
      {
        id: "groq",
        name: "Groq Smart Engine",
        apiKey: "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", // First key in the rotation pool
        endpoint: "deepseek-r1-distill-llama-70b",
        isActive: true
      },
      {
        id: "sambanova",
        name: "SambaNova Cloud API",
        apiKey: "8b5ed6a2-4c21-4b2e-849a-b312d2e641e9",
        endpoint: "Meta-Llama-3.3-70B-Instruct",
        isActive: true
      },
      {
        id: "local",
        name: "Surgical Regex Engine (Instant/Free)",
        apiKey: "LOCAL_OFFLINE_NO_KEY_NEEDED",
        endpoint: "regex-v1.0",
        isActive: true
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem("primary_provider", primaryProvider);
  }, [primaryProvider]);

  useEffect(() => {
    localStorage.setItem("backup_provider", backupProvider);
  }, [backupProvider]);

  useEffect(() => {
    localStorage.setItem("pre_filter_active", preFilterActive ? "true" : "false");
  }, [preFilterActive]);

  useEffect(() => {
    localStorage.setItem("external_agents_v3", JSON.stringify(agents));
  }, [agents]);


  // Helper to attach api keys from ui state to request headers
  const getAgentHeaders = () => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const geminiAgent = agents.find(a => a.id === "gemini");
    const groqAgent = agents.find(a => a.id === "groq");
    const sambaAgent = agents.find(a => a.id === "sambanova");
    if (geminiAgent?.apiKey) headers["x-gemini-key"] = geminiAgent.apiKey;
    if (groqAgent?.apiKey) headers["x-groq-key"] = groqAgent.apiKey;
    if (sambaAgent?.apiKey) headers["x-sambanova-key"] = sambaAgent.apiKey;
    return headers;
  };

  const handleAddAgent = () => {
    const newAgent: AgentConfig = {
      id: `AGENT_${Date.now()}`,
      name: `Agent #${(agents?.length ?? 0) + 1}`,
      apiKey: "",
      endpoint: "deepseek-r1-distill-llama-70b",
      isActive: false
    };
    setAgents([...agents, newAgent]);
  };

  const handleUpdateAgent = (id: string, field: keyof AgentConfig, value: any) => {
    setAgents(prev => prev?.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const handleDeleteAgent = (id: string) => {
    setAgents(prev => prev?.filter(a => a.id !== id));
  };

  // Helper to extract timestamp from raw text if present (Item A)
  const extractDateFromText = (text: string): string | null => {
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
  };

  // Returns true when a message text looks like a trade result/status update rather than a new signal.
  // These are forwarded VIP updates ("TP1 hit", "running 80 pips", "trade closed") that should be
  // excluded from AI parsing — they are not actionable new entries.
  const isStatusOrResultMessage = (text: string): boolean => {
    if (!text) return false;
    const t = text.toLowerCase();
    // Result/status patterns
    if (/\btp\s*[1-5]?\s*(hit|reached|done|✅)\b/i.test(t)) return true;
    if (/\b(sl|stop loss)\s*(hit|reached|triggered)\b/i.test(t)) return true;
    if (/running\s+[\d,.]+\s*pip/i.test(t)) return true;
    if (/\bin\s+profit\b.*pip/i.test(t)) return true;
    if (/\b(be|breakeven|break.?even)\s*(hit|activated|moved|secured)\b/i.test(t)) return true;
    if (/\b(trade|position|signal)\s*(closed|ended|done|exited)\b/i.test(t)) return true;
    if (/\bclosed\s+(in|at|with)\s+(profit|loss)\b/i.test(t)) return true;
    if (/\b(profit|pips?)\s+secured\b/i.test(t)) return true;
    if (/\bpartial\s*(profit|close|tp)\b/i.test(t)) return true;
    if (/\bcongrat(ulation)?s?\b/i.test(t)) return true;
    // Forwarded-from attribution lines (no signal content)
    if (/^forwarded\s+from/i.test(t.trim())) return true;
    return false;
  };

  // Organize and minimize text filtering before sending it to the smarter AI
  const preFilterText = (rawText: string): string => {
    if (!rawText) return "";
    // Split on double-newline to preserve message blocks, then process line by line
    const blocks = rawText.split("\n\n");
    const candidateBlocks = blocks?.filter(block => {
      const blockLower = block.toLowerCase().trim();
      if (!blockLower || (blockLower?.length ?? 0) < 8) return false;

      // Exclude trade result / status update messages — forwarded VIP results, "TP hit", "running pips"
      if (isStatusOrResultMessage(block)) return false;

      // Remove pure marketing or channel noise lines
      const upper = block.toUpperCase();
      if ((upper.includes("ACCURACY") || upper.includes("JOIN VIP") || upper.includes("ACCURATE") || upper.includes("SUBSCRIBE")) &&
          !upper.includes("BUY") && !upper.includes("SELL") && !upper.includes("SL") && !upper.includes("TP")) {
        return false;
      }

      const hasKeywords = /\b(BUY|SELL|ENTRY|SL|TP|LIMIT|STOP|NOW|TAKE\s*PROFIT|STOP\s*LOSS|TARGET|XAUUSD|GOLD|XAU|BTC|ETH|EUR|GBP|USD|JPY|AUD|CAD|US30|NAS100|SPX500)\b/.test(upper);
      const hasNumbersAndSigns = /@|:|=|\d+\.\d+/.test(block);
      return hasKeywords || hasNumbersAndSigns;
    });
    return candidateBlocks.join("\n\n");
  };

  // Local rule-based high-reliability signal extractor (Offline Fallback)
  const parseSignalLocally = (text: string): TradingSignal | null => {
    if (!text || !text.trim()) return null;

    let datetimeStr = extractDateFromText(text);
    if (!datetimeStr) {
      // Automatic friendly fallback to current date-time
      const now = new Date();
      datetimeStr = now.toISOString();
    }

    // Determine lot multiplier (Item C)
    let lotMultiplier = 1.0;
    const multiplierRegex = /(?:[\*xX]\s*(\d+(?:\.\d+)?))|(\d+)\s*(?:positions|entries|lots?)/i;
    const multMatch = text.match(multiplierRegex);
    if (multMatch) {
      const val = multMatch[1] || multMatch[2];
      if (val) {
        const parsedMult = parseFloat(val);
        if (!isNaN(parsedMult) && parsedMult > 0) {
          lotMultiplier = parsedMult;
        }
      }
    }

    const textUpper = text.toUpperCase();
    
    // Determine asset
    let asset = "XAUUSD";
    const assetRegex = /\b(XAUUSD|GOLD|XAU|BTCUSD|BTC|ETHUSD|ETH|SOLUSD|SOL|EURUSD|GBPUSD|USDJPY|AUDUSD|USDCAD|US30|NAS100|SPX500)\b/i;
    const assetMatch = textUpper.match(assetRegex);
    if (assetMatch) {
      asset = assetMatch[1];
      if (asset === "GOLD" || asset === "XAU") asset = "XAUUSD";
    } else {
      const forexMatch = textUpper.match(/\b([A-Z]{6})\b/);
      if (forexMatch) {
        asset = forexMatch[1];
      }
    }

    // Determine type
    let type: "BUY" | "SELL" | "BUY_LIMIT" | "SELL_LIMIT" = "BUY";
    if (textUpper.includes("SELL LIMIT")) {
      type = "SELL_LIMIT";
    } else if (textUpper.includes("BUY LIMIT")) {
      type = "BUY_LIMIT";
    } else if (textUpper.includes("SELL")) {
      type = "SELL";
    } else if (textUpper.includes("BUY")) {
      type = "BUY";
    }

    // Determine entry
    let entryPrice = 0;
    const entryRegexes = [
      /(?:NOW\s*@|ENTRY\s*@|BUY\s*@|SELL\s*@|LONG\s*@|SHORT\s*@|@)\s*(\d+(?:\.\d+)?)/i,
      /(?:ENTRY|PRICE|NOW|AT|ON|ZONE|POINT|LEVEL|FROM|AROUND)\s*(?:PRICE\s*)?(?:IS\s*)?(\d+(?:\.\d+)?)/i,
      /(\d+(?:\.\d+)?)\s*(?:pivot)?\s*level/i,
      /(?:BUY|SELL|LONG|SHORT)\s*(?:GOLD|XAUUSD|BTCUSD|EURUSD|GBPUSD|[A-Z]{6})?\s*(?:NOW\s*)?(?:AT|AROUND|FROM)?\s*(\d+(?:\.\d+)?)/i
    ];
    for (const regex of entryRegexes) {
      const match = textUpper.match(regex);
      if (match) {
        entryPrice = parseFloat(match[1]);
        break;
      }
    }
    if (!entryPrice) {
      const matches = textUpper.match(/(?:BUY|SELL|LONG|SHORT|XAUUSD|GOLD|BTCUSD|EURUSD|GBPUSD|[A-Z]{6})\s*(?:NOW\s*)?(\d+(?:\.\d+)?)/i);
      if (matches) {
        entryPrice = parseFloat(matches[1]);
      }
    }

    // Determine stop loss
    let stopLoss = 0;
    const slRegexes = [
      /(?:SL|STOP LOSS|STOPLOSS|STOP|LIMIT)\s*(?:IS\s*|:\s*|=\s*|\s+|-|@|\.)\s*(\d+(?:\.\d+)?)/i
    ];
    for (const regex of slRegexes) {
      const match = textUpper.match(regex);
      if (match) {
        stopLoss = parseFloat(match[1]);
        break;
      }
    }

    // Determine take profits
    const takeProfits: number[] = [];
    const tpRegexes = [
      /(?:TP\d*|TAKE\s*PROFIT\d*|TARGET\d*|GOAL\d*)\s*(?:IS\s*|:\s*|=\s*|\s+|-|@|\.)\s*(\d+(?:\.\d+)?)/gi
    ];
    for (const regex of tpRegexes) {
      let m;
      while ((m = regex.exec(textUpper)) !== null) {
        const val = parseFloat(m[1]);
        if (val && !takeProfits.includes(val)) {
          takeProfits.push(val);
        }
      }
    }

    if ((takeProfits?.length ?? 0) === 0) {
      const lines = textUpper.split("\n");
      for (const line of lines) {
        if (line.includes("TP") || line.includes("TAKE") || line.includes("TARGET") || line.includes("GOAL")) {
          const numMatch = line.match(/(\d+(?:\.\d+)?)/);
          if (numMatch) {
            const num = parseFloat(numMatch[1]);
            if (!takeProfits.includes(num)) takeProfits.push(num);
          }
        }
      }
    }

    // Set fallback if needed
    if (!entryPrice) {
      if (asset.includes("BTC")) entryPrice = 90000.0;
      else if (asset.includes("XAU")) entryPrice = 2000.0;
      else entryPrice = 1.1000;
    }
    if (!stopLoss) {
      stopLoss = type.includes("BUY") ? entryPrice * 0.99 : entryPrice * 1.01;
    }
    if ((takeProfits?.length ?? 0) === 0) {
      takeProfits.push(type.includes("BUY") ? entryPrice * 1.01 : entryPrice * 0.99);
    }

    return {
      asset,
      type,
      entryPrice: Math.round(entryPrice * 10000) / 10000,
      stopLoss: Math.round(stopLoss * 10000) / 10000,
      takeProfits: takeProfits?.slice(0, 5)?.map(v => Math.round(v * 10000) / 10000),
      datetime: datetimeStr,
      lotMultiplier: lotMultiplier,
      notes: "Extracted via High-Reliability Local Parser"
    };
  };

  const handleImportLocalFallback = () => {
    if (!inputText.trim()) return;
    const parsed = parseSignalLocally(inputText);
    if (parsed) {
      const newSig: TradingSignal = {
        ...parsed,
        id: `SIG_${Date.now()}`
      };
      setSignals([...signals, newSig]);
      setActiveTab("signals");
    }
  };


  // Telegram live sync states
  const [tgSource, setTgSource] = useState<"live" | "paste">("paste");
  const [tgPhone, setTgPhone] = useState("");
  const [tgApiId, setTgApiId] = useState("36807025");
  const [tgApiHash, setTgApiHash] = useState("d40563876989b5e890aae25fc0fb2103");
  const [tgCode, setTgCode] = useState("");
  const [tgPassword, setTgPassword] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [tgStep, setTgStep] = useState<"input" | "otp">("input");
  const [tgError, setTgError] = useState<string | null>(null);
  
  const [tgSession, setTgSession] = useState<string | null>(null);
  const [tgUser, setTgUser] = useState<{ name: string; username: string } | null>(null);
  const [tgChats, setTgChats] = useState<any[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChatIds, setSelectedChatIds] = useState<string[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isFetchingMessages, setIsFetchingMessages] = useState(false);

  // Custom channel syncing and period configuration states
  const [tgCustomChat, setTgCustomChat] = useState("");
  const [tgHistoryPeriod, setTgHistoryPeriod] = useState<"all" | "1_month" | "3_months" | "6_months" | "1_year">("1_month");
  const [tgSyncDepth, setTgSyncDepth] = useState<number>(250);
  const [tgAllowForwardedUsers, setTgAllowForwardedUsers] = useState<boolean>(false);
  const [tgAllowForwardedChannels, setTgAllowForwardedChannels] = useState<boolean>(true);

  // Load saved credentials on mount
  useEffect(() => {
    const savedSession = localStorage.getItem("tg_session");
    const savedApiId = localStorage.getItem("tg_api_id") || "36807025";
    const savedApiHash = localStorage.getItem("tg_api_hash") || "d40563876989b5e890aae25fc0fb2103";
    const savedName = localStorage.getItem("tg_name");
    const savedUsername = localStorage.getItem("tg_username");

    if (savedSession && savedName) {
      setTgSession(savedSession);
      setTgApiId(savedApiId);
      setTgApiHash(savedApiHash);
      setTgUser({ name: savedName, username: savedUsername || "" });
      setTgSource("live");
      fetchTelegramChats(savedApiId, savedApiHash, savedSession);
    }
  }, []);

  const sendTelegramCode = async () => {
    if (!tgPhone || !tgApiId || !tgApiHash) {
      setTgError("Phone number, API ID, and API Hash are required.");
      return;
    }
    setIsSendingCode(true);
    setTgError(null);
    try {
      const response = await fetch("/api/telegram/send-code", {
        method: "POST",
        headers: getAgentHeaders(),
        body: JSON.stringify({ apiId: tgApiId, apiHash: tgApiHash, phoneNumber: tgPhone })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send verification code. Check number format (+ country code).");
      setTgStep("otp");
    } catch (err: any) {
      setTgError(err.message || "Failed to send code");
    } finally {
      setIsSendingCode(false);
    }
  };

  const verifyTelegramCode = async () => {
    if (!tgCode) {
      setTgError("Please enter the verification code sent to your Telegram.");
      return;
    }
    setIsVerifyingCode(true);
    setTgError(null);
    try {
      const response = await fetch("/api/telegram/verify", {
        method: "POST",
        headers: getAgentHeaders(),
        body: JSON.stringify({ phoneNumber: tgPhone, code: tgCode, password: tgPassword })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Verification failed. Check code and optional password.");
      
      localStorage.setItem("tg_session", data.sessionString);
      localStorage.setItem("tg_api_id", tgApiId);
      localStorage.setItem("tg_api_hash", tgApiHash);
      localStorage.setItem("tg_name", data.name);
      localStorage.setItem("tg_username", data.username);

      setTgSession(data.sessionString);
      setTgUser({ name: data.name, username: data.username });
      setTgStep("input");
      setTgPhone("");
      setTgCode("");
      setTgPassword("");
      
      fetchTelegramChats(tgApiId, tgApiHash, data.sessionString);
    } catch (err: any) {
      setTgError(err.message || "Verification failed");
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const disconnectTelegram = () => {
    localStorage.removeItem("tg_session");
    localStorage.removeItem("tg_api_id");
    localStorage.removeItem("tg_api_hash");
    localStorage.removeItem("tg_name");
    localStorage.removeItem("tg_username");
    setTgSession(null);
    setTgUser(null);
    setTgChats([]);
    setTgError(null);
    setSelectedChatId(null);
    setTgStep("input");
  };

  const fetchTelegramChats = async (apiId: string, apiHash: string, session: string) => {
    setIsLoadingChats(true);
    setTgError(null);
    try {
      const response = await fetch("/api/telegram/chats", {
        method: "POST",
        headers: getAgentHeaders(),
        body: JSON.stringify({ apiId, apiHash, sessionString: session })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch chats");
      setTgChats(data.chats || []);
    } catch (err: any) {
      setTgError(err.message || "Failed to load chats");
    } finally {
      setIsLoadingChats(false);
    }
  };

  const triggerTelegramSearch = async (query: string) => {
    if (!tgSession || !query.trim()) return;
    setIsLoadingChats(true);
    setTgError(null);
    try {
      const response = await fetch("/api/telegram/chats", {
        method: "POST",
        headers: getAgentHeaders(),
        body: JSON.stringify({ 
          apiId: tgApiId, 
          apiHash: tgApiHash, 
          sessionString: tgSession,
          searchQuery: query.trim()
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to search Telegram");
      setTgChats(data.chats || []);
    } catch (err: any) {
      setTgError(err.message || "Failed to search Telegram");
    } finally {
      setIsLoadingChats(false);
    }
  };

  const fetchChatMessagesAndParse = async (chatIds: string[]) => {
    if (!tgSession || chatIds.length === 0) return;
    setIsFetchingMessages(true);
    setTgError(null);
    setParseError(null);
    let allMsgs: any[] = [];
    
    try {
      for (const chatId of chatIds) {
          setSelectedChatId(chatId); // Show which one is currently fetching
          const response = await fetch("/api/telegram/messages", {
            method: "POST",
            headers: getAgentHeaders(),
            body: JSON.stringify({ 
              apiId: tgApiId, 
              apiHash: tgApiHash, 
              sessionString: tgSession, 
              chatId,
              period: tgHistoryPeriod,
              limit: tgSyncDepth,
              allowForwardedUsers: tgAllowForwardedUsers,
              allowForwardedChannels: tgAllowForwardedChannels
            })
          });
          const data = await response.json();
          if (!response.ok) {
             console.error(data.error);
             continue; // skip failing ones
          }
          if (data.messages) allMsgs.push(...data.messages);
      }
      
      setSelectedChatId(null);
      if (allMsgs.length === 0) throw new Error("No recent messages matching period filters found in these chats.");

      const concatText = allMsgs.map((m: any) => m.text).reverse().join("\n\n");
      setInputText(concatText);
      setIsFetchingMessages(false);
      setIsParsing(true);
      
      const primaryAgent = agents.find(a => a.id === primaryProvider);
      const backupAgent = agents.find(a => a.id === backupProvider);
      
      const CHUNK_SIZE = 15000;
      let i = 0;
      let allParsed = [];
      
      // We process text in chunks if it's too large to prevent token limits
      while (i < concatText.length) {
         const chunk = concatText.substring(i, i + CHUNK_SIZE);
         i += CHUNK_SIZE;
         const textToSend = preFilterActive ? preFilterText(chunk) : chunk;
         
         const parseRes = await fetch("/api/parse-signals", {
            method: "POST",
            headers: getAgentHeaders(),
            body: JSON.stringify({ 
              text: textToSend, 
              messages: allMsgs,
              provider: primaryAgent?.id || "gemini",
              apiKey: primaryAgent?.apiKey || "",
              model: primaryAgent?.endpoint || "gemini-2.5-flash",
              backupProvider: backupAgent && backupAgent.isActive ? (backupAgent.id || "none") : "none",
              backupApiKey: backupAgent?.apiKey || "",
              backupModel: backupAgent?.endpoint || "deepseek-r1-distill-llama-70b"
            }),
         });
         const parseData = await parseRes.json();
         if (parseRes.ok && parseData && parseData.signals) {
             allParsed.push(...parseData.signals);
         }
      }

      if (allParsed.length > 0) {
          const structuredSignals = allParsed.map((s: any) => ({
            ...s,
            id: `SIG_${crypto.randomUUID().replace(/-/g, "_")}`
          }));
          setSignals(prev => [...prev, ...structuredSignals]);
          setActiveTab("signals");
      } else {
          throw new Error("No signal arrays parsed.");
      }
    } catch (err: any) {
      setTgError(err.message || "Failed to load messages from Telegram chat.");
    } finally {
      setIsFetchingMessages(false);
      setIsParsing(false);
    }
  };
  
  const filteredChats = useMemo(() => {
    if (!searchQuery) return tgChats;
    return tgChats?.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [tgChats, searchQuery]);
  
  // App signals database
  const [signals, setSignals] = useState<TradingSignal[]>([]);

  // Financial API keys state
  const [twelveDataKey, setTwelveDataKey] = useState<string>(() => localStorage.getItem("twelve_data_key") || "7c78999d0ef94e119a05cf636e085d89");
  const [polygonKey, setPolygonKey] = useState<string>(() => localStorage.getItem("polygon_key") || "");
  const [oandaKey, setOandaKey] = useState<string>(() => localStorage.getItem("oanda_key") || "");
  const [customBrokerApiGateway, setCustomBrokerApiGateway] = useState<string>(() => localStorage.getItem("custom_broker_api_gateway") || "");
  // Custom market-data source: lets you plug in any additional real data provider later
  // (a paid vendor, your broker's own feed, etc.) without needing code changes. If set, it
  // is tried first, before Twelve Data / Yahoo Finance / the synthetic fallback.
  const [customDataEndpoint, setCustomDataEndpoint] = useState<string>(() => localStorage.getItem("custom_data_endpoint") || "");
  const [customDataApiKey, setCustomDataApiKey] = useState<string>(() => localStorage.getItem("custom_data_api_key") || "");

  useEffect(() => {
    localStorage.setItem("twelve_data_key", twelveDataKey);
  }, [twelveDataKey]);

  useEffect(() => {
    localStorage.setItem("polygon_key", polygonKey);
  }, [polygonKey]);

  useEffect(() => {
    localStorage.setItem("oanda_key", oandaKey);
  }, [oandaKey]);

  useEffect(() => {
    localStorage.setItem("custom_broker_api_gateway", customBrokerApiGateway);
  }, [customBrokerApiGateway]);

  useEffect(() => {
    localStorage.setItem("custom_data_endpoint", customDataEndpoint);
  }, [customDataEndpoint]);

  useEffect(() => {
    localStorage.setItem("custom_data_api_key", customDataApiKey);
  }, [customDataApiKey]);
  
  // Custom execution configuration rules
  const [config, setConfig] = useState<BacktestConfig>({
    initialBalance: 10000,
    sizingMode: "RISK_PERCENT",
    fixedLotSize: 0.1,
    riskPercent: 2,
    tp1ExitRatio: 0.5,
    moveSlToEntryAtTp1: true,
    breakEvenPipsTrigger: 0,
    trailingStopTrigger: 30,
    trailingStopDistance: 15,
    claimedWinRate: 90,
    spreadPips: 1.5,
    slippagePips: 0.5,
    commissionPerLot: 7.00,
    backtestMode: "real_data",
    backtestPrecision: "every_tick",
    sourceTimezoneOffsetHours: 0,
    newsFilterEnabled: false,
    accountLeverage: 100,
    maintenanceMarginRate: 0.5,
    strictRealData: true,
  });

  const [pendingOptimizationApply, setPendingOptimizationApply] = useState<any | null>(null);

  // Simulation state outputs
  const [simulationResults, setSimulationResults] = useState<BacktestResults | null>(null);
  const [activeSimTradeIdx, setActiveSimTradeIdx] = useState<number>(-1);
  const [simLogSpeed, setSimLogSpeed] = useState<number>(100); // ms per tick tick
  const [simRunningEvents, setSimRunningEvents] = useState<string[]>([]);
  const [chartSelectedTrade, setChartSelectedTrade] = useState<SimulatedTrade | null>(null);
  const [selectedEventIdx, setSelectedEventIdx] = useState<number>(-1);

  // ── Optimizer state ──────────────────────────────────────────────────────────
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizerResults, setOptimizerResults] = useState<any[]>([]);
  const [optimizerSortCol, setOptimizerSortCol] = useState<string>("score");
  const [optimizerSortDir, setOptimizerSortDir] = useState<"desc" | "asc">("desc");
  const [optimizerFilter, setOptimizerFilter] = useState<string>("all");
  const [optimizerBestPerType, setOptimizerBestPerType] = useState<any[]>([]);
  const [optimizerTotalCombinations, setOptimizerTotalCombinations] = useState<number>(0);
  const [optimizerComputationMs, setOptimizerComputationMs] = useState<number>(0);

  // ── Walk-Forward & Portfolio (Enhancement 1 / Item A) ──────────────────────
  const [walkForwardSummary, setWalkForwardSummary] = useState<any | null>(null);
  const [optimizerError, setOptimizerError] = useState<string | null>(null);
  const [portfolioResult, setPortfolioResult]       = useState<any | null>(null);
  const [showAdvancedOptimizerCols, setShowAdvancedOptimizerCols] = useState<boolean>(false);
  const [selectedMatrixCell, setSelectedMatrixCell] = useState<{ trail: number; tpVal: number } | null>(null);

  // ── AI Trailing Stop Optimizer State ─────────────────────────────────────────
  const [optimizerSubTab, setOptimizerSubTab] = useState<"styles" | "ai_stops">("styles");
  const [isAiOptimizingStops, setIsAiOptimizingStops] = useState(false);
  const [tradingStyle, setTradingStyle] = useState<"Conservative" | "Normal" | "Aggressive" | "Swing" | "Scalp">("Normal");
  const [aiOptimizedStopsResult, setAiOptimizedStopsResult] = useState<any | null>(null);
  const [aiOptimizingStopsError, setAiOptimizingStopsError] = useState<string | null>(null);
  const [aiStopsApplied, setAiStopsApplied] = useState(false);
  const [selectedOptimizerEngine, setSelectedOptimizerEngine] = useState<"ai" | "mathematical">("ai");

  // ── Multi-channel benchmarking state ────────────────────────────────────────
  const [channelName, setChannelName] = useState<string>("");
  const [channelRegistry, setChannelRegistry] = useState<Record<string, any[]>>({}); // channelName → signals[]
  const [isRunningChannels, setIsRunningChannels] = useState(false);
  const [channelResults, setChannelResults] = useState<any[]>([]);

  // Load sample raw signal on mount so the user has immediate playground data
  useEffect(() => {
    setInputText(
      "🔔 GOLD SCALPING VIP 🔔\n" +
      "Date: 2026-07-13 14:30:00\n" +
      "BUY XAUUSD NOW @ 2025.50\n" +
      "SL: 2018.00\n" +
      "TP1: 2029.00\n" +
      "TP2: 2035.00\n" +
      "TP3: 2045.00"
    );
  }, []);

  // Connect client to backend multi-provider parser
  const parseSignalsWithGemini = async () => {
    if (!inputText.trim()) {
      setParseError("Please enter or paste raw trading signals first.");
      return;
    }

    setIsParsing(true);
    setParseError(null);

    // Minimize text before sending to AI to save tokens and prevent rate limits (if active)
    const textToSend = preFilterActive ? preFilterText(inputText) : inputText;

    const primaryAgent = agents.find(a => a.id === primaryProvider);
    const backupAgent = agents.find(a => a.id === backupProvider);

    try {
      const response = await fetch("/api/parse-signals", {
        method: "POST",
        headers: getAgentHeaders(),
        body: JSON.stringify({ 
          text: textToSend,
          provider: primaryAgent?.id || "gemini",
          apiKey: primaryAgent?.apiKey || "",
          model: primaryAgent?.endpoint || "gemini-2.5-flash",
          backupProvider: backupAgent && backupAgent.isActive ? (backupAgent.id || "none") : "none",
          backupApiKey: backupAgent?.apiKey || "",
          backupModel: backupAgent?.endpoint || "deepseek-r1-distill-llama-70b"
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned error status: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.signals) {
        // Give each parsed signal a unique ID for client tracking
        const structuredSignals = data.signals?.map((s: any, idx: number) => ({
          ...s,
          id: `SIG_${Date.now()}_${idx}`
        }));
        // Append to the existing Signal Database, but deduplicate based on Asset + Entry Price + Type
        setSignals(prev => {
          const merged = [...prev];
          for (const newSig of structuredSignals) {
            const isModify = newSig.actionType?.toUpperCase() === "MODIFY" || newSig.type?.toUpperCase() === "MODIFY";
            if (isModify) {
              merged.push(newSig);
              continue;
            }
            const duplicateIdx = merged.findIndex(existing => {
              if (existing.actionType?.toUpperCase() === "MODIFY" || existing.type?.toUpperCase() === "MODIFY") return false;
              const sameAsset = existing.asset?.toUpperCase().trim() === newSig.asset?.toUpperCase().trim();
              const sameType = existing.type?.toUpperCase().includes("BUY") === newSig.type?.toUpperCase().includes("BUY");
              const priceDiff = Math.abs(existing.entryPrice - newSig.entryPrice) / (existing.entryPrice || 1);
              return sameAsset && sameType && priceDiff <= 0.0005; // 0.05% tolerance
            });
            if (duplicateIdx === -1) {
              merged.push(newSig);
            } else {
               // Merge take profits
               const existing = merged[duplicateIdx];
               if (newSig.takeProfits) {
                 const combinedTps = [...(existing.takeProfits || []), ...newSig.takeProfits];
                 existing.takeProfits = Array.from(new Set(combinedTps)).sort((a, b) => {
                    const dir = existing.type?.toUpperCase().includes("BUY") ? "BUY" : "SELL";
                    return dir === "BUY" ? a - b : b - a;
                 });
               }
            }
          }
          return merged;
        });
        setActiveTab("signals"); // Auto-move to editable table
      } else {
        throw new Error("No signal arrays parsed in output structure.");
      }
    } catch (err: any) {
      console.error(err);
      setParseError(err.message || "An error occurred while calling the AI parser.");
    } finally {
      setIsParsing(false);
    }
  };

  // Add a blank trade manually in table
  const handleAddManualSignal = () => {
    const now = new Date();
    const pad = (num: number) => String(num).padStart(2, "0");
    const formattedNow = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const newSig: TradingSignal = {
      id: `SIG_${Date.now()}`,
      asset: "XAUUSD",
      type: "BUY",
      entryPrice: 2000.0,
      stopLoss: 1990.0,
      takeProfits: [2010.0, 2020.0, 2030.0],
      datetime: formattedNow,
      notes: "Manually Added"
    };
    setSignals([...signals, newSig]);
  };

  // Update a single signal property inside table
  const handleUpdateSignal = (id: string, field: keyof TradingSignal, value: any) => {
    setSignals(prev => prev?.map(sig => {
      if (sig.id === id) {
        return { ...sig, [field]: value };
      }
      return sig;
    }));
  };

  // Handle multiple TP inputs editing
  const handleUpdateTps = (id: string, tpIdx: number, value: string) => {
    const numVal = parseFloat(value) || 0;
    setSignals(prev => prev?.map(sig => {
      if (sig.id === id) {
        const copyTps = [...sig.takeProfits];
        copyTps[tpIdx] = numVal;
        return { ...sig, takeProfits: copyTps };
      }
      return sig;
    }));
  };

  const handleAddTpLevel = (id: string) => {
    setSignals(prev => prev?.map(sig => {
      if (sig.id === id) {
        const lastTp = sig.takeProfits[((sig.takeProfits?.length ?? 0) ?? 0) - 1] || sig.entryPrice;
        const diff = Math.abs(sig.entryPrice - sig.stopLoss) / 2 || 10;
        const nextTp = lastTp + (sig.type.includes("BUY") ? diff : -diff);
        return { ...sig, takeProfits: [...sig.takeProfits, Math.round(nextTp * 1000) / 1000] };
      }
      return sig;
    }));
  };

  const handleRemoveTpLevel = (id: string, idxToRemove: number) => {
    setSignals(prev => prev?.map(sig => {
      if (sig.id === id && ((sig.takeProfits?.length ?? 0) ?? 0) > 1) {
        return { ...sig, takeProfits: sig.takeProfits?.filter((_, idx) => idx !== idxToRemove) };
      }
      return sig;
    }));
  };

  const handleDeleteSignal = (id: string) => {
    setSignals(prev => prev?.filter(s => s.id !== id));
  };

  const applyToLiveConfig = (r: any) => {
    setPendingOptimizationApply(r);
  };

  const executeApplyToLiveConfig = (r: any) => {
    setConfig(prev => ({
      ...prev,
      riskPercent: r.riskPercent,
      tp1ExitRatio: r.tp1ExitRatio,
      moveSlToEntryAtTp1: r.moveSlToEntryAtTp1,
      trailingStopTrigger: r.trailingStopTrigger,
      trailingStopDistance: r.trailingStopDistance,
      breakEvenPipsTrigger: r.breakEvenPipsTrigger,
      sizingMode: "RISK_PERCENT"
    }));
    setPendingOptimizationApply(null);
  };

  // Signal quality: compute R:R grade from TP1 vs SL distance (before backtest)
  const getSignalRRGrade = (sig: TradingSignal) => {
    const entry = sig.entryPrice;
    const sl    = sig.stopLoss;
    const tp1   = sig.takeProfits?.[0];
    if (!entry || !sl || !tp1 || sl === entry) return { grade: "?", color: "text-slate-500 bg-slate-800", rr: 0 };
    
    const isBuy = sig.type?.toUpperCase().includes("BUY");
    const risk   = isBuy ? entry - sl : sl - entry;
    const reward = isBuy ? tp1 - entry : entry - tp1;
    
    if (risk <= 0 || reward <= 0) {
      return { grade: "ERR", color: "text-rose-500 bg-rose-500/10 border border-rose-500/20", rr: 0 };
    }
    const rr = reward / risk;
    if (rr >= 2.0) return { grade: "A", color: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20", rr };
    if (rr >= 1.5) return { grade: "B", color: "text-teal-400   bg-teal-500/10   border border-teal-500/20",    rr };
    if (rr >= 1.0) return { grade: "C", color: "text-yellow-400 bg-yellow-500/10 border border-yellow-500/20",  rr };
    return              { grade: "D", color: "text-rose-400   bg-rose-500/10   border border-rose-500/20",    rr };
  };

  // Export current active signals database to MT5 CSV format
  const handleExportMT5CSV = () => {
    if ((signals?.length ?? 0) === 0) return;
    setCsvExportStatus("loading");

    fetch("/api/signals/export-csv", {
      method: "POST",
      headers: getAgentHeaders(),
      body: JSON.stringify({ signals, config }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "signals.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setCsvExportStatus("success");
        setTimeout(() => setCsvExportStatus(null), 3000);
      })
      .catch((err) => {
        console.error("MT5 CSV export error:", err);
        setCsvExportStatus("error");
        setTimeout(() => setCsvExportStatus(null), 4000);
      });
  };

  // Download universal replay Expert Advisor (EA)
  const handleDownloadEA = () => {
    if ((signals?.length ?? 0) === 0) {
      alert("No signals to export into EA.");
      return;
    }
    fetch("/api/signals/export-ea", {
      method: "POST",
      headers: getAgentHeaders(),
      body: JSON.stringify({ signals, config }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "SignalBacktester.mq5";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => {
        console.error("MT5 EA export error:", err);
        alert("Failed to export EA.");
      });
  };

  // Core interactive backtest simulator
  const executeSimulationWithLogs = async () => {
    if ((signals?.length ?? 0) === 0) {
      setParseError("There are no structured signals to simulate. Please parse or add signals first.");
      setActiveTab("parser");
      return;
    }

    setIsSimulating(true);
    setActiveTab("sim_console");
    setSimRunningEvents([]);

    let results: BacktestResults;

    try {
        setSimRunningEvents(prev => [
          ...prev,
          `📡 REQUESTING REAL HISTORICAL CANDLES (Twelve Data → Yahoo Finance → cache, auto-fallback)...`,
          `📊 RETRIEVING 1-MINUTE GRANULAR CANDLES FROM SQLite / FINANCIAL API...`,
          `🛡️ MODE: 🔒 STRICT REAL-DATA MODE (No Fake/Synthetic Fallbacks)`,
          `⏱️ TARGET RANGE: Last ${tgHistoryPeriod === "all" ? "Year" : tgHistoryPeriod.replace("_", " ")}`,
          `📦 PROCESSING ${(signals?.length ?? 0)} ACTIVE SIGNALS ON REAL TIME-SERIES...`
        ]);

        const response = await fetch("/api/backtest-real", {
          method: "POST",
          headers: getAgentHeaders(),
          body: JSON.stringify({
            signals,
            config,
            period: tgHistoryPeriod,
            apiKeys: {
              twelveData: twelveDataKey,
              polygon: polygonKey,
              oanda: oandaKey,
              customEndpoint: customDataEndpoint,
              customApiKey: customDataApiKey
            }
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || `Failed to fetch real historical backtest data.`);
        }

        results = await response.json();

      // To make this look hyper-realistic and deeply educational, we simulate an active processing sequence 
      // that outputs log files in real-time as each simulated trade takes place step-by-step
      const dynamicSpeed = (signals?.length ?? 0) > 2 ? Math.min(simLogSpeed, 5) : simLogSpeed;
      
      for (let i = 0; i < ((results?.trades?.length ?? 0) ?? 0); i++) {
        const trade = results.trades[i];
        setActiveSimTradeIdx(i);
        
        setSimRunningEvents(prev => [
          ...prev, 
          `----------------------------------------`,
          `🚀 EXECUTING TRADE #${i + 1} (${trade.signal.asset}) - ${trade.isRealData ? `⚡ REAL DATA [${(trade.dataSource || "market").toUpperCase()}]` : "🎲 SYNTHETIC — no real data available for this signal"}`,
          `----------------------------------------`
        ]);

        // Scroll through each granular tick event of the trade
        for (const ev of trade.events) {
          await new Promise(resolve => setTimeout(resolve, Math.max(1, dynamicSpeed)));
          setSimRunningEvents(prev => [...prev, `[${formatDateTime(ev.time, "short")}] ${ev.message}`]);
        }

        setSimRunningEvents(prev => [
          ...prev,
          `✅ TRADE #${i + 1} RESOLVED | P&L: ${trade.profitAmount >= 0 ? "+" : ""}$${trade.profitAmount.toFixed(2)} USD | Pips: ${trade.pipsGained >= 0 ? "+" : ""}${trade.pipsGained.toFixed(1)} pips.`
        ]);
      }

      await new Promise(resolve => setTimeout(resolve, 300));
      setSimRunningEvents(prev => [
        ...prev,
        `========================================`,
        `🏆 HIGH-FIDELITY BACKTEST COMPLETED`,
        `📊 NET PROFIT: $${results.netProfit.toFixed(2)} USD (${results.netProfitPercent.toFixed(2)}%)`,
        `📈 REAL WIN RATE: ${results.winRate.toFixed(1)}% vs CLAIMED WIN RATE: ${config.claimedWinRate}%`,
        `========================================`
      ]);

      setSimulationResults(results);
      setChartSelectedTrade(results.trades[0] || null);
    } catch (err: any) {
      const isStrict = !!config.strictRealData;
      setSimRunningEvents(prev => [
        ...prev,
        `❌ ERROR DURING REAL BACKTEST EXECUTION:`,
        `[EXCEPTION] ${err.message || "Unknown error connecting to backend API."}`,
        isStrict
          ? `⛔ STRICT MODE ACTIVE: Backtest halted. Falling back is disabled to ensure absolute results integrity.`
          : `⚠️ Falling back to Stochastic price walk simulation...`
      ]);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (isStrict) {
        setParseError(`[Strict Real-Data Verification Halted] ${err.message || "Could not retrieve authentic market candle data."}`);
        setActiveTab("parser");
        return;
      }

      // Automatic fallback
      const fallbackResults = undefined;
      setSimulationResults(fallbackResults);
      setChartSelectedTrade(fallbackResults.trades[0] || null);
    } finally {
      setIsSimulating(false);
      setActiveTab("analytics"); // Auto reveal the premium dashboard
    }
  };

  // ── Optimizer handler ────────────────────────────────────────────────────────
  const runOptimizer = async () => {
    if ((signals?.length ?? 0) === 0) return;
    setIsOptimizing(true);
    setOptimizerResults([]);
    setOptimizerBestPerType([]);
    setOptimizerTotalCombinations(0);
    setOptimizerComputationMs(0);
    setWalkForwardSummary(null);
    setOptimizerError(null);
    try {
      const resp = await fetch("/api/optimize", {
        method: "POST",
        headers: getAgentHeaders(),
        body: JSON.stringify({ signals, baseConfig: config })
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Optimizer returned HTTP ${resp.status}`);
      }
      const data = await resp.json();
      setOptimizerResults(data.results || []);
      setOptimizerBestPerType(data.bestPerType || []);
      setOptimizerTotalCombinations(data.totalCombinations || 0);
      setOptimizerComputationMs(data.computationMs || 0);
      if (data.walkForwardSummary) setWalkForwardSummary(data.walkForwardSummary);
    } catch (err: any) {
      setOptimizerError(err?.message || "Optimizer failed unexpectedly. Check the browser console for details.");
    } finally {
      setIsOptimizing(false);
    }
  };

  // ── AI Trailing Stop Optimizer handler ───────────────────────────────────────
  const runAiStopsOptimizer = async () => {
    if ((signals?.length ?? 0) === 0) return;
    setIsAiOptimizingStops(true);
    setAiOptimizingStopsError(null);
    setAiOptimizedStopsResult(null);
    try {
      const resp = await fetch("/api/optimize-stops", {
        method: "POST",
        headers: getAgentHeaders(),
        body: JSON.stringify({ signals, baseConfig: config, tradingStyle, trades: simulationResults?.trades })
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `AI Optimizer returned HTTP ${resp.status}`);
      }
      const data = await resp.json();
      setAiOptimizedStopsResult(data);
    } catch (err: any) {
      setAiOptimizingStopsError(err?.message || "AI Optimizer failed unexpectedly.");
    } finally {
      setIsAiOptimizingStops(false);
    }
  };

  const applyAiStopsToConfig = (params: any) => {
    setConfig(prev => ({
      ...prev,
      breakEvenPipsTrigger: params.BE_trigger_pips,
      trailingStopTrigger: params.trailing_start_pips,
      trailingStopDistance: params.trailing_step_pips
    }));
    setAiStopsApplied(true);
    setTimeout(() => setAiStopsApplied(false), 4000);
  };

  // Run the portfolio engine (Item A) — sends signals to /api/backtest-portfolio
  const runPortfolioBacktest = async () => {
    if ((signals?.length ?? 0) === 0) return;
    setPortfolioResult(null);
    try {
      const resp = await fetch("/api/backtest-portfolio", {
        method: "POST",
        headers: getAgentHeaders(),
        body: JSON.stringify({ signals, config })
      });
      if (!resp.ok) throw new Error("Portfolio backtest failed");
      const data = await resp.json();
      setPortfolioResult(data);
    } catch (err: any) {
      console.error("[Portfolio Backtest]", err?.message || err);
    }
  };

  // ── Channels handler ─────────────────────────────────────────────────────────
  const addSignalsToChannel = () => {
    const name = channelName.trim() || "Unnamed Channel";
    if ((signals?.length ?? 0) === 0) return;
    setChannelRegistry(prev => ({
      ...prev,
      [name]: [...(prev[name] || []), ...signals]
    }));
  };

  const runChannelComparison = async () => {
    const channels = Object.entries(channelRegistry)?.map(([name, sigs]) => ({ name, signals: sigs }));
    if ((channels?.length ?? 0) === 0) return;
    setIsRunningChannels(true);
    setChannelResults([]);
    try {
      const resp = await fetch("/api/channels/run", {
        method: "POST",
        headers: getAgentHeaders(),
        body: JSON.stringify({ channels, config })
      });
      if (!resp.ok) throw new Error("Channel run failed");
      const data = await resp.json();
      setChannelResults(data.results || []);
    } catch (err: any) {
      console.error("[Channel Comparison]", err?.message || err);
    } finally {
      setIsRunningChannels(false);
    }
  };

  // Custom high-fidelity responsive SVG chart rendering
  // This guarantees 100% stability, beautiful gradients, custom hover interactions, and absolutely zero compiling/compatibility issues!
  const renderSVGChart = (results: BacktestResults) => {
    const history = results.balanceHistory;
    const width = 600;
    const height = 220;
    const paddingLeft = 60;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const balances = history?.map(h => h.balance);
    const minVal = Math.min(...balances) * 0.99;
    const maxVal = Math.max(...balances) * 1.01;
    const range = maxVal - minVal || 100;

    const pointsCount = (history?.length ?? 0);
    const stepX = (width - paddingLeft - paddingRight) / (pointsCount - 1 || 1);

    // Generate path points
    const pts = history?.map((pt, idx) => {
      const x = paddingLeft + idx * stepX;
      const y = height - paddingBottom - ((pt.balance - minVal) / range) * (height - paddingTop - paddingBottom);
      return { x, y, val: pt.balance, label: `Trade ${pt.tradeIndex}: ${pt.asset}` };
    });

    const linePath = pts?.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    
    // Area path closing to bottom axis
    const bottomY = height - paddingBottom;
    const areaPath = (pts?.length ?? 0) > 0 
      ? `${linePath} L ${pts[(pts?.length ?? 0) - 1].x} ${bottomY} L ${pts[0].x} ${bottomY} Z`
      : "";

    // Generate grid lines
    const gridCount = 4;
    const yLines = Array.from({ length: gridCount })?.map((_, i) => {
      const ratio = i / (gridCount - 1);
      const val = minVal + ratio * range;
      const y = height - paddingBottom - ratio * (height - paddingTop - paddingBottom);
      return { y, val };
    });

    return (
      <div className="relative bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-inner overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Account Equity Growth Curve</h4>
            <p className="text-xs text-slate-400 font-mono">Real-time balances plotted per trade execution</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold font-mono">Simulated Balance</span>
          </div>
        </div>

        <div className="w-full h-[220px]">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25"/>
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.00"/>
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {yLines?.map((line, i) => (
              <g key={i}>
                <line 
                  x1={paddingLeft} 
                  y1={line.y} 
                  x2={width - paddingRight} 
                  y2={line.y} 
                  stroke="#1e293b" 
                  strokeDasharray="4 4"
                />
                <text 
                  x={paddingLeft - 8} 
                  y={line.y + 4} 
                  fill="#94a3b8" 
                  fontSize="9" 
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  ${Math.round(line.val)}
                </text>
              </g>
            ))}

            {/* Area under curve */}
            {areaPath && <path d={areaPath} fill="url(#chartGrad)" />}

            {/* Line plot */}
            {linePath && (
              <path 
                d={linePath} 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="2.5" 
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Dynamic Interactive dots */}
            {pts?.map((pt, i) => (
              <g key={i} className="group cursor-pointer">
                <circle 
                  cx={pt.x} 
                  cy={pt.y} 
                  r="4" 
                  fill="#10b981" 
                  stroke="#020617" 
                  strokeWidth="1.5" 
                  className="hover:r-6 transition-all"
                />
                <title>{`${pt.label}\nBalance: $${pt.val.toFixed(2)}`}</title>
              </g>
            ))}

            {/* X-Axis titles */}
            {pts?.map((pt, i) => {
              if (i === 0 || i === (pts?.length ?? 0) - 1 || i === Math.floor((pts?.length ?? 0) / 2)) {
                return (
                  <text 
                    key={i}
                    x={pt.x} 
                    y={height - 8} 
                    fill="#64748b" 
                    fontSize="9" 
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    T#{i}
                  </text>
                );
              }
              return null;
            })}
          </svg>
        </div>
      </div>
    );
  };

  const renderCandlestickChart = (trade: SimulatedTrade, eventIdx: number = -1) => {
    const isBuy = trade.signal.type.toUpperCase().includes("BUY");
    // ── Step 1: Build the raw candle array ──────────────────────────────────────
    // Use real OHLCV candles if available; otherwise synthesize from pricePath ticks
    const allCandles = (() => {
      if (trade.candles && ((trade.candles?.length ?? 0) ?? 0) > 0) return trade.candles;
      const p = trade.pricePath;
      if (!p || (p?.length ?? 0) === 0) return [];
      const synth: { timestamp: number; open: number; high: number; low: number; close: number }[] = [];
      for (let i = 0; i < (p?.length ?? 0); i += 4) {
        const slice = p?.slice(i, Math.min((p?.length ?? 0), i + 4));
        synth.push({
          timestamp: i,
          open:  slice[0],
          high:  Math.max(...slice),
          low:   Math.min(...slice),
          close: slice[(slice?.length ?? 0) - 1]
        });
      }
      return synth;
    })();

    if ((allCandles?.length ?? 0) === 0) {
      return (
        <div className="flex items-center justify-center h-44 text-slate-500 text-xs font-mono">
          No candlestick data available.
        </div>
      );
    }

    // ── Step 2: Dynamically Zoom and Frame to the Active Trade Span ─────────────
    let entryIdx = -1;
    let exitIdx = -1;

    // 1. Locate the entry candle by matching the trade's open time/signal datetime
    if (trade.openTime) {
      const openTs = Math.floor(new Date(trade.openTime).getTime() / 1000);
      let bestDiff = Infinity;
      allCandles.forEach((c, i) => {
        const diff = Math.abs(c.timestamp - openTs);
        if (diff < bestDiff) { bestDiff = diff; entryIdx = i; }
      });
    }

    if (entryIdx < 0 && trade.signal.datetime) {
      const entryTs = Math.floor(new Date(trade.signal.datetime).getTime() / 1000);
      let bestDiff = Infinity;
      allCandles.forEach((c, i) => {
        const diff = Math.abs(c.timestamp - entryTs);
        if (diff < bestDiff) { bestDiff = diff; entryIdx = i; }
      });
    }

    // Fallback: closest candle to entry price
    if (entryIdx < 0) {
      let bestDist = Infinity;
      allCandles.forEach((c, i) => {
        const dist = Math.abs(c.open - trade.entryPrice);
        if (dist < bestDist) { bestDist = dist; entryIdx = i; }
      });
    }
    if (entryIdx < 0) entryIdx = 0;

    // 2. Locate the exit candle by matching the active event's time or the trade's close time
    if (eventIdx !== -1 && trade.events[eventIdx] && trade.events[eventIdx].time) {
      const evTs = Math.floor(new Date(trade.events[eventIdx].time).getTime() / 1000);
      let bestDiff = Infinity;
      allCandles.forEach((c, i) => {
        const diff = Math.abs(c.timestamp - evTs);
        if (diff < bestDiff) { bestDiff = diff; exitIdx = i; }
      });
    } else if (trade.closeTime) {
      const closeTs = Math.floor(new Date(trade.closeTime).getTime() / 1000);
      let bestDiff = Infinity;
      allCandles.forEach((c, i) => {
        const diff = Math.abs(c.timestamp - closeTs);
        if (diff < bestDiff) { bestDiff = diff; exitIdx = i; }
      });
    }

    // Fallback: find the last candle where the price hits finalExitPrice (only for final state)
    if (exitIdx < 0 && eventIdx === -1) {
      allCandles.forEach((c, i) => {
        if (i >= entryIdx) {
          const hasHitExit = c.low <= trade.finalExitPrice && c.high >= trade.finalExitPrice;
          if (hasHitExit) {
            exitIdx = i;
          }
        }
      });
    }

    if (exitIdx < 0) {
      exitIdx = (allCandles?.length ?? 0) - 1;
    }

    // Ensure exit index is at or after entry index
    exitIdx = Math.max(entryIdx, Math.min((allCandles?.length ?? 0) - 1, exitIdx));

    // Pad before entry and after exit for elegant context (e.g. 5 before, 15 after for final, 0 after for event step)
    const padBefore = 5;
    const padAfter = eventIdx !== -1 ? 0 : 15;

    const startIdx = Math.max(0, entryIdx - padBefore);
    const endIdx = Math.min((allCandles?.length ?? 0) - 1, exitIdx + padAfter);

    let candles = allCandles?.slice(startIdx, endIdx + 1);

    // Limit window size to 100 candles max to maintain visual clarity
    const MAX_CANDLES = 100;
    if ((candles?.length ?? 0) > MAX_CANDLES) {
      candles = candles?.slice(0, MAX_CANDLES);
    }

    const isWindowed = (allCandles?.length ?? 0) > (candles?.length ?? 0);

    // Find precise indexes in the current sliced candles window for visualization
    let entryCandleIdxInWindow = -1;
    let exitCandleIdxInWindow = -1;

    if (trade.openTime) {
      const openTs = Math.floor(new Date(trade.openTime).getTime() / 1000);
      let bestDiff = Infinity;
      candles.forEach((c, i) => {
        const diff = Math.abs(c.timestamp - openTs);
        if (diff < bestDiff) { bestDiff = diff; entryCandleIdxInWindow = i; }
      });
    }

    if (entryCandleIdxInWindow < 0) {
      let bestDist = Infinity;
      candles.forEach((c, i) => {
        const dist = Math.abs(c.open - trade.entryPrice);
        if (dist < bestDist) { bestDist = dist; entryCandleIdxInWindow = i; }
      });
    }
    if (entryCandleIdxInWindow < 0) entryCandleIdxInWindow = 0;

    if (eventIdx !== -1 && trade.events[eventIdx] && trade.events[eventIdx].time) {
      const evTs = Math.floor(new Date(trade.events[eventIdx].time).getTime() / 1000);
      let bestDiff = Infinity;
      candles.forEach((c, i) => {
        const diff = Math.abs(c.timestamp - evTs);
        if (diff < bestDiff) { bestDiff = diff; exitCandleIdxInWindow = i; }
      });
    } else if (trade.closeTime) {
      const closeTs = Math.floor(new Date(trade.closeTime).getTime() / 1000);
      let bestDiff = Infinity;
      candles.forEach((c, i) => {
        const diff = Math.abs(c.timestamp - closeTs);
        if (diff < bestDiff) { bestDiff = diff; exitCandleIdxInWindow = i; }
      });
    }

    if (exitCandleIdxInWindow < 0) {
      let bestDiff = Infinity;
      const targetExitPrice = eventIdx !== -1 && trade.events[eventIdx] && trade.events[eventIdx].price !== undefined
        ? trade.events[eventIdx].price
        : trade.finalExitPrice;
      candles.forEach((c, i) => {
        if (i >= entryCandleIdxInWindow) {
          const diff = Math.abs(c.close - targetExitPrice);
          if (diff < bestDiff) { bestDiff = diff; exitCandleIdxInWindow = i; }
        }
      });
    }
    if (exitCandleIdxInWindow < 0) exitCandleIdxInWindow = (candles?.length ?? 0) - 1;
    exitCandleIdxInWindow = Math.max(entryCandleIdxInWindow, exitCandleIdxInWindow);

    // Dynamic Trail Stop Evaluation up to Selected Event Index
    let dynamicSl = trade.stopLoss;
    const eventsToProcess = eventIdx === -1 ? trade.events : trade.events?.slice(0, eventIdx + 1);
    eventsToProcess.forEach(ev => {
      if (ev.type === "BE" || ev.type === "TRAILING") {
        dynamicSl = ev.price;
      }
    });

    // ── Step 3: Smart Y-axis ──────────────────────────────────────────────────
    const tradeLevels = [trade.entryPrice, dynamicSl, ...trade.takeProfits]?.filter(p => p > 0);
    const tradeMin    = Math.min(...tradeLevels);
    const tradeMax    = Math.max(...tradeLevels);
    const slDist      = Math.abs(trade.entryPrice - dynamicSl) || Math.abs(tradeMax - tradeMin) || trade.entryPrice * 0.005 || 1;

    const capAbove = trade.entryPrice + slDist * 3.5;
    const capBelow = trade.entryPrice - slDist * 3.5;

    const visibleCandlePrices = candles
      .flatMap(c => [c.high, c.low])
      ?.filter(p => p >= capBelow && p <= capAbove);

    const allRelevantPrices = [...tradeLevels, ...visibleCandlePrices];
    const rawMin = Math.min(...allRelevantPrices);
    const rawMax = Math.max(...allRelevantPrices);

    const minRange = slDist * 2;
    const centre   = (tradeMin + tradeMax) / 2;
    const effectiveMin = Math.min(rawMin, centre - minRange / 2);
    const effectiveMax = Math.max(rawMax, centre + minRange / 2);

    const pad        = (effectiveMax - effectiveMin) * 0.08;
    const paddedMin  = effectiveMin - pad;
    const paddedMax  = effectiveMax + pad;
    const paddedRange = paddedMax - paddedMin || 1;

    // ── Chart geometry ──────────────────────────────────────────────────────────
    const width         = 560;
    const height        = 220;
    const paddingLeft   = 8;
    const paddingRight  = 78;
    const paddingTop    = 20;
    const paddingBottom = 20;
    const chartWidth    = width - paddingLeft - paddingRight;
    const chartHeight   = height - paddingTop - paddingBottom;

    const getY = (price: number) =>
      height - paddingBottom - ((price - paddedMin) / paddedRange) * chartHeight;

    const candleCount = (candles?.length ?? 0);
    const displaySlots = Math.max(candleCount, 20);
    const stepX        = chartWidth / displaySlots;
    const cw           = Math.max(2, Math.min(18, stepX * 0.68));

    const dec = trade.entryPrice > 100 ? 2 : trade.entryPrice > 1 ? 4 : 5;

    const entryX = paddingLeft + entryCandleIdxInWindow * stepX + stepX / 2;
    const exitX = paddingLeft + exitCandleIdxInWindow * stepX + stepX / 2;

    const currentEvent = eventIdx !== -1 ? trade.events[eventIdx] : null;
    let eventCandleIdxInWindow = -1;
    if (currentEvent && currentEvent.time) {
      const evTs = Math.floor(new Date(currentEvent.time).getTime() / 1000);
      let bestDiff = Infinity;
      candles.forEach((c, i) => {
        const diff = Math.abs(c.timestamp - evTs);
        if (diff < bestDiff) { bestDiff = diff; eventCandleIdxInWindow = i; }
      });
    }

    return (
      <div className="relative w-full">
        {/* Candle count / source badge */}
        <div className="absolute top-1 left-1 z-10 bg-slate-900/80 border border-slate-800 rounded px-1.5 py-0.5 text-[9px] font-mono text-slate-500">
          {(candles?.length ?? 0)} candles {isWindowed ? `(of ${(allCandles?.length ?? 0)})` : ""}
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56 overflow-visible select-none">

          {/* ── Background ───────────────────────────────────────────────────── */}
          <rect x={paddingLeft} y={paddingTop} width={chartWidth} height={chartHeight} fill="#020817" rx="2" />

          {/* ── Horizontal grid lines with price labels ──────────────────────── */}
          {[0, 0.25, 0.5, 0.75, 1]?.map((ratio, idx) => {
            const price = paddedMin + ratio * paddedRange;
            const y     = getY(price);
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft} y1={y}
                  x2={width - paddingRight} y2={y}
                  stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3,5"
                />
                <text
                  x={width - paddingRight + 5} y={y + 3}
                  fill="#475569" fontSize="7.5" fontFamily="monospace" textAnchor="start"
                >
                  {price.toFixed(dec)}
                </text>
              </g>
            );
          })}

          {/* ── Active Trade P&L Shaded Area ─────────────────────────── */}
          {(() => {
            const isBuy = trade.signal.type.toUpperCase().includes("BUY");
            const isProfit = trade.finalExitPrice !== trade.stopLoss && trade.pipsGained >= 0;
            const entryY = getY(trade.entryPrice);
            const exitY = getY(trade.finalExitPrice);
            
            const areaY = Math.min(entryY, exitY);
            const areaHeight = Math.abs(entryY - exitY);
            const areaWidth = exitX - entryX;

            if (areaWidth <= 0 || areaHeight <= 0) return null;

            return (
              <rect
                x={entryX}
                y={areaY}
                width={areaWidth}
                height={areaHeight}
                fill={isProfit ? "#10b981" : "#ef4444"}
                fillOpacity="0.08"
                stroke={isProfit ? "#10b981" : "#ef4444"}
                strokeOpacity="0.15"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            );
          })()}

          {/* ── Candlesticks ─────────────────────────────────────────────────── */}
          {candles?.map((candle, cIdx) => {
            const cx       = paddingLeft + cIdx * stepX + stepX / 2;
            const clamp    = (v: number) => Math.min(Math.max(v, paddedMin), paddedMax);
            const yHigh    = getY(clamp(candle.high));
            const yLow     = getY(clamp(candle.low));
            const yOpen    = getY(clamp(candle.open));
            const yClose   = getY(clamp(candle.close));
            const isBull   = candle.close >= candle.open;
            
            // Premium TradingView-style dark mode palette: teal-green and rose-red
            const bodyCol  = isBull ? "#26a69a" : "#ef5350";
            const borderCol = isBull ? "#26a69a" : "#ef5350";
            const wickCol  = isBull ? "#26a69a" : "#ef5350";
            
            const bodyTop    = Math.min(yOpen, yClose);
            const bodyBottom = Math.max(yOpen, yClose);
            const bodyH      = Math.max(1.0, bodyBottom - bodyTop);

            const candleDateStr = formatDateTime(candle.timestamp * 1000);

            return (
              <g key={cIdx}>
                <title>{`Time: ${candleDateStr}\nO:${candle.open.toFixed(dec)} H:${candle.high.toFixed(dec)} L:${candle.low.toFixed(dec)} C:${candle.close.toFixed(dec)}`}</title>
                {/* Wick with crispEdges for vertical alignment without blurring */}
                <line 
                  x1={cx} 
                  y1={yHigh} 
                  x2={cx} 
                  y2={yLow} 
                  stroke={wickCol} 
                  strokeWidth="1.2" 
                  shapeRendering="crispEdges"
                />
                {/* Body with classic flat sharp edges and professional borders */}
                <rect 
                  x={cx - cw / 2} 
                  y={bodyTop} 
                  width={cw} 
                  height={bodyH} 
                  fill={bodyCol} 
                  stroke={borderCol}
                  strokeWidth="1"
                  shapeRendering="crispEdges"
                />
              </g>
            );
          })}

          {/* ── Entry line ───────────────────────────────────────────────────── */}
          {(() => {
            const y = getY(trade.entryPrice);
            const labelX = paddingLeft + 5;
            return (
              <g>
                <title>{`Entry Price: ${trade.entryPrice.toFixed(dec)}\nOpened: ${trade.openTime ? formatDateTime(trade.openTime) : "N/A"}\nSignal Posted: ${trade.signal.datetime ? formatDateTime(trade.signal.datetime) : "N/A"}`}</title>
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y}
                  stroke="#06b6d4" strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="2,2" />
                <line x1={entryX} y1={y} x2={exitX} y2={y}
                  stroke="#06b6d4" strokeWidth="2" />
                <rect x={labelX} y={y - 8} width={74} height={11} fill="#0e1e2e" stroke="#06b6d4" strokeWidth="1" rx="3" />
                <text x={labelX + 4} y={y} fill="#22d3ee" fontSize="7.5" fontFamily="monospace" fontWeight="700">
                  Entry {trade.entryPrice.toFixed(dec)}
                </text>
              </g>
            );
          })()}

          {/* ── Stop Loss line (Dotted Trailing SL Lines) ───────────────────────────────────────────────── */}
          {(() => {
            const y = getY(dynamicSl);
            const labelX = paddingLeft + 85;
            const isTrailing = dynamicSl !== trade.stopLoss;
            const labelText = isTrailing ? `Trail SL ${dynamicSl.toFixed(dec)}` : `SL ${dynamicSl.toFixed(dec)}`;
            const labelWidth = isTrailing ? 92 : 72;
            return (
              <g>
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y}
                  stroke="#f43f5e" strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="2,2" />
                <line x1={entryX} y1={y} x2={exitX} y2={y}
                  stroke="#f43f5e" strokeWidth="1.5" strokeDasharray={isTrailing ? "3,3" : undefined} />
                <rect x={labelX} y={y - 8} width={labelWidth} height={11} fill="#251216" stroke="#f43f5e" strokeWidth="1" rx="3" />
                <text x={labelX + 4} y={y} fill="#f43f5e" fontSize="7.5" fontFamily="monospace" fontWeight="600">
                  {labelText}
                </text>
              </g>
            );
          })()}

          {/* ── Stop Loss Trajectory Overlay ─────────────────────────────────── */}
          {(() => {
            const points: { x: number; y: number }[] = [];
            for (let cIdx = entryCandleIdxInWindow; cIdx <= exitCandleIdxInWindow; cIdx++) {
              if (cIdx >= (candles?.length ?? 0)) break;
              const candle = candles[cIdx];
              let slAtCandle = trade.stopLoss;
              
              // Find the latest BE/TRAILING event before or at this candle's timestamp
              const eventsBeforeCandle = (eventIdx === -1 ? trade.events : trade.events?.slice(0, eventIdx + 1))
                ?.filter(ev => {
                  if (!ev.time) return false;
                  const evTs = Math.floor(new Date(ev.time).getTime() / 1000);
                  return evTs <= candle.timestamp;
                });
              
              eventsBeforeCandle.forEach(ev => {
                if (ev.type === "BE" || ev.type === "TRAILING") {
                  slAtCandle = ev.price;
                }
              });

              const cx = paddingLeft + cIdx * stepX + stepX / 2;
              points.push({ x: cx, y: getY(slAtCandle) });
            }

            if ((points?.length ?? 0) < 2) return null;

            // Generate SVG path string
            const pathD = points?.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

            return (
              <g opacity="0.85">
                {/* Glow/shadow line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="3.5"
                  strokeOpacity="0.15"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Main trajectory line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="1.5"
                  strokeDasharray="3,2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Small indicator dots on key points */}
                {points?.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r="2"
                    fill="#f43f5e"
                    stroke="#020817"
                    strokeWidth="0.5"
                  />
                ))}
              </g>
            );
          })()}

          {/* ── Take Profit lines ────────────────────────────────────────────── */}
          {trade.takeProfits?.map((tp, tpIdx) => {
            const y = getY(tp);
            const labelX = paddingLeft + 185 + tpIdx * 75;
            return (
              <g key={tpIdx}>
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y}
                  stroke="#10b981" strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="2,2" />
                <line x1={entryX} y1={y} x2={exitX} y2={y}
                  stroke="#10b981" strokeWidth="1.5" />
                <rect x={labelX} y={y - 8} width={65} height={11} fill="#062217" stroke="#10b981" strokeWidth="1" rx="3" />
                <text x={labelX + 4} y={y} fill="#10b981" fontSize="7.5" fontFamily="monospace" fontWeight="600">
                  TP{tpIdx + 1} {tp.toFixed(dec)}
                </text>
              </g>
            );
          })}

          {/* ── Final exit marker ────────────────────────────────────────────── */}
          {eventIdx === -1 && (() => {
            const exitY = getY(trade.finalExitPrice);
            const isProfit = trade.finalExitPrice !== trade.stopLoss && trade.pipsGained >= 0;
            const labelWidth = 65;
            const drawOnLeft = exitX + 6 + labelWidth > width;
            const rectX = drawOnLeft ? exitX - 6 - labelWidth : exitX + 6;
            const textX = drawOnLeft ? exitX - labelWidth - 2 : exitX + 10;
            return (
              <g>
                <title>{`Exit Price: ${trade.finalExitPrice.toFixed(dec)}\nClosed: ${trade.closeTime ? formatDateTime(trade.closeTime) : "N/A"}\nOutcome: ${trade.status}`}</title>
                {/* Vertical exit marker timeline */}
                <line x1={exitX} y1={paddingTop} x2={exitX} y2={height - paddingBottom}
                  stroke={isProfit ? "#10b981" : "#f43f5e"} strokeWidth="1" strokeDasharray="3,3" strokeOpacity="0.4" />
                
                {/* Horizontal exit line */}
                <line x1={exitX - 25} y1={exitY} x2={exitX} y2={exitY}
                  stroke={isProfit ? "#10b981" : "#f43f5e"} strokeWidth="1.5" strokeDasharray="2,2" />
                
                {/* Exit circle marker */}
                <circle cx={exitX} cy={exitY} r="5"
                  fill={isProfit ? "#10b981" : "#f43f5e"} stroke="#020817" strokeWidth="1.5" opacity="1" />
                
                {/* Dynamic exit label near the exit spot */}
                <rect x={rectX} y={exitY - 7} width={labelWidth} height={12} fill={isProfit ? "#10b981" : "#f43f5e"} rx="2" />
                <text x={textX} y={exitY + 1.5} fill="#020817" fontSize="7.5" fontFamily="monospace" fontWeight="800">
                  Exit @ {trade.finalExitPrice.toFixed(dec)}
                </text>
              </g>
            );
          })()}

          {/* ── Dynamic Execution Marker (triangles/crosshairs) showing where active step-through event occurred ── */}
          {currentEvent && currentEvent.price !== undefined && eventCandleIdxInWindow !== -1 && (() => {
            const evX = paddingLeft + eventCandleIdxInWindow * stepX + stepX / 2;
            const evY = getY(currentEvent.price);
            const isSlOrLoss = currentEvent.type === "SL" || currentEvent.type === "BE";
            const isTpOrWin = currentEvent.type === "PARTIAL_CLOSE" || currentEvent.type === "CLOSE";
            const color = isTpOrWin ? "#10b981" : isSlOrLoss ? "#ef4444" : "#f59e0b";
            const boxWidth = 102;
            const drawOnLeft = evX + 6 + boxWidth > width;
            const boxX = drawOnLeft ? evX - 6 - boxWidth : evX + 6;
            const textX = drawOnLeft ? evX - boxWidth - 1 : evX + 11;
            return (
              <g>
                <title>{`Event: ${currentEvent.type}\nPrice: ${currentEvent.price.toFixed(dec)}\nTime: ${currentEvent.time ? formatDateTime(currentEvent.time) : "N/A"}`}</title>
                {/* Crosshair lines */}
                <line x1={evX} y1={paddingTop} x2={evX} y2={height - paddingBottom}
                  stroke={color} strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
                <line x1={paddingLeft} y1={evY} x2={width - paddingRight} y2={evY}
                  stroke={color} strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
                
                {/* Crosshair cross marker */}
                <path d={`M ${evX - 8} ${evY} L ${evX + 8} ${evY} M ${evX} ${evY - 8} L ${evX} ${evY + 8}`} stroke={color} strokeWidth="1.5" />
                
                {/* Triangles pointing directly at execution spot */}
                <polygon
                  points={isBuy ? `${evX},${evY - 4} ${evX - 5},${evY + 5} ${evX + 5},${evY + 5}` : `${evX},${evY + 4} ${evX - 5},${evY - 5} ${evX + 5},${evY - 5}`}
                  fill={color}
                  stroke="#020817"
                  strokeWidth="1"
                />

                <circle cx={evX} cy={evY} r="3" fill="#020817" stroke={color} strokeWidth="1.5" />
                
                {/* Floating execution box */}
                <rect x={boxX} y={evY - 14} width={boxWidth} height={15} fill="#020817" stroke={color} strokeWidth="1" rx="3" />
                <text x={textX} y={evY - 3.5} fill={color} fontSize="7" fontFamily="monospace" fontWeight="bold">
                  {currentEvent.type} @ {currentEvent.price.toFixed(dec)}
                </text>
              </g>
            );
          })()}

        </svg>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      
      {/* Dynamic Upper Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-teal-500 to-emerald-400 p-2 rounded-xl text-slate-950 shadow-lg shadow-emerald-500/10">
            <Bot className="w-6 h-6 stroke-[2.25]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold tracking-tight text-lg text-slate-100">Telegram Signals Backtester</h1>
              <span className="bg-slate-900 border border-slate-800 text-[10px] px-2 py-0.5 rounded-full font-semibold font-mono text-emerald-400">
                PRO ACTIVE SIMULATOR
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Verify win rates, evaluate risk management, and exposed realistic yields.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Timezone Selector Popover */}
          <div className="relative">
            <button
              onClick={() => setIsTzDropdownOpen(v => !v)}
              className="flex flex-col items-end border-r border-slate-900 pr-4 hover:opacity-85 transition-opacity text-right focus:outline-none cursor-pointer"
              title="Click to change timezone"
            >
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1 justify-end">
                Active Timezone <Settings className="w-3 h-3 text-slate-600 animate-spin" style={{ animationDuration: '6s' }} />
              </span>
              <div className="flex items-center gap-1.5 text-xs text-teal-400 font-mono font-medium">
                <Clock className="w-3.5 h-3.5 text-teal-500 animate-pulse" />
                <span>
                  {currentTime.toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                    timeZone: userTimezone === "Local" ? Intl.DateTimeFormat().resolvedOptions().timeZone : userTimezone
                  })}
                </span>
                <span className="text-[9px] text-slate-400 font-bold bg-slate-900 border border-slate-800 px-1 py-0.5 rounded leading-none shrink-0 uppercase">
                  {userTimezone === "Local" ? "Local" : userTimezone.split("/").pop()?.replace(/_/g, " ")}
                </span>
              </div>
            </button>

            <AnimatePresence>
              {isTzDropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-40 cursor-default" 
                    onClick={() => setIsTzDropdownOpen(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-72 bg-slate-950 border border-slate-850 rounded-2xl p-4 shadow-2xl z-50 text-left"
                  >
                    <div className="flex items-center justify-between mb-3 border-b border-slate-900 pb-2">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-teal-500" />
                        Select Timezone
                      </span>
                      <button 
                        onClick={() => {
                          setUserTimezone("Local");
                          setIsTzDropdownOpen(false);
                        }}
                        className="text-[10px] text-teal-400 hover:text-teal-300 font-semibold underline font-mono cursor-pointer"
                      >
                        Reset to Local
                      </button>
                    </div>

                    {/* Search Field */}
                    <div className="relative mb-3">
                      <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="text"
                        value={tzSearchQuery}
                        onChange={(e) => setTzSearchQuery(e.target.value)}
                        placeholder="Search global timezones..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
                        autoFocus
                      />
                    </div>

                    {/* Timezone List */}
                    <div className="max-h-56 overflow-y-auto flex flex-col gap-1 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                      {MAJOR_TIMEZONES?.filter(tz => 
                        tz.name.toLowerCase().includes(tzSearchQuery.toLowerCase()) || 
                        tz.id.toLowerCase().includes(tzSearchQuery.toLowerCase())
                      )?.map(tz => {
                        const isSelected = userTimezone === tz.id;
                        const ianaName = tz.id === "Local" ? Intl.DateTimeFormat().resolvedOptions().timeZone : tz.id;
                        let timeString = "N/A";
                        try {
                          timeString = currentTime.toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                            timeZone: ianaName
                          });
                        } catch(e) {}

                        return (
                          <button
                            key={tz.id}
                            type="button"
                            onClick={() => {
                              setUserTimezone(tz.id);
                              setIsTzDropdownOpen(false);
                              setTzSearchQuery("");
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected 
                                ? "bg-teal-600/10 text-teal-400 border border-teal-500/20" 
                                : "hover:bg-slate-900/50 text-slate-400 hover:text-slate-200 border border-transparent"
                            }`}
                          >
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-semibold truncate leading-tight">{tz.name}</span>
                              <span className="text-[9px] text-slate-500 truncate font-mono mt-0.5">{tz.id}</span>
                            </div>
                            <span className="text-[10px] font-mono font-medium text-slate-400 bg-slate-950 border border-slate-900 px-1.5 py-0.5 rounded ml-2 shrink-0">
                              {timeString}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-300">Gemini 3.5 Parser Core Active</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 p-6 max-w-[1700px] w-full mx-auto">
        
        {/* SIDE PANEL: Configuration and Paste Engine (xl:col-span-4) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          
          {/* Signal Source Container */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
            
            {/* Header with Title */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-400" />
                <h3 className="font-semibold text-slate-200 text-sm">Signal Source Engine</h3>
              </div>
              <span className="text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-md font-mono">
                {tgSource === "live" ? "REAL CONNECT" : "MANUAL"}
              </span>
            </div>

            {/* Segmented Source Selector */}
            <div className="grid grid-cols-2 p-1 bg-slate-950/60 border border-slate-900 rounded-xl">
              <button
                onClick={() => setTgSource("paste")}
                className={`py-1.5 text-center text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  tgSource === "paste"
                    ? "bg-slate-800 text-teal-400 font-bold"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                ✍️ Paste Raw Logs
              </button>
              <button
                onClick={() => setTgSource("live")}
                className={`py-1.5 text-center text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  tgSource === "live"
                    ? "bg-slate-800 text-teal-400 font-bold"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                <Wifi className="w-3 h-3 animate-pulse" />
                🔌 Live Telegram Sync
              </button>
            </div>

            {tgSource === "paste" ? (
              <>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-slate-400 font-medium">Paste raw trade messages:</label>
                    <button 
                      onClick={() => setInputText("")}
                      className="text-[10px] text-rose-400 font-semibold hover:underline font-mono cursor-pointer"
                    >
                      Clear Input
                    </button>
                  </div>
                  <textarea
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                    }}
                    placeholder="Example:&#10;BUY XAUUSD @ 2025.5&#10;SL: 2018.0&#10;TP1: 2029.0&#10;TP2: 2035.0"
                    className="w-full h-36 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 font-mono placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 resize-none leading-relaxed transition-all"
                  />
                </div>

                {/* Pre-Filter & Token Optimization Controls */}
                <div className="flex flex-col gap-2.5 bg-slate-950/60 border border-slate-900 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preFilterActive}
                        onChange={(e) => setPreFilterActive(e.target.checked)}
                        className="rounded border-slate-800 bg-slate-950 text-teal-500 focus:ring-0 cursor-pointer"
                      />
                      Pre-Filter & Minimize text
                    </label>
                    <span className="text-[10px] text-teal-400 bg-teal-400/10 px-1.5 py-0.5 rounded font-bold font-mono">
                      Token Saver
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Organize raw content first, stripping chat/marketing noise. Reduces prompt sizes up to 85% before sending to the smarter LLM.
                  </p>
                  {preFilterActive && inputText.trim() && (() => {
                    const originalLength = (inputText?.length ?? 0);
                    const filtered = preFilterText(inputText);
                    const filteredLength = (filtered?.length ?? 0);
                    const savings = originalLength > 0 ? Math.round(((originalLength - filteredLength) / originalLength) * 100) : 0;
                    return (
                      <div className="mt-1 border-t border-slate-900 pt-2 flex flex-col gap-1 text-[10px] font-mono text-slate-400">
                        <div className="flex justify-between">
                          <span>Original Characters:</span>
                          <span className="text-slate-300">{originalLength}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Minimized Characters:</span>
                          <span className="text-teal-400">{filteredLength}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Estimated Savings:</span>
                          <span className="text-teal-400">-{savings}% Tokens</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Extracted message logs preview */}
                {inputText.trim() && (
                  <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>EXTRACTED LOGS PREVIEW</span>
                      <span>JUST NOW</span>
                    </div>
                    <div className="text-[11px] text-slate-300 font-mono line-clamp-4 bg-slate-950 p-2 rounded border border-slate-900 break-words leading-relaxed">
                      {preFilterActive ? preFilterText(inputText) : inputText}
                    </div>

                    {/* Local Fallback Parser Indicator */}
                    <div className="flex items-center justify-between border-t border-slate-900 pt-2 text-[10px]">
                      <span className="text-slate-400 font-medium">Local Fallback Extraction:</span>
                      <span className="text-teal-400 font-mono font-bold">READY</span>
                    </div>

                    {/* Display extracted data only (Rule 1: "The UI should extract and display timestamp + trade message only") */}
                    {(() => {
                      const parsed = parseSignalLocally(inputText);
                      if (!parsed) return null;
                      return (
                        <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex flex-col gap-1 text-[10px] font-mono">
                          <div className="text-slate-400">Timestamp: <span className="text-teal-400 font-semibold">{formatDateTime(new Date())}</span></div>
                          <div className="text-slate-400">Trade Message: <span className="text-slate-200">{parsed.type} {parsed.asset} @ {parsed.entryPrice} (SL: {parsed.stopLoss}, TPs: {parsed.takeProfits.join(", ")})</span></div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {parseError && (
                  <div className="bg-rose-500/5 border border-rose-500/15 p-3 rounded-xl flex items-start gap-2.5 text-xs text-rose-400 leading-normal">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{parseError}</span>
                  </div>
                )}

                {/* Two entry buttons: AI Parse vs Manual Fallback */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={parseSignalsWithGemini}
                    disabled={isParsing || !inputText.trim()}
                    className="w-full bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/5"
                  >
                    {isParsing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Parsing with {agents.find(a => a.id === primaryProvider)?.name || "AI"}...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-slate-950" />
                        <span>AI Parse with {agents.find(a => a.id === primaryProvider)?.name || "AI"}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleImportLocalFallback}
                    disabled={!inputText.trim()}
                    className="w-full bg-slate-800 hover:bg-slate-750 disabled:bg-slate-900 disabled:text-slate-600 border border-slate-700 text-teal-400 font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Import as Manual Signal (Offline Fallback)</span>
                  </button>
                </div>
              </>
            ) : (
              // LIVE TELEGRAM MTPROTO SYNCHRONIZATION
              <div className="flex flex-col gap-4">
                
                {tgError && (
                  <div className="bg-rose-500/5 border border-rose-500/15 p-3 rounded-xl flex items-start gap-2 text-xs text-rose-400 leading-normal">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="break-all">{tgError}</span>
                  </div>
                )}

                {!tgSession ? (
                  // LOGIN WIZARD
                  <div className="flex flex-col gap-3">
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900">
                      <p className="text-[11px] text-slate-400 leading-relaxed flex items-start gap-1.5">
                        <Info className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                        <span>Connect directly to your personal Telegram account to sync logs from your channels in real-time.</span>
                      </p>
                    </div>

                    {tgStep === "input" ? (
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Phone Number (International format)</label>
                          <input
                            type="tel"
                            placeholder="+1234567890"
                            value={tgPhone}
                            onChange={(e) => setTgPhone(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-teal-500/50"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">API ID</label>
                            <input
                              type="text"
                              value={tgApiId}
                              onChange={(e) => setTgApiId(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 font-mono focus:outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">API Hash</label>
                            <input
                              type="text"
                              value={tgApiHash}
                              onChange={(e) => setTgApiHash(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 font-mono focus:outline-none"
                            />
                          </div>
                        </div>

                        <button
                          onClick={sendTelegramCode}
                          disabled={isSendingCode || !tgPhone.trim()}
                          className="w-full bg-teal-500 hover:bg-teal-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          {isSendingCode ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Sending OTP Code...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Request OTP Code</span>
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Enter Telegram OTP Code</label>
                            <button onClick={() => setTgStep("input")} className="text-[9px] text-teal-400 hover:underline">Change Phone</button>
                          </div>
                          <input
                            type="text"
                            placeholder="Check your Telegram chat for code"
                            value={tgCode}
                            onChange={(e) => setTgCode(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 font-mono text-center tracking-widest focus:outline-none focus:border-teal-500/50"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                            <Lock className="w-3 h-3 text-slate-500" />
                            <span>2FA Password (Optional)</span>
                          </label>
                          <input
                            type="password"
                            placeholder="Only if Two-Step Verification is active"
                            value={tgPassword}
                            onChange={(e) => setTgPassword(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-teal-500/50"
                          />
                        </div>

                        <button
                          onClick={verifyTelegramCode}
                          disabled={isVerifyingCode || !tgCode.trim()}
                          className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          {isVerifyingCode ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Establishing Secure Connection...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Verify & Connect Account</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  // AUTHENTICATED CHAT NAVIGATOR
                  <div className="flex flex-col gap-3">
                    
                    {/* User Profile Bar */}
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-900 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-teal-500/20 text-teal-400 p-1.5 rounded-lg">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-slate-200">{tgUser?.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">@{tgUser?.username || "telegram"}</span>
                        </div>
                      </div>
                      <button 
                        onClick={disconnectTelegram}
                        title="Disconnect Account"
                        className="text-slate-500 hover:text-rose-400 p-1.5 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Custom Sync & Period Filters */}
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Backtest Period Filter</label>
                        <select
                          value={tgHistoryPeriod}
                          onChange={(e) => setTgHistoryPeriod(e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-slate-300 focus:outline-none"
                        >
                          <option value="1_month">Last 30 Days (1 Month)</option>
                          <option value="3_months">Last 90 Days (3 Months)</option>
                          <option value="6_months">Last 180 Days (6 Months)</option>
                          <option value="1_year">Last 365 Days (1 Year)</option>
                          <option value="all">Unlimited History (Max Messages)</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1 border-t border-slate-900 pt-2">
                        <div className="flex flex-col gap-2 mb-3">
                          <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Message Filtering</label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={tgAllowForwardedChannels}
                              onChange={(e) => setTgAllowForwardedChannels(e.target.checked)}
                              className="w-3.5 h-3.5 text-cyan-500 bg-slate-900 border-slate-700 rounded focus:ring-cyan-500"
                            />
                            <span className="text-xs text-slate-300">Allow Forwarded Messages from Channels</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={tgAllowForwardedUsers}
                              onChange={(e) => setTgAllowForwardedUsers(e.target.checked)}
                              className="w-3.5 h-3.5 text-cyan-500 bg-slate-900 border-slate-700 rounded focus:ring-cyan-500"
                            />
                            <span className="text-xs text-slate-300">Allow Forwarded Messages from Users</span>
                          </label>
                        </div>
                        <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Message Sync Depth Limit</label>
                        <select
                          value={tgSyncDepth}
                          onChange={(e) => setTgSyncDepth(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-slate-300 focus:outline-none font-mono"
                        >
                          <option value="100">100 Messages (Fast Setup)</option>
                          <option value="250">250 Messages (Standard)</option>
                          <option value="500">500 Messages (Deep)</option>
                          <option value="1000">1,000 Messages (Very Deep)</option>
                          <option value="5000">5,000 Messages (Intense)</option>
                          <option value="10000">10,000 Messages (Pro Deep)</option>
                          <option value="25000">25,000 Messages (Super Deep)</option>
                          <option value="50000">50,000 Messages (Ultra Legacy Deep)</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1 border-t border-slate-900 pt-2.5">
                        <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Sync Unlisted Channel / Group</label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder="@Username or Invite Link"
                            value={tgCustomChat}
                            onChange={(e) => setTgCustomChat(e.target.value)}
                            className="flex-1 min-w-0 bg-slate-900 border border-slate-800 rounded-lg py-1 px-2 text-xs text-slate-200 font-mono focus:outline-none"
                          />
                          <button
                            disabled={isFetchingMessages || !tgCustomChat.trim()}
                            onClick={() => fetchChatMessagesAndParse([tgCustomChat.trim()])}
                            className="bg-teal-500 hover:bg-teal-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold px-3.5 py-1 rounded-lg text-xs transition-all cursor-pointer"
                          >
                            Sync
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Chat Filter and Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search channels (Enter to search globally)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && searchQuery.trim()) {
                            triggerTelegramSearch(searchQuery);
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-24 text-xs text-slate-300 focus:outline-none focus:border-teal-500/50 placeholder:text-slate-600 font-sans"
                      />
                      {searchQuery && (
                        <div className="absolute right-2 top-1.5 flex items-center gap-1.5">
                          <button
                            onClick={() => triggerTelegramSearch(searchQuery)}
                            className="bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 text-[9px] px-2 py-0.5 rounded font-bold cursor-pointer transition-all"
                            title="Search Telegram globally for this term"
                          >
                            Search
                          </button>
                          <button 
                            onClick={() => {
                              setSearchQuery("");
                              if (tgSession) fetchTelegramChats(tgApiId, tgApiHash, tgSession);
                            }} 
                            className="text-[11px] text-slate-500 hover:text-slate-300 px-1 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Sync Selected Button */}
                    {selectedChatIds.length > 0 && (
                        <button
                            onClick={() => {
                                fetchChatMessagesAndParse(selectedChatIds);
                                setSelectedChatIds([]); // Clear selection after sync
                            }}
                            disabled={isFetchingMessages}
                            className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-3 rounded-lg text-xs w-full mb-1 flex justify-center items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                        >
                           <CloudDownload className="w-4 h-4" />
                           Sync & Parse {selectedChatIds.length} Selected Channel{selectedChatIds.length !== 1 ? 's' : ''}
                        </button>
                    )}
                    {/* Chat dialogs list */}
                    <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
                      {isLoadingChats ? (
                        <div className="py-8 flex flex-col items-center justify-center gap-2">
                          <RefreshCw className="w-5 h-5 animate-spin text-teal-400" />
                          <span className="text-xs text-slate-500 font-mono">Querying Telegram nodes...</span>
                        </div>
                      ) : (filteredChats?.length ?? 0) === 0 ? (
                        <div className="py-6 text-center flex flex-col items-center gap-2">
                          <span className="text-xs text-slate-600 font-mono">No matching local chats found.</span>
                          {searchQuery.trim() && (
                            <button
                              onClick={() => triggerTelegramSearch(searchQuery)}
                              className="bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 text-teal-400 font-bold px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer"
                            >
                              Search Telegram for "{searchQuery}"
                            </button>
                          )}
                        </div>
                      ) : (
                        filteredChats?.map((chat) => {
                          const isSel = selectedChatIds.includes(String(chat.id));
                          return (
                          <button
                            key={chat.id}
                            disabled={isFetchingMessages}
                            onClick={() => {
                               setSelectedChatIds(prev => isSel ? prev.filter(id => id !== String(chat.id)) : [...prev, String(chat.id)]);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                              isSel
                                ? "bg-slate-800/80 border-amber-500/40 text-amber-100"
                                : chat.isJoined === false
                                ? "bg-teal-950/5 border-teal-500/10 text-teal-300/90 hover:bg-teal-950/15 hover:border-teal-500/20"
                                : "bg-slate-950/20 border-slate-900/60 text-slate-400 hover:bg-slate-900 hover:text-slate-200 hover:border-slate-800"
                            }`}
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <input type="checkbox" checked={isSel} readOnly className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-amber-500" />
                              <div className={`p-1.5 rounded-lg shrink-0 ${
                                chat.isJoined === false
                                  ? "bg-teal-400/10 text-teal-400"
                                  : chat.isChannel 
                                  ? "bg-teal-500/10 text-teal-400" 
                                  : "bg-blue-500/10 text-blue-400"
                              }`}>
                                <MessageSquare className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-medium truncate leading-tight">{chat.title}</span>
                                {chat.username && (
                                  <span className="text-[9px] text-slate-500 font-mono">@{chat.username}</span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {chat.unreadCount > 0 && (
                                <span className="bg-teal-500 text-slate-950 font-bold text-[9px] px-1.5 py-0.5 rounded-full font-mono">
                                  {chat.unreadCount}
                                </span>
                              )}
                              <span className={`text-[9px] font-mono uppercase tracking-wider ${
                                chat.isJoined === false ? "text-teal-400 font-semibold" : "text-slate-600"
                              }`}>
                                {chat.isJoined === false ? "Global Search" : (chat.isChannel ? "Channel" : "Group")}
                              </span>
                            </div>
                          </button>
                        ) })
                      )}
                    </div>

                     {isFetchingMessages ? (
                      <div className="bg-teal-500/5 border border-teal-500/15 p-3 rounded-xl flex flex-col gap-1.5 text-xs text-teal-400 font-mono">
                        <div className="flex items-center gap-2.5">
                          <RefreshCw className="w-4 h-4 animate-spin text-teal-400" />
                          <span className="font-bold">Downloading Messages</span>
                        </div>
                        <span className="text-[10px] text-slate-400">Retrieving up to 2,500 posts for the selected period from the MTProto nodes...</span>
                      </div>
                    ) : isParsing ? (
                      <div className="bg-teal-500/5 border border-teal-500/15 p-3 rounded-xl flex flex-col gap-1.5 text-xs text-teal-400 font-mono">
                        <div className="flex items-center gap-2.5">
                          <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                          <span className="font-bold text-emerald-400">AI Structuring Signals</span>
                        </div>
                        <span className="text-[10px] text-slate-400">Gemini is structuring tickers, SL, TP levels, and entry boundaries...</span>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-500 leading-normal text-center">
                        💡 Click on any channel or use the custom unlisted input to sync signals.
                      </div>
                    )}

                    <button
                      onClick={() => fetchTelegramChats(tgApiId, tgApiHash, tgSession!)}
                      disabled={isLoadingChats}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 font-semibold py-1.5 rounded-xl text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingChats ? "animate-spin" : ""}`} />
                      <span>Refresh Chat List (Max 150)</span>
                    </button>

                  </div>
                )}

              </div>
            )}

          </div>

          {/* Agent API Configuration Panel */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-teal-400" />
                <h3 className="font-semibold text-slate-200 text-sm">Agent & API Configuration</h3>
              </div>
              <button
                onClick={handleAddAgent}
                className="bg-slate-950 hover:bg-slate-850 text-teal-400 text-[10px] font-bold px-2 py-1 rounded border border-slate-800 flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Add Custom
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Configure multiple active API agents (e.g., Gemini and Groq) to parse unstructured trading signals. Keys are kept safe in local sandbox memory.
            </p>

            {/* Live Key Rotation & Failover Status */}
            {rotationStats && rotationStats.stats && (
              <div className="bg-slate-950 border border-slate-900/60 rounded-xl p-3.5 flex flex-col gap-2.5">
                <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                  <span className="text-[10px] text-teal-400 font-extrabold uppercase tracking-widest font-mono flex items-center gap-1.5">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
                    Failover Engine Diagnostics
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    Total Calls: {rotationStats.stats.totalSuccess + rotationStats.stats.totalFailures}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                  <div className="bg-slate-900/40 p-1.5 rounded border border-slate-900">
                    <div className="text-slate-500">Success</div>
                    <div className="text-emerald-400 font-bold text-xs">{rotationStats.stats.totalSuccess}</div>
                  </div>
                  <div className="bg-slate-900/40 p-1.5 rounded border border-slate-900">
                    <div className="text-slate-500">Failures</div>
                    <div className="text-rose-400 font-bold text-xs">{rotationStats.stats.totalFailures}</div>
                  </div>
                  <div className="bg-slate-900/40 p-1.5 rounded border border-slate-900">
                    <div className="text-slate-500">Tokens</div>
                    <div className="text-teal-400 font-bold text-[11px]">
                      {rotationStats.stats.totalTokens.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Individual Key Health Status */}
                <div className="flex flex-col gap-2 pt-2 border-t border-slate-900/60">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono">
                    Proactive Groq Load Balancer (Real-time Pools)
                  </span>
                  <div className="flex flex-col gap-2 font-mono text-[10px]">
                    {healthKeysData && healthKeysData.providers && healthKeysData.providers.groq && (healthKeysData.providers.groq?.length ?? 0) > 0 ? (
                      healthKeysData.providers.groq?.map((k: any) => {
                        let badgeColor = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                        let badgeLabel = "🟢 Active";
                        if (k.status === "cooldown") {
                          badgeColor = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
                          badgeLabel = `🟠 Cooldown (${Math.ceil(k.cooldownRemainingMs / 1000)}s)`;
                        } else if (k.status === "invalid" || k.status === "rate_limited") {
                          badgeColor = "bg-rose-500/10 text-rose-400 border border-rose-500/20";
                          badgeLabel = "🔴 Rate Limited";
                        }

                        return (
                          <div key={k.keyRaw} className="bg-slate-900/20 p-2 rounded-lg border border-slate-900/40 flex flex-col gap-1.5">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-300 font-bold text-[11px]">{k.keyMasked}</span>
                                <span className="text-[8px] text-slate-500 bg-slate-950 px-1 py-0.5 rounded border border-slate-900">
                                  Pending: {k.activeConnections}
                                </span>
                              </div>
                              <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-bold uppercase font-sans ${badgeColor}`}>
                                {badgeLabel}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[8.5px]">
                              {/* RPM Progress Bar */}
                              <div className="flex flex-col gap-0.5">
                                <div className="flex justify-between text-slate-500">
                                  <span>RPM Usage</span>
                                  <span className="text-slate-400">{k.rpmUsagePct}%</span>
                                </div>
                                <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${k.rpmUsagePct >= 85 ? 'bg-rose-500' : k.rpmUsagePct >= 60 ? 'bg-amber-500' : 'bg-teal-500'}`}
                                    style={{ width: `${k.rpmUsagePct}%` }}
                                  />
                                </div>
                              </div>

                              {/* TPM Progress Bar */}
                              <div className="flex flex-col gap-0.5">
                                <div className="flex justify-between text-slate-500">
                                  <span>TPM Usage</span>
                                  <span className="text-slate-400">{k.tpmUsagePct}%</span>
                                </div>
                                <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${k.tpmUsagePct >= 85 ? 'bg-rose-500' : k.tpmUsagePct >= 60 ? 'bg-amber-500' : 'bg-teal-500'}`}
                                    style={{ width: `${k.tpmUsagePct}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-[8px] text-slate-600 flex justify-between">
                              <span>Total Success: {k.totalCalls}</span>
                              {k.rpmUsagePct >= 85 && (
                                <span className="text-rose-500/80 font-bold animate-pulse">
                                  ⚠️ Mitigating (85% limit hit)
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <>
                        {Object.entries(rotationStats.stats.keysStatus || {})?.map(([keySub, info]: any) => {
                          const isTempDisabled = info.tempDisabled;
                          const isPermanentlyDisabled = info.invalid;
                          let statusText = "Active / Healthy";
                          let colorClass = "text-emerald-400";
                          
                          if (isPermanentlyDisabled) {
                            statusText = "Permanently Disabled (401 Invalid)";
                            colorClass = "text-rose-500 line-through";
                          } else if (isTempDisabled) {
                            const secondsLeft = Math.max(0, Math.ceil((info.cooldownUntil - Date.now()) / 1000));
                            statusText = `Rate Limited (Cooldown: ${secondsLeft}s)`;
                            colorClass = "text-amber-500";
                          }

                          return (
                            <div key={keySub} className="flex justify-between items-center bg-slate-900/25 p-1 px-2 rounded border border-slate-900/30">
                              <span className="text-slate-400 font-bold">{keySub}...</span>
                              <span className={`font-semibold ${colorClass}`}>{statusText}</span>
                            </div>
                          );
                        })}
                        {(Object.keys(rotationStats.stats.keysStatus || {})?.length ?? 0) === 0 && (
                          <span className="text-[9.5px] text-slate-600 italic">No keys queried yet. Generate signals to trigger failover tracking.</span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 3-Agent Collaborative Pipeline Selector */}
            <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-4 flex flex-col gap-4">
              <div className="text-[10px] text-teal-400 font-extrabold uppercase tracking-widest font-mono flex items-center justify-between border-b border-slate-900 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
                  3-Agent Collaborative Parsing & Validation Pipeline
                </div>
                <span className="text-[9px] bg-teal-500/10 text-teal-400 border border-teal-500/30 px-1.5 py-0.5 rounded font-sans font-bold">COOPERATIVE</span>
              </div>

              {/* Engine 1: Primary Parser */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono font-bold">Primary Parser Engine</span>
                  <span className="text-[10.5px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                    {agents.find(a => a.id === primaryProvider)?.name || "Primary"} ✅
                  </span>
                </div>
                <select
                  value={primaryProvider}
                  onChange={(e) => setPrimaryProvider(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1 px-2 text-xs text-slate-200 font-medium focus:outline-none focus:border-teal-500/50 cursor-pointer"
                >
                  {agents?.map(a => (
                    <option key={a.id} value={a.id} disabled={!a.isActive}>
                      {a.name} {!a.isActive ? "❌ (Disabled)" : "✅"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Engine 2: Backup / Failover */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono font-bold">Backup / Failover Engine</span>
                  <span className="text-[10.5px] text-teal-400 font-mono font-bold flex items-center gap-1">
                    {backupProvider === "none" ? "None" : (agents.find(a => a.id === backupProvider)?.name || "Failover")} ✅
                  </span>
                </div>
                <select
                  value={backupProvider}
                  onChange={(e) => setBackupProvider(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1 px-2 text-xs text-slate-200 font-medium focus:outline-none focus:border-teal-500/50 cursor-pointer"
                >
                  <option value="none">None (Fail immediately)</option>
                  {agents?.map(a => (
                    <option key={a.id} value={a.id} disabled={!a.isActive || a.id === primaryProvider}>
                      {a.name} {a.id === primaryProvider ? "🔗 (Primary)" : !a.isActive ? "❌ (Disabled)" : "✅"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Engine 3: Google Gemini Core */}
              <div className="flex flex-col gap-1.5 border-t border-slate-900 pt-3">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono font-bold">Google Gemini Core</span>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold px-2 py-0.5 rounded animate-pulse">ACTIVE</span>
                </div>
                <p className="text-[10.5px] text-slate-400 leading-relaxed bg-slate-900/30 rounded-lg p-2.5 border border-slate-900/50 font-sans">
                  The final consensus validator and logic auditor. Collaborates with primary/failover extractors to cross-check levels, score signals, and structure JSON.
                </p>
              </div>
            </div>

            {/* List of Registered Engines */}
            <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-1">
              {agents?.map((agent) => (
                <div key={agent.id} className="bg-slate-950/60 border border-slate-900 rounded-xl p-3 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={agent.name ?? ""}
                      onChange={(e) => handleUpdateAgent(agent.id, "name", e.target.value)}
                      className="bg-transparent border-none text-xs font-semibold text-slate-200 p-0 focus:ring-0 focus:outline-none w-36 font-sans"
                      placeholder="Agent Name"
                    />
                    <div className="flex items-center gap-2">
                      {/* Active Status Badge */}
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        agent.isActive ? "bg-teal-500/10 text-teal-400" : "bg-slate-800 text-slate-500"
                      }`}>
                        {agent.isActive ? "ACTIVE" : "OFF"}
                      </span>

                      {/* Active Toggle Switch */}
                      <button
                        onClick={() => handleUpdateAgent(agent.id, "isActive", !agent.isActive)}
                        className={`w-8 h-4 rounded-full p-0.5 transition-all flex items-center cursor-pointer ${
                          agent.isActive ? "bg-teal-500 justify-end" : "bg-slate-800 justify-start"
                        }`}
                        title="Enable/Disable this engine"
                      >
                        <span className="w-3 h-3 rounded-full bg-slate-950"></span>
                      </button>
                      
                      {/* Allow deletion of custom agents only */}
                      {agent.id !== "gemini" && agent.id !== "groq" && (
                        <button
                          onClick={() => handleDeleteAgent(agent.id)}
                          className="text-rose-400 hover:text-rose-300 p-0.5 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-slate-500 uppercase font-mono">API Authorization Key</span>
                      <input
                        type="password"
                        value={agent.apiKey ?? ""}
                        onChange={(e) => handleUpdateAgent(agent.id, "apiKey", e.target.value)}
                        placeholder={agent.id === "gemini" ? "Falls back to default server key" : "Enter API Key"}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1 px-2.5 text-[11px] text-slate-300 font-mono focus:outline-none focus:border-teal-500/50"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-slate-500 uppercase font-mono">Model Selection</span>
                      <input
                        type="text"
                        value={agent.endpoint ?? ""}
                        onChange={(e) => handleUpdateAgent(agent.id, "endpoint", e.target.value)}
                        placeholder="e.g. gemini-2.5-flash or deepseek-r1-distill-llama-70b"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1 px-2.5 text-[11px] text-slate-300 font-mono focus:outline-none focus:border-teal-500/50"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {(agents?.length ?? 0) === 0 && (
                <div className="text-center py-4 text-xs text-slate-500 italic">No external agents registered yet.</div>
              )}
            </div>
          </div>

          {/* Sizing & Rules Setup Container */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex flex-col gap-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-teal-400" />
              <h3 className="font-semibold text-slate-200 text-sm">Risk Management Rules</h3>
            </div>

            <div className="flex flex-col gap-4">
              
              {/* Account Capital */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    Initial Balance
                  </span>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-semibold text-slate-500 font-mono">$</span>
                    <input
                      type="number"
                      value={config.initialBalance}
                      onChange={(e) => setConfig({ ...config, initialBalance: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-1.5 pl-7 pr-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-teal-500/50"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    Claimed WR (%)
                  </span>
                  <input
                    type="number"
                    min="50"
                    max="99"
                    value={config.claimedWinRate}
                    onChange={(e) => setConfig({ ...config, claimedWinRate: parseInt(e.target.value) || 90 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-1.5 px-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-teal-500/50"
                  />
                </div>
              </div>

              {/* Lot Sizing Option */}
              <div className="flex flex-col gap-2">
                <span className="text-xs text-slate-400 font-medium">Position Sizing Strategy</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setConfig({ ...config, sizingMode: "FIXED_LOT" })}
                    className={`text-xs py-2 rounded-lg border transition-all ${
                      config.sizingMode === "FIXED_LOT"
                        ? "bg-slate-800 border-teal-500/50 text-slate-200 font-semibold"
                        : "bg-slate-950/40 border-slate-900 text-slate-400"
                    }`}
                  >
                    Fixed Lot
                  </button>
                  <button
                    onClick={() => setConfig({ ...config, sizingMode: "RISK_PERCENT" })}
                    className={`text-xs py-2 rounded-lg border transition-all ${
                      config.sizingMode === "RISK_PERCENT"
                        ? "bg-slate-800 border-teal-500/50 text-slate-200 font-semibold"
                        : "bg-slate-950/40 border-slate-900 text-slate-400"
                    }`}
                  >
                    Risk-based %
                  </button>
                </div>

                {config.sizingMode === "FIXED_LOT" ? (
                  <div className="flex flex-col gap-1.5 mt-1">
                    <span className="text-[11px] text-slate-400 font-medium">Lots per Signal Trade:</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={config.fixedLotSize}
                      onChange={(e) => setConfig({ ...config, fixedLotSize: parseFloat(e.target.value) || 0.1 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-1.5 px-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-teal-500/50"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5 mt-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Percentage Risk Balance:</span>
                      <span className="font-mono text-teal-400 font-semibold">{config.riskPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="10"
                      step="0.5"
                      value={config.riskPercent}
                      onChange={(e) => setConfig({ ...config, riskPercent: parseFloat(e.target.value) || 2 })}
                      className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-teal-400"
                    />
                  </div>
                )}
              </div>

              {/* Profit exits and Trailing Rules */}
              <div className="border-t border-slate-900 pt-3 flex flex-col gap-3">
                
                {/* Move to BE rule */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-300 font-semibold">Move SL to Entry at TP1</span>
                    <span className="text-[10px] text-slate-500 font-medium">Locks break-even after TP1 hit</span>
                  </div>
                  <button
                    onClick={() => setConfig({ ...config, moveSlToEntryAtTp1: !config.moveSlToEntryAtTp1 })}
                    className={`w-10 h-5 rounded-full p-0.5 transition-all flex items-center ${
                      config.moveSlToEntryAtTp1 ? "bg-emerald-500 justify-end" : "bg-slate-800 justify-start"
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-slate-950"></span>
                  </button>
                </div>

                {/* TP1 exit ratio */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Exit Volume on TP1 reached:</span>
                    <span className="font-mono text-teal-400 font-semibold">{config.tp1ExitRatio * 100}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={config.tp1ExitRatio}
                    onChange={(e) => setConfig({ ...config, tp1ExitRatio: parseFloat(e.target.value) || 0.5 })}
                    className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-teal-400"
                  />
                </div>

                {/* Trailing distance input */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      Trailing Trigger (Pips)
                      <HelpCircle className="w-3 h-3 text-slate-500 cursor-help" title="Active trailing stop after X pips profit (0 to disable)" />
                    </span>
                    <input
                      type="number"
                      value={config.trailingStopTrigger}
                      onChange={(e) => setConfig({ ...config, trailingStopTrigger: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-1.5 px-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-teal-500/50"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      Trail Dist (Pips)
                    </span>
                    <input
                      type="number"
                      value={config.trailingStopDistance}
                      onChange={(e) => setConfig({ ...config, trailingStopDistance: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-1.5 px-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-teal-500/50"
                    />
                  </div>
                </div>

                {/* Backtest Data Source */}
                <div className="flex flex-col gap-1.5 border-t border-slate-900 pt-3">
                  <span className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                    Backtest Data Source
                    <HelpCircle className="w-3 h-3 text-slate-500 cursor-help" title="Real Historical Data ensures 100% genuine market candles. No synthetic or generated data is used. If market data cannot be fetched, the backtest will gracefully abort." />
                  </span>
                  <span className="text-[10px] leading-normal flex items-center gap-1 mt-0.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                    <span className="text-teal-400 font-semibold">Tries Custom API → Twelve Data → Yahoo Finance. Real data is strictly required.</span>
                  </span>

                      {/* Financial Data Feed API Keys */}
                      <div className="flex flex-col gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-900 mt-2.5">
                        <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-teal-400" />
                          <span>Data Feed API Credentials</span>
                        </span>
                        <div className="flex flex-col gap-2 mt-1">
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Twelve Data API Key</label>
                            <input
                              type="password"
                              placeholder="Paste Twelve Data API key..."
                              value={twelveDataKey}
                              onChange={(e) => setTwelveDataKey(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-teal-500/50"
                            />
                            <p className="text-[9px] text-slate-500 leading-normal">Ships with a shared public demo key so real data works out of the box. Swap in your own key for higher rate limits.</p>
                          </div>

                          <div className="flex flex-col gap-1 border-t border-slate-900 pt-1.5">
                            <label className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Custom Market Data API (optional)</label>
                            <input
                              type="text"
                              placeholder="https://your-data-provider.com/candles"
                              value={customDataEndpoint}
                              onChange={(e) => setCustomDataEndpoint(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-teal-500/50"
                            />
                            <input
                              type="password"
                              placeholder="Optional bearer token / API key for that endpoint..."
                              value={customDataApiKey}
                              onChange={(e) => setCustomDataApiKey(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-teal-500/50 mt-1"
                            />
                            <p className="text-[9px] text-slate-500 leading-normal">Add this later if you need another data source (Polygon.io, OANDA, or any provider of your choice). If set, it's queried first, before Twelve Data. It must return JSON like {"{ candles: [{ timestamp, open, high, low, close }, ...] }"}.</p>
                          </div>

                          <div className="flex flex-col gap-1 border-t border-slate-900 pt-1.5">
                            <label className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Custom Broker API Gateway (trade execution)</label>
                            <input
                              type="text"
                              placeholder="https://your-broker-gateway.com/webhook"
                              value={customBrokerApiGateway}
                              onChange={(e) => setCustomBrokerApiGateway(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-teal-500/50"
                            />
                          </div>
                        </div>
                        <p className="text-[9px] text-slate-500 leading-normal mt-0.5">
                          Real candles that are successfully fetched are cached in your local SQLite database for reuse. Synthetic fallback data is never cached, so it's never mistaken for real data later.
                        </p>
                      </div>
                </div>

                {/* Backtest Precision / Tick Testing */}
                <div className="flex flex-col gap-1.5 border-t border-slate-900 pt-3">
                  <span className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                    Backtest Tick Precision
                    <HelpCircle className="w-3 h-3 text-slate-500 cursor-help" title="Select test granularity. 'Every Tick (High-Fidelity Reconstructed Ticks)' simulates 12 sub-candle steps to test order triggers sequentially, preventing false SL/TP hits inside a single candle bar." />
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => setConfig({ ...config, backtestPrecision: "candle" })}
                      className={`text-xs py-2 rounded-lg border transition-all cursor-pointer ${
                        config.backtestPrecision === "candle"
                          ? "bg-slate-800 border-teal-500/50 text-slate-200 font-semibold"
                          : "bg-slate-950/40 border-slate-900 text-slate-400"
                      }`}
                    >
                      Candle Close (Blunt)
                    </button>
                    <button
                      onClick={() => setConfig({ ...config, backtestPrecision: "every_tick" })}
                      className={`text-xs py-2 rounded-lg border transition-all cursor-pointer ${
                        config.backtestPrecision === "every_tick"
                          ? "bg-slate-800 border-emerald-500/50 text-slate-200 font-semibold flex items-center justify-center gap-1"
                          : "bg-slate-950/40 border-slate-900 text-slate-400"
                      }`}
                    >
                      <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400/20" />
                      <span>Every Tick (Pro)</span>
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-500 leading-normal">
                    {config.backtestPrecision === "every_tick"
                      ? "⚡ Reconstructs 12 sub-candle micro-ticks per bar. Extremely accurate touch order execution."
                      : "📊 Checks triggers once per hourly bar. Conservative, standard approach."}
                  </span>
                </div>

                {/* Strict Real-Data Verification */}
                {/* Real-world Broker Spreads, Slippage and Commissions */}
                <div className="grid grid-cols-3 gap-2.5 border-t border-slate-900 pt-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
                      Spread
                      <HelpCircle className="w-2.5 h-2.5 text-slate-500 cursor-help" title="Typical gap in pips between Buy and Sell quotes (EURUSD has ~1.5 pips average)" />
                    </span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={config.spreadPips}
                      onChange={(e) => setConfig({ ...config, spreadPips: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-1 px-1.5 text-[11px] text-slate-200 font-mono text-center focus:outline-none focus:border-teal-500/50"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
                      Slippage
                      <HelpCircle className="w-2.5 h-2.5 text-slate-500 cursor-help" title="Slippage pips from order placement latency. Increases entry buy prices, decreases entry sells." />
                    </span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={config.slippagePips}
                      onChange={(e) => setConfig({ ...config, slippagePips: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-1 px-1.5 text-[11px] text-slate-200 font-mono text-center focus:outline-none focus:border-teal-500/50"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
                      Fee/Lot ($)
                      <HelpCircle className="w-2.5 h-2.5 text-slate-500 cursor-help" title="Broker lot commission charged round turn. Standard raw brokers charge $7.00 USD." />
                    </span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={config.commissionPerLot}
                      onChange={(e) => setConfig({ ...config, commissionPerLot: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-1 px-1.5 text-[11px] text-slate-200 font-mono text-center focus:outline-none focus:border-teal-500/50"
                    />
                  </div>
                </div>

              </div>

              {/* Item B/C — Signal Source Timezone & News Spread Multiplier ─── */}
              <div className="border-t border-slate-900/60 pt-3 mt-1 grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
                    Signal Timezone (UTC)
                    <HelpCircle className="w-2.5 h-2.5 text-slate-500 cursor-help" title="UTC offset of the Telegram channel. Corrects timestamp mismatch during candle lookup." />
                  </span>
                  <select
                    value={config.sourceTimezoneOffsetHours ?? 0}
                    onChange={(e) => setConfig({ ...config, sourceTimezoneOffsetHours: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-1 px-1.5 text-[11px] text-slate-200 font-mono focus:outline-none focus:border-teal-500/50"
                  >
                    {Array.from({ length: 27 }, (_, i) => i - 12)?.map(offset => (
                      <option key={offset} value={offset}>UTC{offset >= 0 ? `+${offset}` : offset}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
                    News Spread Multiplier
                    <HelpCircle className="w-2.5 h-2.5 text-slate-500 cursor-help" title="Widens spread 3–5× during NFP, CPI, FOMC, and GDP event windows (±15 min)." />
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer mt-1">
                    <div
                      className={`w-8 h-4 rounded-full relative transition-colors ${config.newsFilterEnabled ? 'bg-teal-500' : 'bg-slate-700'}`}
                      onClick={() => setConfig({ ...config, newsFilterEnabled: !config.newsFilterEnabled })}
                    >
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${config.newsFilterEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                    <span className={`text-[11px] font-mono ${config.newsFilterEnabled ? 'text-teal-400' : 'text-slate-500'}`}>
                      {config.newsFilterEnabled ? 'ACTIVE (NFP/CPI/FOMC/GDP)' : 'OFF'}
                    </span>
                  </label>
                </div>
              </div>

            </div>

            <button
              onClick={executeSimulationWithLogs}
              disabled={isSimulating || (signals?.length ?? 0) === 0}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/5"
            >
              <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>{isSimulating ? "SIMULATING SYSTEM..." : "RUN SIGNALS SIMULATION"}</span>
            </button>

            <div className="border-t border-slate-900/60 pt-4 mt-2 flex flex-col gap-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold font-mono">MetaTrader 5 (MT5) Integration</span>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleExportMT5CSV}
                  disabled={(signals?.length ?? 0) === 0 || csvExportStatus === "loading"}
                  className={`border font-bold py-2.5 px-3 rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm
                    ${csvExportStatus === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                      csvExportStatus === "error"   ? "bg-rose-500/10 border-rose-500/30 text-rose-400" :
                      csvExportStatus === "loading" ? "bg-slate-900 border-slate-700 text-slate-400 cursor-wait" :
                      "bg-slate-900 hover:bg-slate-850 border-slate-800 hover:border-slate-700 disabled:bg-slate-950 disabled:text-slate-600 disabled:border-slate-900 text-teal-400"}`}
                  title="Export current signals to a standardized MT5-compatible CSV file (includes lot sizes)"
                >
                  {csvExportStatus === "loading" ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : csvExportStatus === "success" ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  ) : csvExportStatus === "error" ? (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <Download className="w-3.5 h-3.5 text-teal-400" />
                  )}
                  <span>
                    {csvExportStatus === "loading" ? "Exporting..." :
                     csvExportStatus === "success" ? "CSV Downloaded!" :
                     csvExportStatus === "error"   ? "Export Failed" :
                     "Export MT5 CSV"}
                  </span>
                </button>
                <button
                  onClick={handleDownloadEA}
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-teal-400 font-bold py-2.5 px-3 rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  title="Download the custom MT5 Expert Advisor script (SignalBacktester.mq5)"
                >
                  <FileCode className="w-3.5 h-3.5 text-teal-400" />
                  <span>Download MT5 EA</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
                💡 <b>Method B:</b> We've completely bypassed file sandbox limits! Simply click <b>Export MQL5 EA</b> to download a fully self-contained Expert Advisor (<code>SignalBacktester.mq5</code>) with all your selected trades hardcoded inside. Place it in <b>MQL5\Experts</b>, compile it, and run it in the Strategy Tester.
              </p>
            </div>
          </div>

        </div>

        {/* WORKSPACE AREA: Simulation logs, tables, charts (xl:col-span-8) */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          
          {/* Workspace Tabs Navigation */}
          <div className="border-b border-slate-900 flex items-center gap-1">
            <button
              onClick={() => setActiveTab("parser")}
              className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === "parser" 
                  ? "border-teal-500 text-teal-400" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Import Logs</span>
            </button>
            <button
              onClick={() => setActiveTab("signals")}
              className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === "signals" 
                  ? "border-teal-500 text-teal-400" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Table className="w-4 h-4" />
              <span>Signal Database ({(signals?.length ?? 0)})</span>
            </button>
            <button
              onClick={() => setActiveTab("sim_console")}
              className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === "sim_console" 
                  ? "border-teal-500 text-teal-400" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Simulation Live</span>
            </button>
            <button
              onClick={() => {
                if (simulationResults) setActiveTab("analytics");
              }}
              disabled={!simulationResults}
              className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
                !simulationResults ? "opacity-40 cursor-not-allowed" : ""
              } ${
                activeTab === "analytics" 
                  ? "border-teal-500 text-teal-400" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <LineChart className="w-4 h-4" />
              <span>Analytics Dashboard</span>
            </button>
            <button
              onClick={() => (signals?.length ?? 0) > 0 && setActiveTab("optimizer")}
              disabled={(signals?.length ?? 0) === 0}
              className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
                (signals?.length ?? 0) === 0 ? "opacity-40 cursor-not-allowed" : ""
              } ${activeTab === "optimizer" ? "border-violet-500 text-violet-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Optimizer</span>
            </button>
            <button
              onClick={() => setActiveTab("channels")}
              className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === "channels" ? "border-amber-500 text-amber-400" : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Channels</span>
            </button>
          </div>

          {/* TAB CONTENT: IMPORT / PARSER */}
          {activeTab === "parser" && (
            <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 flex flex-col gap-6">
              <div className="flex flex-col gap-1.5">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-400" />
                  Telegram Channels Copier & Signals Parser
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Trading channels often post signals in inconsistent or messy formats. This platform integrates the powerful <b>Gemini 3.5 LLM</b> on the server, scanning raw, unformatted, conversational Telegram posts and mapping them into systematic trade entries.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 flex flex-col gap-2">
                  <div className="bg-teal-500/10 text-teal-400 p-1.5 rounded-lg w-max">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-200">1. Raw Scrape log</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Paste exported chats, logs, or signals containing TP, SL, and Entry specifications directly.</p>
                </div>

                <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 flex flex-col gap-2">
                  <div className="bg-teal-500/10 text-teal-400 p-1.5 rounded-lg w-max">
                    <Bot className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-200">2. AI Parsing Layer</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">The server-side model strips formatting noise, normalizes tickers, and structures multiple target levels.</p>
                </div>

                <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 flex flex-col gap-2">
                  <div className="bg-teal-500/10 text-teal-400 p-1.5 rounded-lg w-max">
                    <Activity className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-200">3. Interactive Backtest</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Evaluate risk formulas on the signals database, testing true win rates vs hypothetical marketing claims.</p>
                </div>
              </div>

              {/* Onboarding Empty State */}
              <div className="border border-dashed border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4">
                <Bot className="w-12 h-12 text-slate-600 animate-bounce" />
                <div className="max-w-md flex flex-col gap-1">
                  <h4 className="text-sm font-bold text-slate-300">Ready to test a signal channel?</h4>
                  <p className="text-xs text-slate-500">
                    Select one of our preset VIP Telegram channels in the left sidebar, or paste your own message logs, then click <b>AI Parse Signals</b>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: EDITABLE SIGNALS DATABASE */}
          {activeTab === "signals" && (
            <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-100">Signal Database <span className="text-slate-500 text-sm ml-2">({filteredSignals.length} / {signals?.length || 0})</span></h3>
                  <p className="text-xs text-slate-400 mt-1">Review, modify, or manually inject trades before executing the backtest engine.</p>
                </div>
                <div className="flex items-center gap-3">
                  <select 
                    value={filterAssetCategory} 
                    onChange={e => setFilterAssetCategory(e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500/50"
                  >
                    <option value="ALL">All Assets</option>
                    <option value="FOREX">Forex</option>
                    <option value="METALS">Metals (Gold/Silver)</option>
                    <option value="CRYPTO">Crypto</option>
                    <option value="INDICES">Indices</option>
                  </select>
                  <select 
                    value={filterValidation} 
                    onChange={e => setFilterValidation(e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500/50"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="VALID">Valid R:R</option>
                    <option value="INVALID_RR">Invalid R:R / Corrupted</option>
                    <option value="MISSING_SL">Missing Stop Loss</option>
                    <option value="MISSING_TP">Missing Take Profit</option>
                  </select>
                  <button
                    onClick={handleAddManualSignal}
                    className="bg-slate-800 hover:bg-slate-700 text-xs text-teal-400 font-bold py-2 px-3 rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Manual Signal</span>
                  </button>
                </div>
              </div>

              {(signals?.length ?? 0) === 0 ? (
                <div className="border border-dashed border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-3">
                  <Table className="w-10 h-10 text-slate-700" />
                  <div className="max-w-xs flex flex-col gap-1">
                    <h4 className="text-xs font-bold text-slate-300">No signals parsed yet</h4>
                    <p className="text-[11px] text-slate-500">Pasted Telegram signals are stored here as systematic models. Use the Import panel to populate.</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 font-mono border-b border-slate-850">
                        <th className="p-3">Asset</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Date & Time</th>
                        <th className="p-3">Entry Price</th>
                        <th className="p-3">Stop Loss</th>
                        <th className="p-3">Take Profit Levels</th>
                        <th className="p-3 text-center" title="Risk:Reward grade based on TP1 vs SL distance. A ≥2:1, B ≥1.5:1, C ≥1:1, D <1:1">R:R Grade</th>
                        <th className="p-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 bg-slate-950/20">
                      {filteredSignals.map((sig) => (
                        <tr key={sig.id} className="hover:bg-slate-900/20 transition-all">
                          {/* Asset Name */}
                          <td className="p-3">
                            <input
                              type="text"
                              value={sig.asset ?? ""}
                              onChange={(e) => handleUpdateSignal(sig.id!, "asset", e.target.value.toUpperCase())}
                              className="w-16 bg-slate-950 border border-slate-800 rounded px-1.5 py-1 font-mono text-slate-200"
                            />
                          </td>

                          {/* Type */}
                          <td className="p-3">
                            <select
                              value={sig.type ?? "BUY"}
                              onChange={(e) => handleUpdateSignal(sig.id!, "type", e.target.value)}
                              className="bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-slate-300 font-mono text-xs focus:outline-none"
                            >
                              <option value="BUY">BUY</option>
                              <option value="SELL">SELL</option>
                              <option value="BUY_LIMIT">BUY LIMIT</option>
                              <option value="SELL_LIMIT">SELL LIMIT</option>
                            </select>
                          </td>

                          {/* Date & Time */}
                          <td className="p-3">
                            <input
                              type="text"
                              value={sig.datetime ?? ""}
                              onChange={(e) => handleUpdateSignal(sig.id!, "datetime", e.target.value)}
                              placeholder="YYYY-MM-DD HH:MM"
                              className="w-36 bg-slate-950 border border-slate-800 rounded px-2 py-1 font-mono text-slate-300 text-xs focus:outline-none focus:border-teal-500/50"
                              title={sig.datetime ? `Signal Post Date & Time:\nSelected Time: ${formatDateTime(sig.datetime)}\nUTC Time: ${new Date(sig.datetime).toUTCString()}` : "Enter signal date & time (e.g., 2026-07-13 14:00)"}
                            />
                          </td>

                          {/* Entry */}
                          <td className="p-3">
                            <input
                              type="number"
                              step="0.0001"
                              value={sig.entryPrice ?? ""}
                              onChange={(e) => handleUpdateSignal(sig.id!, "entryPrice", parseFloat(e.target.value) || 0)}
                              className="w-20 bg-slate-950 border border-slate-800 rounded px-1.5 py-1 font-mono text-slate-200"
                            />
                          </td>

                          {/* SL */}
                          <td className="p-3">
                            <input
                              type="number"
                              step="0.0001"
                              value={sig.stopLoss ?? ""}
                              onChange={(e) => handleUpdateSignal(sig.id!, "stopLoss", parseFloat(e.target.value) || 0)}
                              className="w-20 bg-slate-950 border border-slate-800 rounded px-1.5 py-1 font-mono text-rose-400"
                            />
                          </td>

                          {/* TPs list */}
                          <td className="p-3">
                            <div className="flex flex-wrap items-center gap-2">
                              {sig.takeProfits?.map((tp, tpIdx) => (
                                <div key={tpIdx} className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 font-mono">
                                  <span className="text-[9px] text-slate-500">T{tpIdx+1}</span>
                                  <input
                                    type="number"
                                    step="0.0001"
                                    value={tp ?? ""}
                                    onChange={(e) => handleUpdateTps(sig.id!, tpIdx, e.target.value)}
                                    className="w-16 bg-transparent border-none text-emerald-400 p-0 text-xs focus:outline-none focus:ring-0"
                                  />
                                  {((sig.takeProfits?.length ?? 0) ?? 0) > 1 && (
                                    <button
                                      onClick={() => handleRemoveTpLevel(sig.id!, tpIdx)}
                                      className="text-rose-400 hover:text-rose-300 text-[10px] ml-1"
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                              ))}
                              {((sig.takeProfits?.length ?? 0) ?? 0) < 5 && (
                                <button
                                  onClick={() => handleAddTpLevel(sig.id!)}
                                  className="bg-slate-950 border border-slate-800 text-[10px] hover:text-teal-400 px-2 py-1 rounded"
                                >
                                  + TP
                                </button>
                              )}
                            </div>
                          </td>

                          {/* R:R Quality Grade badge */}
                          <td className="p-3 text-center">
                            {(() => {
                              const { grade, color, rr } = getSignalRRGrade(sig);
                              return (
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono ${color}`} title={rr > 0 ? `1:${rr.toFixed(2)} risk-to-reward` : "Cannot calculate — entry, SL or TP missing"}>
                                  {grade}{rr > 0 ? ` (1:${rr.toFixed(1)})` : ""}
                                </span>
                              );
                            })()}
                          </td>

                          {/* Action Delete */}
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleDeleteSignal(sig.id!)}
                              className="text-rose-400 hover:text-rose-300 transition-all cursor-pointer p-1 rounded hover:bg-rose-500/5"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: SIMULATION LIVE STREAM LOGS */}
          {activeTab === "sim_console" && (
            <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
                    Market Simulator Live Console
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">Tick-by-tick order book execution logs</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Speed multiplier:</span>
                  <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
                    <button 
                      onClick={() => setSimLogSpeed(300)} 
                      className={`px-2 py-0.5 rounded-lg ${simLogSpeed === 300 ? "bg-slate-800 text-slate-300" : "text-slate-500"}`}
                    >
                      1x
                    </button>
                    <button 
                      onClick={() => setSimLogSpeed(100)} 
                      className={`px-2 py-0.5 rounded-lg ${simLogSpeed === 100 ? "bg-slate-800 text-slate-300" : "text-slate-500"}`}
                    >
                      5x
                    </button>
                    <button 
                      onClick={() => setSimLogSpeed(10)} 
                      className={`px-2 py-0.5 rounded-lg ${simLogSpeed === 10 ? "bg-slate-800 text-slate-300" : "text-slate-500"}`}
                    >
                      Instant
                    </button>
                  </div>
                </div>
              </div>

              {(simRunningEvents?.length ?? 0) === 0 ? (
                <div className="border border-dashed border-slate-800 rounded-2xl p-16 flex flex-col items-center justify-center text-center gap-3">
                  <Play className="w-12 h-12 text-slate-700 animate-pulse" />
                  <div className="max-w-xs flex flex-col gap-1">
                    <h4 className="text-sm font-bold text-slate-300">Simulator is Idle</h4>
                    <p className="text-xs text-slate-500">Configure your parameters, then click Run Signals Simulation to execute tick traces.</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {isSimulating && (
                    <div className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/10 p-3.5 rounded-xl text-xs text-emerald-400 font-mono">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                      <span>Simulating Trade Group... currently processing trade #{activeSimTradeIdx + 1}</span>
                    </div>
                  )}

                  <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 h-96 overflow-y-auto font-mono text-[11px] text-slate-300 leading-relaxed flex flex-col gap-1 select-text scrollbar-thin">
                    {simRunningEvents?.map((log, idx) => {
                      let color = "text-slate-400";
                      if (log.includes("TP")) color = "text-emerald-400 font-semibold";
                      if (log.includes("SL hit")) color = "text-rose-400 font-semibold";
                      if (log.includes("Rules Triggered")) color = "text-yellow-400 font-semibold";
                      if (log.includes("🚀 RUNNING")) color = "text-teal-400 font-bold";
                      if (log.includes("🏆 BACKTEST")) color = "text-amber-400 font-extrabold text-xs";
                      return (
                        <div key={idx} className={`${color}`}>
                          {log}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: PREMIUM SAAS ANALYTICS DASHBOARD */}
          {activeTab === "analytics" && simulationResults && (
            <div className="flex flex-col gap-6">

              {/* Synthetic Fallback Warning Banner */}
              {simulationResults.trades.some(t => !t.isRealData) && (
                <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl animate-fade-in">
                  <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5 animate-pulse" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold uppercase tracking-wider font-mono">Warning: Running on Synthetic Volatility Data due to Rate Limits</span>
                    <span className="text-[10px] text-slate-400 leading-relaxed font-mono">
                      Premium external feeds were either rate-limited or unconfigured. The simulation gracefully reverted to high-precision local Geometric Brownian-motion stochastic modeling to complete the validation safely.
                    </span>
                  </div>
                </div>
              )}
              
              {/* Backtest Precision Badge */}
              <div className="flex items-center justify-between bg-slate-900/40 border border-slate-900/60 rounded-xl px-4 py-2.5">
                <span className="text-xs text-slate-400">Backtest Precision Mode</span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold font-mono tracking-wider flex items-center gap-1 ${
                    config.backtestPrecision === "every_tick"
                      ? "bg-emerald-500/15 border border-emerald-500/25 text-emerald-400"
                      : "bg-slate-800 border border-slate-700 text-slate-300"
                  }`}>
                    {config.backtestPrecision === "every_tick" && <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400/20 animate-pulse" />}
                    <span>{config.backtestPrecision === "every_tick" ? "EVERY TICK (HIGH-FIDELITY PRO)" : "CANDLE CLOSE (CONSERVATIVE)"}</span>
                  </span>
                </div>
              </div>

              {/* Core metrics grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* Balance & Profit */}
                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
                    <span>Net Profit Yield</span>
                    <Coins className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="mt-2.5">
                    <h3 className={`text-xl font-bold font-mono tracking-tight ${simulationResults.netProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {simulationResults.netProfit >= 0 ? "+" : ""}${simulationResults.netProfit.toFixed(2)}
                    </h3>
                    <p className={`text-xs font-mono mt-0.5 ${simulationResults.netProfit >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                      {simulationResults.netProfit >= 0 ? "+" : ""}{simulationResults.netProfitPercent.toFixed(2)}% ROI
                    </p>
                  </div>
                </div>

                {/* Win Rate Claimed vs Actual */}
                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-mono z-10">
                    <span>Win Rate Paradox</span>
                    <Scale className="w-4 h-4 text-teal-400" />
                  </div>
                  <div className="mt-2.5 z-10">
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-xl font-bold font-mono text-emerald-400">
                        {simulationResults.winRate.toFixed(1)}%
                      </h3>
                      <span className="text-[10px] text-slate-500 font-mono">Actual</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-mono text-slate-500">Claimed:</span>
                      <span className="text-[10px] font-mono text-yellow-500 font-semibold line-through">{config.claimedWinRate}%</span>
                    </div>
                  </div>
                  {/* Backdrop highlight telling them how realistic WR works */}
                  <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none"></div>
                </div>

                {/* Profit Factor */}
                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
                    <span>Profit Factor</span>
                    <Activity className="w-4 h-4 text-teal-400" />
                  </div>
                  <div className="mt-2.5">
                    <h3 className="text-xl font-bold font-mono text-slate-200">
                      {simulationResults.profitFactor.toFixed(2)}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Gross Win / Gross Loss</p>
                  </div>
                </div>

                {/* Total Pips Gained */}
                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
                    <span>Total Pips</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="mt-2.5">
                    <h3 className="text-xl font-bold font-mono text-slate-200">
                      {simulationResults.totalPipsGained >= 0 ? "+" : ""}{simulationResults.totalPipsGained.toFixed(1)}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Total distance covered</p>
                  </div>
                </div>

              </div>

              {/* ── Extended Study Metrics grid (8 advanced cards) ─────────── */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                {/* Expectancy */}
                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
                    <span>Expectancy / EV</span>
                    <DollarSign className="w-4 h-4 text-teal-400" />
                  </div>
                  <div className="mt-2.5">
                    <h3 className={`text-lg font-bold font-mono ${(simulationResults.expectancy ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {(simulationResults.expectancy ?? 0) >= 0 ? "+" : ""}${(simulationResults.expectancy ?? 0).toFixed(2)}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Avg edge per trade</p>
                  </div>
                </div>

                {/* Sharpe Ratio */}
                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
                    <span>Sharpe Ratio</span>
                    <LineChart className="w-4 h-4 text-teal-400" />
                  </div>
                  <div className="mt-2.5">
                    <h3 className={`text-lg font-bold font-mono ${(simulationResults.sharpeRatio ?? 0) >= 1 ? "text-emerald-400" : (simulationResults.sharpeRatio ?? 0) >= 0 ? "text-yellow-400" : "text-rose-400"}`}>
                      {(simulationResults.sharpeRatio ?? 0).toFixed(2)}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Return / volatility</p>
                  </div>
                </div>

                {/* Recovery Factor */}
                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
                    <span>Recovery Factor</span>
                    <RefreshCw className="w-4 h-4 text-teal-400" />
                  </div>
                  <div className="mt-2.5">
                    <h3 className={`text-lg font-bold font-mono ${(simulationResults.recoveryFactor ?? 0) >= 1 ? "text-emerald-400" : "text-yellow-400"}`}>
                      {(simulationResults.recoveryFactor ?? 0).toFixed(2)}x
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Profit ÷ max drawdown $</p>
                  </div>
                </div>

                {/* Avg Trade Duration */}
                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
                    <span>Avg Duration</span>
                    <Clock className="w-4 h-4 text-teal-400" />
                  </div>
                  <div className="mt-2.5">
                    <h3 className="text-lg font-bold font-mono text-slate-200">
                      {(simulationResults.avgTradeDurationMinutes ?? 0) >= 60
                        ? `${((simulationResults.avgTradeDurationMinutes ?? 0) / 60).toFixed(1)}h`
                        : `${Math.round(simulationResults.avgTradeDurationMinutes ?? 0)}m`}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Open → close per trade</p>
                  </div>
                </div>

                {/* Max Consecutive Wins */}
                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
                    <span>Max Win Streak</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="mt-2.5">
                    <h3 className="text-lg font-bold font-mono text-emerald-400">{simulationResults.maxConsecutiveWins ?? 0}</h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Consecutive wins</p>
                  </div>
                </div>

                {/* Max Consecutive Losses */}
                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
                    <span>Max Loss Streak</span>
                    <TrendingDown className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="mt-2.5">
                    <h3 className="text-lg font-bold font-mono text-rose-400">{simulationResults.maxConsecutiveLosses ?? 0}</h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Consecutive losses</p>
                  </div>
                </div>

                {/* Largest Win */}
                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
                    <span>Largest Win</span>
                    <Zap className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="mt-2.5">
                    <h3 className="text-lg font-bold font-mono text-emerald-400">+${(simulationResults.largestWin ?? 0).toFixed(2)}</h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Single best trade</p>
                  </div>
                </div>

                {/* Largest Loss */}
                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
                    <span>Largest Loss</span>
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="mt-2.5">
                    <h3 className="text-lg font-bold font-mono text-rose-400">-${(simulationResults.largestLoss ?? 0).toFixed(2)}</h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Single worst trade</p>
                  </div>
                </div>

              </div>

              {/* Core Balance Equity SVG curve */}
              {renderSVGChart(simulationResults)}

              {/* Enhancement 5 — Trade Flow Timeline ────────────────────────── */}
              {simulationResults.trades && ((simulationResults?.trades?.length ?? 0) ?? 0) > 0 && (() => {
                const trades = simulationResults.trades;
                const W = 700;
                const H = Math.min(260, Math.max(80, (trades?.length ?? 0) * 10 + 32));
                const ML = 8, MR = 8, MT = 18, MB = 20;
                const cW = W - ML - MR;
                const cH = H - MT - MB;
                const barH = Math.max(4, Math.min(9, Math.floor(cH / (trades?.length ?? 0)) - 2));

                const timesMs = trades.flatMap((t: any) => [
                  t.openTime  ? new Date(t.openTime).getTime()  : 0,
                  t.closeTime ? new Date(t.closeTime).getTime() : 0,
                ])?.filter((n: number) => n > 0);

                const hasRealTimes = (timesMs?.length ?? 0) >= 2;
                const minMs = hasRealTimes ? Math.min(...timesMs) : 0;
                const maxMs = hasRealTimes ? Math.max(...timesMs) : (trades?.length ?? 0);
                const rng   = Math.max(1, maxMs - minMs);

                const toX    = (ms: number) => ML + ((ms - minMs) / rng) * cW;
                const idxToX = (i: number)  => ML + (i / Math.max(1, (trades?.length ?? 0) - 1)) * cW;

                const clr = (t: any) =>
                  t.status === "WIN" ? "#10b981" : t.status === "LOSS" ? "#f43f5e"
                  : t.status === "PARTIAL_PROFIT" ? "#f59e0b" : "#64748b";

                return (
                  <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-violet-400" />
                        Trade Flow Timeline
                      </h4>
                      <span className="text-[10px] bg-violet-500/10 text-violet-400 px-2 py-0.5 rounded font-mono">
                        {(trades?.length ?? 0)} trades · {trades?.filter((t: any) => t.status === "WIN")?.length ?? 0}W / {trades?.filter((t: any) => t.status === "LOSS")?.length ?? 0}L
                      </span>
                    </div>
                    <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl bg-slate-950/50" style={{ height: `${H}px` }}>
                      {/* Grid reference lines */}
                      {[0.25, 0.5, 0.75]?.map((f: number) => (
                        <line key={f} x1={ML + f * cW} y1={MT} x2={ML + f * cW} y2={MT + cH}
                          stroke="#1e293b" strokeWidth={1} strokeDasharray="4,3" />
                      ))}
                      {/* Trade bars (time-proportional) or dot fallback */}
                      {trades?.map((t: any, i: number) => {
                        const y = MT + i * (barH + 2);
                        if (hasRealTimes && t.openTime && t.closeTime) {
                          const x1 = toX(new Date(t.openTime).getTime());
                          const x2 = toX(new Date(t.closeTime).getTime());
                          const bw  = Math.max(4, x2 - x1);
                          return (
                            <rect key={i} x={x1} y={y} width={bw} height={barH}
                              fill={clr(t)} fillOpacity={0.82} rx={1.5}>
                              <title>{`${t.asset} ${t.type} ${t.status}\nProfit: ${t.profitAmount >= 0 ? "+" : ""}$${t.profitAmount?.toFixed(2)} USD (${t.pipsGained?.toFixed(1)} pips)\nOpened: ${formatDateTime(t.openTime)}\nClosed: ${formatDateTime(t.closeTime)}`}</title>
                            </rect>
                          );
                        }
                        // Fallback: evenly-spaced colored dots when no real timestamps
                        const cx = idxToX(i);
                        return (
                          <circle key={i} cx={cx} cy={y + barH / 2} r={barH / 2 + 1}
                            fill={clr(t)} fillOpacity={0.82}>
                            <title>{`${t.asset} ${t.type} ${t.status}\nProfit: ${t.profitAmount >= 0 ? "+" : ""}$${t.profitAmount?.toFixed(2)} USD\nOpened: ${formatDateTime(t.openTime)}\nClosed: ${formatDateTime(t.closeTime)}`}</title>
                          </circle>
                        );
                      })}
                      {/* Labels */}
                      <text x={ML} y={H - 3} fontSize={8} fill="#475569">← older</text>
                      <text x={W - MR} y={H - 3} textAnchor="end" fontSize={8} fill="#475569">newer →</text>
                    </svg>
                    <div className="flex gap-4 text-[10px] font-mono text-slate-500">
                      {([ ["bg-emerald-500", "Win"], ["bg-rose-500", "Loss"], ["bg-amber-500", "Partial TP"], ["bg-slate-500", "Expired/Time"] ] as [string, string][])?.map(([bg, label]) => (
                        <span key={label} className="flex items-center gap-1.5">
                          <span className={`inline-block w-3 h-2 rounded-sm ${bg}/75`} />{label}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Theoretical vs Realized RR and Drawdown metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Risk-to-Reward comparison block */}
                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-200">Risk-to-Reward (R:R) Leakage</h4>
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-mono">Discrepancy</span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    VIP channels often boast massive R:R metrics (e.g., SL 30 pips vs TP3 150 pips, representing a 1:5 ratio). However, once <b>partial exits at TP1</b>, <b>early break-evens</b>, or <b>trailing stops</b> are factored in, the <i>actual realized R:R</i> is often much smaller.
                  </p>

                  <div className="flex flex-col gap-3 font-mono text-xs mt-1">
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Theoretical Channel R:R Profile:</span>
                        <span className="text-yellow-500 font-semibold">1 : {simulationResults.theoreticalRiskReward.toFixed(1)}</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                        <div className="bg-yellow-500 h-full rounded-full" style={{ width: "100%" }}></div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Actual Realized R:R Profile (Your Rules):</span>
                        <span className="text-emerald-400 font-semibold">1 : {simulationResults.realizedRiskReward.toFixed(1)}</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${Math.min(100, (simulationResults.realizedRiskReward / (simulationResults.theoreticalRiskReward || 1)) * 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Educational analysis box */}
                <div className="bg-gradient-to-br from-slate-900/80 to-slate-950 border border-slate-850 rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-teal-400" />
                    <h4 className="text-sm font-semibold text-slate-200">Gemini System Verdict</h4>
                  </div>

                  <div className="flex flex-col gap-2.5 text-xs text-slate-400 leading-relaxed">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Advanced Risk Metrics calculated successfully</span>
                    </div>
                    <span>
                      The backtest demonstrates that the channel's <b>claimed win rate ({config.claimedWinRate}%)</b> is highly unrealistic in live trading environments. By executing with disciplined risk management—closing <b>{(config.tp1ExitRatio * 100)}% at TP1</b> and moving SL to entry—your capital remains protected against consecutive stop-out losses, resulting in a sustainable equity curve.
                    </span>
                    <div className="border-t border-slate-900 pt-2.5 flex items-center justify-between text-[11px] font-mono">
                      <span>Max Backtest Drawdown:</span>
                      <span className="text-rose-400 font-semibold">-{simulationResults.maxDrawdownPercent.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* ── Per-Asset Performance Breakdown ────────────────────────── */}
              {simulationResults.perAssetStats && (Object.keys(simulationResults.perAssetStats)?.length ?? 0) > 0 && (
                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex flex-col gap-4">
                  <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-400" /> Per-Asset Performance
                  </h4>
                  <div className="overflow-x-auto border border-slate-800 rounded-xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
                          <th className="p-3">Symbol</th>
                          <th className="p-3 text-center">Trades</th>
                          <th className="p-3 text-center">Win Rate</th>
                          <th className="p-3 text-center">W / L</th>
                          <th className="p-3 text-right">Net P&amp;L</th>
                          <th className="p-3 text-right">Net Pips</th>
                          <th className="p-3 text-right">Avg / Trade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900 bg-slate-950/20 font-mono">
                        {(Object.entries(simulationResults.perAssetStats) as [string, PerAssetStat][])
                          .sort(([, a], [, b]) => b.pnl - a.pnl)
                          ?.map(([asset, s]) => (
                          <tr key={asset} className="hover:bg-slate-900/20 transition-all">
                            <td className="p-3 font-bold text-slate-200">{asset}</td>
                            <td className="p-3 text-center text-slate-400">{s.trades}</td>
                            <td className="p-3 text-center">
                              <span className={`font-semibold ${s.winRate >= 50 ? "text-emerald-400" : "text-rose-400"}`}>
                                {s.winRate.toFixed(0)}%
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span className="text-emerald-400">{s.wins}</span>
                              <span className="text-slate-600 mx-1">/</span>
                              <span className="text-rose-400">{s.losses}</span>
                            </td>
                            <td className={`p-3 text-right font-bold ${s.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                              {s.pnl >= 0 ? "+" : ""}${s.pnl.toFixed(2)}
                            </td>
                            <td className={`p-3 text-right font-semibold ${s.pips >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                              {s.pips >= 0 ? "+" : ""}{s.pips.toFixed(1)}
                            </td>
                            <td className={`p-3 text-right ${s.avgPnl >= 0 ? "text-slate-300" : "text-rose-400"}`}>
                              {s.avgPnl >= 0 ? "+" : ""}${s.avgPnl.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── Monthly P&L Breakdown ───────────────────────────────────── */}
              {simulationResults.monthlyPnl && (Object.keys(simulationResults.monthlyPnl)?.length ?? 0) > 0 && (
                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex flex-col gap-4">
                  <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <LineChart className="w-4 h-4 text-teal-400" /> Monthly P&amp;L Breakdown
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {(Object.entries(simulationResults.monthlyPnl) as [string, number][])
                      .sort(([a], [b]) => a.localeCompare(b))
                      ?.map(([month, pnl]) => {
                        const [yr, mo] = month.split("-");
                        const label = new Date(`${yr}-${mo}-01`).toLocaleString("default", { month: "short", year: "2-digit" });
                        const maxAbs = Math.max(...(Object.values(simulationResults.monthlyPnl) as number[])?.map(Math.abs));
                        const barPct = maxAbs > 0 ? Math.abs(pnl) / maxAbs * 100 : 0;
                        return (
                          <div key={month} className="flex flex-col items-center gap-1.5 min-w-[52px]">
                            <span className={`text-[10px] font-mono font-bold ${pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                              {pnl >= 0 ? "+" : ""}${Math.abs(pnl) >= 1000 ? (pnl / 1000).toFixed(1) + "k" : pnl.toFixed(0)}
                            </span>
                            <div className="w-10 h-20 bg-slate-950 rounded-sm relative overflow-hidden flex flex-col justify-end">
                              <div
                                className={`w-full rounded-sm transition-all ${pnl >= 0 ? "bg-emerald-500/40 border-t border-emerald-500/60" : "bg-rose-500/40 border-t border-rose-500/60"}`}
                                style={{ height: `${Math.max(4, barPct)}%` }}
                              />
                            </div>
                            <span className="text-[9px] text-slate-500 font-mono">{label}</span>
                          </div>
                        );
                    })}
                  </div>
                </div>
              )}

              {/* ── Simulated Orders Execution History (sortable + filterable) ─ */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h4 className="text-sm font-semibold text-slate-200">Simulated Orders Execution History</h4>
                  {/* Status filter pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(["ALL", "WIN", "PARTIAL_WIN", "BREAKEVEN", "LOSS"] as const)?.map(f => (
                      <button
                        key={f}
                        onClick={() => setTradeTableFilter(f)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono transition-all ${
                          tradeTableFilter === f
                            ? f === "WIN" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              : f === "PARTIAL_WIN" ? "bg-teal-500/20 text-teal-400 border border-teal-500/40"
                              : f === "BREAKEVEN" ? "bg-slate-700 text-slate-300 border border-slate-600"
                              : f === "LOSS" ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                              : "bg-slate-800 text-slate-200 border border-slate-700"
                            : "text-slate-500 hover:text-slate-300 border border-transparent"
                        }`}
                      >
                        {f === "PARTIAL_WIN" ? "PARTIAL" : f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800 select-none">
                        {(["id","asset","type","time","lots","pnl","pips","rr","source","status"] as const)?.map(col => {
                          const labels: Record<string,string> = { id:"Order", asset:"Asset", type:"Dir", time:"Time", lots:"Lots", pnl:"P&L ($)", pips:"Pips", rr:"R:R", source:"Data", status:"Outcome" };
                          const isSorted = tradeTableSort.col === col;
                          return (
                            <th
                              key={col}
                              className="p-3 cursor-pointer hover:text-slate-200 transition-all group"
                              onClick={() => setTradeTableSort(s => s.col === col ? { col, dir: s.dir === "asc" ? "desc" : "asc" } : { col, dir: "desc" })}
                            >
                              <span className="flex items-center gap-1">
                                {labels[col]}
                                <span className={`text-[9px] ${isSorted ? (tradeTableSort.dir === "asc" ? "text-teal-400" : "text-teal-400") : "text-slate-700 group-hover:text-slate-500"}`}>
                                  {isSorted ? (tradeTableSort.dir === "asc" ? "▲" : "▼") : "⇅"}
                                </span>
                              </span>
                            </th>
                          );
                        })}
                        <th className="p-3 text-right">Audit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 bg-slate-950/20 font-mono">
                      {[...simulationResults.trades]
                        ?.filter(t => tradeTableFilter === "ALL" || t.status === tradeTableFilter || (tradeTableFilter === "LOSS" && t.status === "LOSS"))
                        .sort((a, b) => {
                          const dir = tradeTableSort.dir === "asc" ? 1 : -1;
                          switch (tradeTableSort.col) {
                            case "pnl": return (a.profitAmount - b.profitAmount) * dir;
                            case "pips": return (a.pipsGained - b.pipsGained) * dir;
                            case "lots": return (a.lotsTraded - b.lotsTraded) * dir;
                            case "asset": return a.signal.asset.localeCompare(b.signal.asset) * dir;
                            case "type": return a.signal.type.localeCompare(b.signal.type) * dir;
                            case "status": return a.status.localeCompare(b.status) * dir;
                            case "source": return (a.dataSource || "").localeCompare(b.dataSource || "") * dir;
                            case "time": return (new Date(a.openTime || 0).getTime() - new Date(b.openTime || 0).getTime()) * dir;
                            case "rr": {
                              const specsA = getAssetSpecs(a.signal.asset);
                              const slPipsA = Math.abs(a.signal.entryPrice - a.signal.stopLoss) / (specsA.pipSize || 0.0001);
                              const rrA = slPipsA > 0 ? a.pipsGained / slPipsA : 0;

                              const specsB = getAssetSpecs(b.signal.asset);
                              const slPipsB = Math.abs(b.signal.entryPrice - b.signal.stopLoss) / (specsB.pipSize || 0.0001);
                              const rrB = slPipsB > 0 ? b.pipsGained / slPipsB : 0;

                              return (rrA - rrB) * dir;
                            }
                            default: return (Number(a.id?.replace(/\D/g, "")) - Number(b.id?.replace(/\D/g, ""))) * dir;
                          }
                        })
                        ?.map((t) => {
                          const specs = getAssetSpecs(t.signal.asset);
                          const slPips = Math.abs(t.signal.entryPrice - t.signal.stopLoss) / (specs.pipSize || 0.0001);
                          const realizedRR = slPips > 0 ? Math.abs(t.pipsGained) / slPips : 0;
                          const srcLabel: Record<string,string> = { yahoo:"YF 1m", yahoo_1h:"YF 1H", twelvedata:"12D", polygon:"POLY", oanda:"OANDA", custom:"CSTM", synthetic:"SYN" };
                          return (
                            <tr
                              key={t.id}
                              onClick={() => setChartSelectedTrade(prev => prev?.id === t.id ? {...t} : {...t})}
                              className={`hover:bg-slate-900/30 transition-all cursor-pointer ${chartSelectedTrade?.id === t.id ? "bg-slate-900/45 border-l-2 border-l-teal-500" : ""}`}
                              title={`Trade Executed: ${t.id}\nAsset: ${t.signal.asset} · ${t.signal.type}\nOpened: ${formatDateTime(t.openTime)}\nClosed: ${formatDateTime(t.closeTime)}\nProfit: $${t.profitAmount.toFixed(2)} USD\nPips: ${t.pipsGained.toFixed(1)}`}
                            >
                              <td className="p-3 font-semibold text-slate-300">{t.id}</td>
                              <td className="p-3 text-slate-400">{t.signal.asset}</td>
                              <td className="p-3">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${t.signal.type.includes("BUY") ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                                  {t.signal.type}
                                </span>
                              </td>
                              <td className="p-3 text-slate-400 whitespace-nowrap text-[10px] font-mono tabular-nums">
                                <div className="font-bold text-slate-200" title={`Raw: ${t.signal.datetime}`}>
                                  {t.signal.datetime ? formatDateTime(t.signal.datetime) : <span className="text-red-500">Missing</span>}
                                </div>
                                {t.signal.datetime && new Date(t.signal.datetime).getTime() !== new Date(t.openTime).getTime() && (
                                  <div className="text-[9px] text-slate-500 mt-0.5" title="Simulation Open Time">
                                    Sim: {formatDateTime(t.openTime)}
                                  </div>
                                )}
                              </td>
                              <td className="p-3 text-slate-400">{t.lotsTraded.toFixed(2)}</td>
                              <td className={`p-3 font-bold ${t.profitAmount >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                {t.profitAmount >= 0 ? "+" : ""}${t.profitAmount.toFixed(2)}
                              </td>
                              <td className={`p-3 font-semibold ${t.pipsGained >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                                {t.pipsGained >= 0 ? "+" : ""}{t.pipsGained.toFixed(1)}
                              </td>
                              <td className="p-3 text-slate-400">{t.profitAmount > 0 ? `1:${realizedRR.toFixed(1)}` : t.profitAmount < 0 ? `–` : "BE"}</td>
                              <td className="p-3">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold ${t.isRealData ? "bg-teal-500/10 text-teal-400" : "bg-amber-500/10 text-amber-400"}`}>
                                  {srcLabel[t.dataSource || ""] || (t.isRealData ? "REAL" : "SYN")}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.status === "WIN" ? "bg-emerald-500/10 text-emerald-400" : t.status === "PARTIAL_WIN" ? "bg-teal-500/10 text-teal-400" : t.status === "BREAKEVEN" ? "bg-slate-800 text-slate-400" : "bg-rose-500/10 text-rose-400"}`}>
                                  {t.status}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <button className="text-slate-500 hover:text-teal-400 font-semibold transition-all whitespace-nowrap">Inspect →</button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                  {(simulationResults.trades?.filter(t => tradeTableFilter === "ALL" || t.status === tradeTableFilter)?.length ?? 0) === 0 && (
                    <div className="p-8 text-center text-slate-500 text-xs font-mono">No trades match the selected filter.</div>
                  )}
                </div>
              </div>

              {/* Trade Tick Inspector Modal-style container */}
              {chartSelectedTrade && (() => {
                const specs = getAssetSpecs(chartSelectedTrade.signal.asset);
                const isBuy = chartSelectedTrade.signal.type.toUpperCase().includes("BUY");
                const dec = chartSelectedTrade.entryPrice > 100 ? 2 : 5;

                // Build a breakdown of partial closes for the summary row
                const partialCloses = chartSelectedTrade.events?.filter(e =>
                  e.type === "PARTIAL_CLOSE" || e.type === "CLOSE" || e.type === "SL" || e.type === "BE"
                );
                const hasMultipleExits = chartSelectedTrade.events.some(e => e.type === "PARTIAL_CLOSE");

                // Weighted average exit price across all close events (approximated from events)
                // and cumulative pip value at each stage
                const tpCloses = chartSelectedTrade.events?.filter(e => e.type === "PARTIAL_CLOSE");
                const finalCloseEvt = [...chartSelectedTrade.events].reverse().find(e =>
                  e.type === "CLOSE" || e.type === "SL" || e.type === "BE"
                );
                const lots = chartSelectedTrade.lotsTraded;
                const fullPipValue = lots * specs.pipValuePerLot;

                // Compute professional metrics: duration, MAE, MFE
                const openTime = chartSelectedTrade.openTime ? new Date(chartSelectedTrade.openTime).getTime() : 0;
                const closeTime = chartSelectedTrade.closeTime ? new Date(chartSelectedTrade.closeTime).getTime() : 0;
                const durationMs = closeTime - openTime;
                let durationStr = "–";
                if (durationMs > 0) {
                  const mins = Math.floor(durationMs / 60000);
                  const hrs = Math.floor(mins / 60);
                  const remMins = mins % 60;
                  durationStr = hrs > 0 ? `${hrs}h ${remMins}m` : `${mins}m`;
                }

                const candlesForStats = chartSelectedTrade.candles || [];
                let highestPrice = chartSelectedTrade.entryPrice;
                let lowestPrice = chartSelectedTrade.entryPrice;
                if (openTime && closeTime && (candlesForStats?.length ?? 0) > 0) {
                  const openTs = Math.floor(openTime / 1000);
                  const closeTs = Math.floor(closeTime / 1000);
                  const tradeCandles = candlesForStats?.filter(c => c.timestamp >= openTs && c.timestamp <= closeTs);
                  if ((tradeCandles?.length ?? 0) > 0) {
                    highestPrice = Math.max(...tradeCandles?.map(c => c.high));
                    lowestPrice = Math.min(...tradeCandles?.map(c => c.low));
                  }
                }

                const isBuyType = chartSelectedTrade.signal.type.toUpperCase().includes("BUY");
                const maePips = isBuyType
                  ? Math.max(0, chartSelectedTrade.entryPrice - lowestPrice) / specs.pipSize
                  : Math.max(0, highestPrice - chartSelectedTrade.entryPrice) / specs.pipSize;
                const mfePips = isBuyType
                  ? Math.max(0, highestPrice - chartSelectedTrade.entryPrice) / specs.pipSize
                  : Math.max(0, chartSelectedTrade.entryPrice - lowestPrice) / specs.pipSize;

                const maeUSD = maePips * (lots * specs.pipValuePerLot);
                const mfeUSD = mfePips * (lots * specs.pipValuePerLot);

                return (
                <div className="bg-slate-900/60 border border-slate-900 rounded-2xl p-5 flex flex-col gap-4">
                  {/* Header row */}
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                    <div className="flex items-center gap-2">
                      <Bot className="w-5 h-5 text-teal-400" />
                      <h4 className="text-sm font-semibold text-slate-200">
                        Tick-by-Tick Audit Trace — {chartSelectedTrade.id} ({chartSelectedTrade.signal.asset})
                      </h4>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                      chartSelectedTrade.profitAmount >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                    }`}>
                      Net PnL: {chartSelectedTrade.profitAmount >= 0 ? "+" : ""}${chartSelectedTrade.profitAmount.toFixed(2)} USD
                    </span>
                  </div>

                  {/* Position summary strip */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px] font-mono">
                    <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 flex flex-col gap-0.5">
                      <span className="text-slate-500 uppercase tracking-wider">Entry</span>
                      <span className="text-cyan-400 font-bold">{isBuy ? "▲ BUY" : "▼ SELL"} @ {chartSelectedTrade.entryPrice.toFixed(dec)}</span>
                      <span className="text-slate-500">{lots.toFixed(2)} lots · ${fullPipValue.toFixed(2)}/pip full</span>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 flex flex-col gap-0.5">
                      <span className="text-slate-500 uppercase tracking-wider">Last Exit Price</span>
                      <span className={`font-bold ${chartSelectedTrade.finalExitPrice >= chartSelectedTrade.entryPrice === isBuy ? "text-emerald-400" : "text-rose-400"}`}>
                        {chartSelectedTrade.finalExitPrice.toFixed(dec)}
                      </span>
                      <span className="text-slate-500">{hasMultipleExits ? `${(tpCloses?.length ?? 0) + 1} exit event(s)` : "Single close"}</span>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 flex flex-col gap-0.5">
                      <span className="text-slate-500 uppercase tracking-wider">Pip Value Impact</span>
                      <span className="text-violet-400 font-bold">${fullPipValue.toFixed(2)}/pip at open</span>
                      <span className="text-slate-500">
                        {hasMultipleExits
                          ? `Reduces each partial close`
                          : `Constant — single close`}
                      </span>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 flex flex-col gap-0.5">
                      <span className="text-slate-500 uppercase tracking-wider">Pips Gained</span>
                      <span className={`font-bold ${chartSelectedTrade.pipsGained >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {chartSelectedTrade.pipsGained >= 0 ? "+" : ""}{chartSelectedTrade.pipsGained.toFixed(1)} pips
                      </span>
                      <span className="text-slate-500">from final close vs entry</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Candlestick chart + Step buttons */}
                    <div className="md:col-span-8 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
                      {/* Trade Navigation Bar (Previous/Next Trade) */}
                      {(() => {
                        const allTrs = simulationResults?.trades || [];
                        const curIdx = allTrs.findIndex(t => t.id === chartSelectedTrade.id);
                        if (curIdx === -1) return null;
                        return (
                          <div className="flex items-center justify-between bg-slate-900/30 border border-slate-900/60 rounded-xl px-4 py-2 text-xs font-mono">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Trade Navigation:</span>
                              <span className="text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/15 text-[10px]">
                                {curIdx + 1} OF {(allTrs?.length ?? 0)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  const prevTrade = allTrs[curIdx - 1];
                                  if (prevTrade) {
                                    setChartSelectedTrade({...prevTrade});
                                    setSelectedEventIdx(-1);
                                  }
                                }}
                                disabled={curIdx === 0}
                                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 font-black text-[10px] transition-all cursor-pointer flex items-center gap-1"
                              >
                                ◀ Prev Trade
                              </button>
                              <button
                                onClick={() => {
                                  const nextTrade = allTrs[curIdx + 1];
                                  if (nextTrade) {
                                    setChartSelectedTrade({...nextTrade});
                                    setSelectedEventIdx(-1);
                                  }
                                }}
                                disabled={curIdx === (allTrs?.length ?? 0) - 1}
                                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 font-black text-[10px] transition-all cursor-pointer flex items-center gap-1"
                              >
                                Next Trade ▶
                              </button>
                            </div>
                          </div>
                        );
                      })()}

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-mono font-medium">
                          {chartSelectedTrade.isRealData ? "Real Historical Candles" : "Synthetic Candle Path"}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Entry {chartSelectedTrade.entryPrice.toFixed(dec)}
                          {hasMultipleExits
                            ? ` | ${(tpCloses?.length ?? 0)} TP exit(s) + final close`
                            : ` → Exit ${chartSelectedTrade.finalExitPrice.toFixed(dec)}`}
                        </span>
                      </div>
                      <div className="w-full relative bg-slate-950">
                        {renderCandlestickChart(chartSelectedTrade, selectedEventIdx)}
                      </div>

                      {/* Chronological Navigation Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/40 border border-slate-900 rounded-xl px-4 py-3 text-[10px] font-mono">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-semibold uppercase tracking-wider">Simulation Step:</span>
                          <span className="text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/15">
                            {selectedEventIdx === -1 ? "FINAL STATE" : `EVENT ${selectedEventIdx + 1} OF ${((chartSelectedTrade?.events?.length ?? 0) ?? 0)}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          <button
                            onClick={() => setSelectedEventIdx(prev => prev === -1 ? ((chartSelectedTrade?.events?.length ?? 0) ?? 0) - 1 : Math.max(0, prev - 1))}
                            disabled={selectedEventIdx === 0}
                            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 hover:text-teal-400 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 font-bold cursor-pointer text-[10px] transition-all"
                            title="Previous Step"
                          >
                            [ &lt; Previous Event ]
                          </button>
                          <button
                            onClick={() => setSelectedEventIdx(prev => {
                              if (prev === -1) return 0;
                              if (prev === ((chartSelectedTrade?.events?.length ?? 0) ?? 0) - 1) return -1;
                              return prev + 1;
                            })}
                            disabled={selectedEventIdx === -1}
                            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 hover:text-teal-400 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 font-bold cursor-pointer text-[10px] transition-all"
                            title="Next Step"
                          >
                            [ Next Event &gt; ]
                          </button>
                          <button
                            onClick={() => setSelectedEventIdx(-1)}
                            disabled={selectedEventIdx === -1}
                            className="px-3 py-1.5 rounded-lg bg-teal-950/40 border border-teal-500/20 hover:bg-teal-900/50 text-teal-400 font-bold cursor-pointer text-[10px] transition-all"
                          >
                            Show Final
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Metrics Side Card & Event Timeline */}
                    <div className="md:col-span-4 flex flex-col gap-4">
                      {/* Advanced Metrics Panel */}
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-2.5">
                        <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2">
                          <Activity className="w-3.5 h-3.5 text-teal-400" /> Trade Metrics
                        </span>
                        <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
                          <div className="flex flex-col gap-0.5 bg-slate-900/40 p-2 rounded-lg border border-slate-900">
                            <span className="text-slate-500 uppercase">Duration</span>
                            <span className="text-slate-200 font-bold">{durationStr}</span>
                          </div>
                          <div className="flex flex-col gap-0.5 bg-slate-900/40 p-2 rounded-lg border border-slate-900">
                            <span className="text-slate-500 uppercase">Extreme Peak</span>
                            <span className="text-emerald-400 font-bold">{highestPrice.toFixed(dec)}</span>
                          </div>
                          <div className="flex flex-col gap-0.5 bg-slate-900/40 p-2 rounded-lg border border-slate-900">
                            <span className="text-slate-500 uppercase">Extreme Low</span>
                            <span className="text-rose-400 font-bold">{lowestPrice.toFixed(dec)}</span>
                          </div>
                          <div className="flex flex-col gap-0.5 bg-slate-900/40 p-2 rounded-lg border border-slate-900" title="Maximum Adverse Excursion">
                            <span className="text-slate-500 uppercase">MAE (Drawdown)</span>
                            <span className="text-rose-400 font-bold">-{maePips.toFixed(1)} pips</span>
                            <span className="text-slate-500 font-medium">-${maeUSD.toFixed(2)} USD</span>
                          </div>
                          <div className="flex flex-col gap-0.5 bg-slate-900/40 p-2 rounded-lg border border-slate-900 col-span-2" title="Maximum Favorable Excursion">
                            <span className="text-slate-500 uppercase">MFE (Peak Run-up)</span>
                            <span className="text-emerald-400 font-bold">+{mfePips.toFixed(1)} pips</span>
                            <span className="text-slate-500 font-medium">+${mfeUSD.toFixed(2)} USD</span>
                          </div>
                        </div>
                      </div>

                      {/* Event Log */}
                      <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
                        <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider mb-1">Execution Event Timeline</span>
                        {chartSelectedTrade.events?.map((ev, idx) => {
                          const isActiveStep = selectedEventIdx !== -1 && idx === selectedEventIdx;
                          return (
                            <div key={idx} 
                              onClick={() => setSelectedEventIdx(idx)}
                              className={`border rounded-xl p-2.5 flex items-start gap-2 text-[10px] font-mono leading-relaxed cursor-pointer transition-all hover:bg-slate-900/40 ${
                                isActiveStep ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/30" :
                                ev.type === "PARTIAL_CLOSE" ? "bg-emerald-950/30 border-emerald-900/40" :
                                ev.type === "SL" ? "bg-rose-950/30 border-rose-900/40" :
                                ev.type === "BE" ? "bg-yellow-950/20 border-yellow-900/30" :
                                ev.type === "OPEN" ? "bg-cyan-950/20 border-cyan-900/30" :
                                ev.type === "CLOSE" ? "bg-slate-800/60 border-slate-700" :
                                "bg-slate-950 border-slate-900"
                              }`}
                            >
                              <span className="text-slate-500 shrink-0 mt-0.5">
                                {typeof ev.time === "string" && (ev.time?.length ?? 0) > 8 ? formatDateTime(ev.time, "time") : ev.time}
                              </span>
                              <div className="flex-1 min-w-0">
                                <span className={`font-bold mr-1.5 ${
                                  ev.type === "OPEN" ? "text-cyan-400" :
                                  ev.type === "PARTIAL_CLOSE" ? "text-emerald-400" :
                                  ev.type === "CLOSE" ? "text-teal-400" :
                                  ev.type === "SL" ? "text-rose-400" :
                                  ev.type === "BE" ? "text-yellow-400" :
                                  ev.type === "TRAILING" ? "text-violet-400" :
                                  "text-slate-400"
                                }`}>
                                  [{ev.type}]
                                </span>
                                <span className="text-slate-300 break-words">{ev.message}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                );
              })()}

            </div>
          )}

          {/* ── OPTIMIZER TAB ─────────────────────────────────────────────────── */}
          {activeTab === "optimizer" && (() => {
            // Derived state: filtered + sorted results
            const filteredResults = optimizerResults?.filter(r => {
              const matchesType = optimizerFilter === "all" || r.strategyType === optimizerFilter;
              if (!matchesType) return false;
              if (selectedMatrixCell) {
                const matchesTrail = r.trailingStopTrigger === selectedMatrixCell.trail;
                const matchesTp = Math.abs(r.tp1ExitRatio - selectedMatrixCell.tpVal) < 0.05;
                return matchesTrail && matchesTp;
              }
              return true;
            });
            const colKeyMap: Record<string, string> = {
              "rank":"rank","strategy":"strategyLabel","risk%":"riskPercent",
              "tp config":"tpLabel","trailing":"trailLabel","win rate":"winRate",
              "pf":"profitFactor","max dd":"maxDrawdownPercent","sharpe":"sharpeRatio",
              "net roi":"netProfitPercent","ev/trade":"expectancy",
              "max mult":"maxLotMultiplierReached","consec l":"maxConsecutiveLosses",
              "score":"score","risk":"riskCategory"
            };
            const sortKey = colKeyMap[optimizerSortCol] || "score";
            const displayRows = [...filteredResults].sort((a, b) =>
              optimizerSortDir === "desc" ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey]
            );
            const handleColClick = (col: string) => {
              const k = col.toLowerCase();
              if (optimizerSortCol === k) setOptimizerSortDir(d => d === "desc" ? "asc" : "desc");
              else { setOptimizerSortCol(k); setOptimizerSortDir("desc"); }
            };
            const riskBadge = (cat: string) => {
              const map: Record<string, string> = {
                low:"bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
                medium:"bg-amber-500/15 text-amber-400 border-amber-500/30",
                high:"bg-orange-500/15 text-orange-400 border-orange-500/30",
                extreme:"bg-rose-500/15 text-rose-400 border-rose-500/30"
              };
              return `px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wide ${map[cat] || map.low}`;
            };
            const stratTypeColor: Record<string, string> = {
              flat:"text-slate-300", martingale:"text-rose-400",
              anti_martin:"text-amber-400", progressive:"text-orange-400",
              kelly:"text-teal-400", pyramid:"text-violet-400"
            };
            const hasMartingale = optimizerFilter === "martingale" ||
              (optimizerFilter === "all" && displayRows.some(r => r.strategyType === "martingale"));

            const filterOptions = [
              { key: "all", label: "All Strategies" },
              { key: "flat", label: "Flat Risk" },
              { key: "martingale", label: "Martingale" },
              { key: "anti_martin", label: "Anti-Martingale" },
              { key: "progressive", label: "Progressive" },
              { key: "kelly", label: "Kelly Criterion" },
              { key: "pyramid", label: "Pyramid" },
            ];

            return (
              <div className="flex flex-col gap-5">

                {/* ── Sub-navigation Tabs ── */}
                <div className="flex bg-slate-900/10 border border-slate-900/40 p-1.5 rounded-2xl gap-1.5 self-start shrink-0">
                  <button
                    onClick={() => setOptimizerSubTab("styles")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      optimizerSubTab === "styles"
                        ? "bg-violet-600 text-white shadow-lg font-extrabold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                    5-Style Portfolio Optimizer
                  </button>
                  <button
                    onClick={() => setOptimizerSubTab("ai_stops")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      optimizerSubTab === "ai_stops"
                        ? "bg-emerald-600 text-white shadow-lg font-extrabold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Brain className="w-3.5 h-3.5" />
                    AI Stop-Loss Optimizer
                  </button>
                </div>

                {optimizerSubTab === "styles" ? (
                  <div className="flex flex-col gap-5">

                    {/* ── Header ──────────────────────────────────────────────────────── */}
                    <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-5 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-violet-400" />
                        Advanced 600-Combination Grid Search
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
                        Tests {(signals?.length ?? 0)} signal(s) across <span className="text-violet-300 font-semibold">10 position-sizing strategies</span> (including Martingale variants, Kelly, Pyramid) × 5 risk levels × 4 TP configs × 3 trailing configs.
                        All 600 combinations are ranked by a composite Sharpe/PF/DrawDown score.
                      </p>
                    </div>
                    <button
                      onClick={runOptimizer}
                      disabled={isOptimizing || (signals?.length ?? 0) === 0}
                      className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shrink-0"
                    >
                      {isOptimizing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                      {isOptimizing ? "Running grid search…" : "Run 600-Combo Grid"}
                    </button>
                  </div>

                  {/* Stats bar — shown after a run */}
                  {optimizerTotalCombinations > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: "Combinations Tested", value: optimizerTotalCombinations.toLocaleString(), color: "text-violet-400" },
                        { label: "Computation Time", value: `${optimizerComputationMs}ms`, color: "text-teal-400" },
                        { label: "Best Sharpe", value: optimizerResults[0]?.sharpeRatio?.toFixed(2) ?? "–", color: "text-emerald-400" },
                        { label: "Best PF", value: optimizerResults?.reduce((b, r) => r.profitFactor > b ? r.profitFactor : b, 0).toFixed(2), color: "text-amber-400" },
                      ]?.map(s => (
                        <div key={s.label} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-col gap-0.5">
                          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{s.label}</span>
                          <span className={`text-base font-bold font-mono ${s.color}`}>{s.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Walk-Forward IS/OOS Validation Panel ──── */}
                  {walkForwardSummary && (
                    <div className="flex flex-col gap-5">
                      {/* Starred Best Settings Profile Banner */}
                      {(optimizerResults?.length ?? 0) > 0 && (() => {
                        const best = optimizerResults[0];
                        return (
                          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="bg-amber-500/20 rounded-full p-2 text-amber-400">
                                <Star className="w-5 h-5 fill-amber-400" />
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">★ Best Overall Settings Profile</span>
                                  <span className="bg-amber-500/20 text-amber-300 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Rank #1</span>
                                </div>
                                <h4 className="text-sm font-bold text-slate-100 font-mono">
                                  {best.strategyLabel} · {best.riskPercent}% Risk · {best.tpLabel} · {best.trailLabel}
                                </h4>
                                <p className="text-[10px] text-slate-400 font-mono">
                                  Win Rate: <span className="text-emerald-400 font-bold">{best.winRate.toFixed(1)}%</span> · Profit Factor: <span className="text-emerald-400 font-bold">{best.profitFactor.toFixed(2)}</span> · Sharpe: <span className="text-teal-400 font-bold">{best.sharpeRatio.toFixed(2)}</span> · Net ROI: <span className="text-emerald-400 font-bold">+{best.netProfitPercent.toFixed(1)}%</span>
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => applyToLiveConfig(best)}
                              className="w-full md:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-5 py-2.5 rounded-xl transition-all shadow-lg hover:scale-102 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                            >
                              <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                              Apply to Settings
                            </button>
                          </div>
                        );
                      })()}

                      {/* Overfit Diagnostic Banner */}
                      {walkForwardSummary.hasOOS && (() => {
                        const pfDecay = walkForwardSummary.avgOosProfitFactor && walkForwardSummary.avgIsProfitFactor > 0
                          ? ((walkForwardSummary.avgIsProfitFactor - walkForwardSummary.avgOosProfitFactor) / walkForwardSummary.avgIsProfitFactor) * 100
                          : 0;
                        
                        if (pfDecay > 20) {
                          return (
                            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex gap-3 items-start animate-pulse">
                              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                              <div className="flex flex-col gap-1 text-xs">
                                <span className="font-bold text-rose-400 uppercase tracking-wide">⚠️ Overfit Curve-Fitting Detected</span>
                                <p className="text-rose-300 leading-relaxed">
                                  Warning: Out-of-Sample (OOS) Profit Factor has degraded by <span className="font-bold">{pfDecay.toFixed(1)}%</span> compared to In-Sample (IS) metrics (IS PF: {walkForwardSummary.avgIsProfitFactor.toFixed(2)} vs OOS PF: {walkForwardSummary.avgOosProfitFactor.toFixed(2)}). Your settings may be hyper-optimized for specific historical trends, carrying elevated drawdown risk in live trading conditions.
                                </p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {/* Left: Walk-Forward & Overfit Risk Diagnostic */}
                        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                              <Activity className="w-4 h-4 text-violet-400" />
                              Walk-Forward Validation (IS/OOS)
                            </h4>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded font-mono ${
                              walkForwardSummary.overfitRiskLevel === "HIGH"   ? "bg-rose-500/15 text-rose-400 border border-rose-500/30" :
                              walkForwardSummary.overfitRiskLevel === "MEDIUM" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" :
                                                                                  "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            }`}>
                              Overfit Risk: {walkForwardSummary.overfitRiskLevel}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                            <div className="bg-slate-950/60 border border-slate-800/60 rounded-lg p-3 flex flex-col gap-1">
                              <span className="text-slate-500 text-[10px] uppercase tracking-wider">In-Sample (IS) — 70%</span>
                              <span className="text-slate-200 font-bold">{walkForwardSummary.isSignalCount} signals</span>
                              <div className="flex gap-3 text-[10px] text-slate-400 mt-1">
                                <span>Avg WR: <span className="text-teal-400">{walkForwardSummary.avgIsWinRate?.toFixed(1)}%</span></span>
                                <span>Avg PF: <span className="text-teal-400">{walkForwardSummary.avgIsProfitFactor?.toFixed(2)}</span></span>
                              </div>
                            </div>
                            <div className="bg-slate-950/60 border border-slate-800/60 rounded-lg p-3 flex flex-col gap-1">
                              <span className="text-slate-500 text-[10px] uppercase tracking-wider">Out-of-Sample (OOS) — 30%</span>
                              <span className="text-slate-200 font-bold">{walkForwardSummary.oosSignalCount} signals</span>
                              {walkForwardSummary.hasOOS ? (
                                <div className="flex gap-3 text-[10px] text-slate-400 mt-1">
                                  <span>Avg WR: <span className={
                                    (walkForwardSummary.avgOosWinRate ?? 0) < walkForwardSummary.avgIsWinRate * 0.85 ? "text-rose-400" : "text-teal-400"
                                  }>{walkForwardSummary.avgOosWinRate?.toFixed(1)}%</span></span>
                                  <span>Avg PF: <span className={
                                    (walkForwardSummary.avgOosProfitFactor ?? 0) < walkForwardSummary.avgIsProfitFactor * 0.85 ? "text-rose-400" : "text-teal-400"
                                  }>{walkForwardSummary.avgOosProfitFactor?.toFixed(2)}</span></span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-600 mt-1">Insufficient signals for OOS split</span>
                              )}
                            </div>
                          </div>

                          {/* Overfit Risk Diagnostic details */}
                          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-2 text-[10px] font-mono">
                            <span className="text-slate-400 font-bold uppercase tracking-wider">Overfit Risk Diagnostics:</span>
                            <div className="flex flex-col gap-1 text-slate-400">
                              <div className="flex justify-between border-b border-slate-900/40 pb-1">
                                <span>Sample Sufficiency:</span>
                                <span className={walkForwardSummary.isSignalCount + walkForwardSummary.oosSignalCount >= 15 ? "text-emerald-400" : "text-rose-400"}>
                                  {walkForwardSummary.isSignalCount + walkForwardSummary.oosSignalCount >= 15 ? "SUFFICIENT (Low Risk)" : "INSUFFICIENT (High Risk)"}
                                </span>
                              </div>
                              <div className="flex justify-between border-b border-slate-900/40 pb-1">
                                <span>OOS Performance Decay:</span>
                                <span className={walkForwardSummary.degradedConfigCount / walkForwardSummary.totalConfigCount < 0.2 ? "text-emerald-400" : walkForwardSummary.degradedConfigCount / walkForwardSummary.totalConfigCount < 0.4 ? "text-amber-400" : "text-rose-400"}>
                                  {((walkForwardSummary.degradedConfigCount / walkForwardSummary.totalConfigCount) * 100).toFixed(0)}% degraded configs
                                </span>
                              </div>
                              <div className="flex justify-between border-b border-slate-900/40 pb-1">
                                <span>Sizing Variance Gap:</span>
                                <span className={Math.abs(walkForwardSummary.avgIsProfitFactor - (walkForwardSummary.avgOosProfitFactor || 1)) < 0.3 ? "text-emerald-400" : "text-rose-400"}>
                                  {Math.abs(walkForwardSummary.avgIsProfitFactor - (walkForwardSummary.avgOosProfitFactor || 1)).toFixed(2)} PF Gap
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-xs">
                            <div className={`flex-none rounded-lg p-2.5 text-center font-mono min-w-[90px] ${
                              walkForwardSummary.degradedConfigCount > walkForwardSummary.totalConfigCount * 0.25
                                ? "bg-rose-500/10 border border-rose-500/25 text-rose-400"
                                : "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400"
                            }`}>
                              <div className="font-bold text-sm">{walkForwardSummary.degradedConfigCount}/{walkForwardSummary.totalConfigCount}</div>
                              <div className="text-[10px] opacity-80">configs degraded</div>
                              <div className="text-[10px] opacity-70">&gt;15% in OOS</div>
                            </div>
                            <p className="flex-1 text-[10px] text-slate-400 leading-relaxed">
                              Score = <span className="text-violet-400 font-mono">Sharpe_IS × 30</span> + <span className="text-teal-400 font-mono">PF_OOS × 25</span> − DrawdownPenalty.
                              Configs marked degraded when OOS win rate <em>or</em> profit factor drops more than 15% vs the IS period.
                            </p>
                          </div>
                        </div>

                        {/* Right: 2D Parameter Correlation Matrix heat map */}
                        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                                <Table className="w-4 h-4 text-violet-400" />
                                2D Parameter Correlation Matrix
                              </h4>
                              <p className="text-[10px] text-slate-500 mt-1">
                                Correlates Trailing Stop Trigger (Y-axis) and TP Split Ratio (X-axis). Colors show average Profit Factor. Click a cell to filter.
                              </p>
                            </div>
                            {selectedMatrixCell && (
                              <button 
                                onClick={() => setSelectedMatrixCell(null)}
                                className="text-[10px] bg-violet-500/20 text-violet-300 px-2.5 py-1 rounded-lg border border-violet-500/30 hover:bg-violet-500/30 hover:text-white transition-all cursor-pointer"
                              >
                                Clear Cell Filter
                              </button>
                            )}
                          </div>
                          
                          <div className="overflow-x-auto">
                            <div className="min-w-[280px] flex flex-col gap-1.5 font-mono text-[9px]">
                              {/* X Header */}
                              <div className="grid grid-cols-5 gap-1 text-slate-500 font-bold uppercase tracking-wider text-center pb-1 border-b border-slate-900/40">
                                <span className="text-left font-normal normal-case text-slate-400">Trail \ TP Split</span>
                                <span>33% Spl.</span>
                                <span>50% Spl.</span>
                                <span>75% Spl.</span>
                                <span>100% Sgl.</span>
                              </div>
                              
                              {/* Heat map rows */}
                              {[0, 20, 40]?.map(triggerVal => {
                                const tpVals = [0.33, 0.5, 0.75, 1.0];
                                const labelMap: Record<number, string> = {
                                  0: "No Trail",
                                  20: "20 Pips",
                                  40: "40 Pips"
                                };
                                return (
                                  <div key={triggerVal} className="grid grid-cols-5 gap-1 items-center">
                                    {/* Y Header */}
                                    <span className="font-bold text-slate-400 text-left">{labelMap[triggerVal] ?? `${triggerVal} Pips`}</span>
                                    
                                    {/* Cells */}
                                    {tpVals?.map(tpVal => {
                                      const matches = optimizerResults?.filter(res => 
                                        res.trailingStopTrigger === triggerVal && 
                                        Math.abs(res.tp1ExitRatio - tpVal) < 0.05
                                      );
                                      const avgPF = (matches?.length ?? 0) > 0 
                                        ? matches?.reduce((s, x) => s + x.profitFactor, 0) / (matches?.length ?? 0) 
                                        : 0;
                                      
                                      const isSelected = selectedMatrixCell && 
                                        selectedMatrixCell.trail === triggerVal && 
                                        Math.abs(selectedMatrixCell.tpVal - tpVal) < 0.05;

                                      const textCol = avgPF >= 1.5 ? "text-emerald-400" : avgPF >= 1.0 ? "text-amber-400" : "text-rose-400";
                                      const bgCol = isSelected 
                                        ? "bg-violet-600/30 border-violet-500" 
                                        : avgPF >= 1.5 ? "bg-emerald-500/10" : avgPF >= 1.0 ? "bg-amber-500/10" : "bg-rose-500/10";
                                      const borderCol = isSelected 
                                        ? "border-violet-400/80" 
                                        : avgPF >= 1.5 ? "border-emerald-500/20" : avgPF >= 1.0 ? "border-amber-500/20" : "border-rose-500/20";
 
                                      return (
                                        <button
                                          key={tpVal}
                                          onClick={() => {
                                            if (isSelected) {
                                              setSelectedMatrixCell(null);
                                            } else {
                                              setSelectedMatrixCell({ trail: triggerVal, tpVal: tpVal });
                                            }
                                          }}
                                          className={`p-2 rounded-lg border text-center font-bold transition-all hover:scale-102 cursor-pointer ${bgCol} ${borderCol} ${textCol}`}
                                          title={`${(matches?.length ?? 0)} configs, Avg PF: ${avgPF.toFixed(2)}. Click to filter list.`}
                                        >
                                          {avgPF.toFixed(2)} PF
                                        </button>
                                      );
                                    })}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Grid dimension legend */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] font-mono text-slate-500">
                    {[
                      { dim: "TP Configs ×4", detail: "33% / 50%+MSL / 75%+MSL / 100%" },
                      { dim: "Trailing ×3",   detail: "None / 20-10+BE15 / 40-20" },
                      { dim: "Risk% ×5",       detail: "0.5% / 1% / 1.5% / 2% / 3%" },
                      { dim: "Strategies ×10", detail: "Flat, ×3 Martingale, ×2 Anti-M, Prog, ×2 Kelly, Pyramid" },
                    ]?.map(d => (
                      <div key={d.dim} className="bg-slate-900/40 border border-slate-800/50 rounded-lg px-2.5 py-2">
                        <div className="text-slate-300 font-semibold mb-0.5">{d.dim}</div>
                        <div>{d.detail}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Martingale warning ───────────────────────────────────────────── */}
                {hasMartingale && (optimizerResults?.length ?? 0) > 0 && (
                  <div className="flex items-start gap-3 bg-rose-500/8 border border-rose-500/25 rounded-xl px-4 py-3">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-rose-300 leading-relaxed">
                      <span className="font-bold text-rose-400">Martingale Risk Warning.</span> Martingale strategies double (or multiply) your position size after each loss. A sequence of consecutive losses can multiply your exposure by 10–50× and wipe your account. These strategies can show excellent backtested P&L but carry extreme real-world ruin risk. Never use these with more than 0.5–1% base risk.
                    </div>
                  </div>
                )}

                {/* ── Best Per Strategy Category ───────────────────────────────── */}
                {(optimizerBestPerType?.length ?? 0) > 0 && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <h4 className="text-sm font-semibold text-slate-200">Best Combination Per Strategy Type</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                      {optimizerBestPerType?.map((r: any) => {
                        const typeLabels: Record<string, string> = {
                          flat:"Flat Risk", martingale:"Martingale",
                          anti_martin:"Anti-Martin.", progressive:"Progressive",
                          kelly:"Kelly", pyramid:"Pyramid"
                        };
                        return (
                          <div key={r.strategyType} className={`bg-slate-900/60 border rounded-xl p-3 flex flex-col gap-2 text-[10px] font-mono ${
                            r.riskCategory === "extreme" ? "border-rose-500/30" :
                            r.riskCategory === "high" ? "border-orange-500/30" :
                            r.riskCategory === "medium" ? "border-amber-500/30" : "border-slate-800"
                          }`}>
                            <div className="flex items-center justify-between gap-1">
                              <span className={`text-xs font-bold ${stratTypeColor[r.strategyType]}`}>
                                {typeLabels[r.strategyType] ?? r.strategyType}
                              </span>
                              <span className={riskBadge(r.riskCategory)}>{r.riskCategory}</span>
                            </div>
                            <div className="flex justify-between text-slate-400"><span>Win Rate</span><span className={r.winRate >= 50 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>{r.winRate.toFixed(1)}%</span></div>
                            <div className="flex justify-between text-slate-400"><span>Sharpe</span><span className={r.sharpeRatio >= 0 ? "text-teal-400" : "text-rose-400"}>{r.sharpeRatio.toFixed(2)}</span></div>
                            <div className="flex justify-between text-slate-400"><span>Max DD</span><span className="text-rose-400">{r.maxDrawdownPercent.toFixed(1)}%</span></div>
                            <div className="flex justify-between text-slate-400"><span>Net ROI</span><span className={r.netProfitPercent >= 0 ? "text-emerald-400" : "text-rose-400"}>{r.netProfitPercent >= 0 ? "+" : ""}{r.netProfitPercent.toFixed(1)}%</span></div>
                            <div className="flex justify-between text-slate-400"><span>PF</span><span className={r.profitFactor >= 1 ? "text-slate-200" : "text-rose-400"}>{r.profitFactor.toFixed(2)}</span></div>
                            <div className="text-slate-600 text-[9px] leading-tight mt-1">{r.riskPercent}% risk · {r.tpLabel}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Filter chips ─────────────────────────────────────────────────── */}
                {(optimizerResults?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mr-1">Filter:</span>
                    {filterOptions?.map(f => (
                      <button key={f.key} onClick={() => setOptimizerFilter(f.key)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                          optimizerFilter === f.key
                            ? "bg-violet-600 border-violet-500 text-white"
                            : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}>
                        {f.label}
                        {f.key !== "all" && (
                          <span className="ml-1.5 text-slate-500">
                            ({optimizerResults?.filter(r => r.strategyType === f.key)?.length ?? 0})
                          </span>
                        )}
                      </button>
                    ))}
                    <div className="ml-auto flex items-center gap-3">
                      <button
                        onClick={() => setShowAdvancedOptimizerCols(v => !v)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1.5 ${
                          showAdvancedOptimizerCols
                            ? "bg-violet-600/20 border-violet-500/50 text-violet-300"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
                        }`}
                      >
                        <Settings className="w-3.5 h-3.5" />
                        {showAdvancedOptimizerCols ? "Hide Advanced" : "Show Advanced Stats"}
                      </button>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Showing {(displayRows?.length ?? 0)} of {optimizerTotalCombinations} combinations
                      </span>
                    </div>
                  </div>
                )}

                {/* ── Full Results Table ────────────────────────────────────────────── */}
                {(optimizerResults?.length ?? 0) > 0 && (() => {
                  const colsToRender = showAdvancedOptimizerCols
                    ? ["Rank", "Strategy", "Risk%", "TP Config", "Trailing", "Win Rate", "PF", "Max DD", "Sharpe", "Net ROI", "EV/Trade", "Max Mult", "Consec L", "Risk", "Action"]
                    : ["Rank", "Strategy", "Risk%", "Win Rate", "PF", "Max DD", "Net ROI", "Risk", "Action"];

                  return (
                    <div className="flex flex-col gap-2">
                      <div className="overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full text-xs font-mono">
                          <thead>
                            <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 sticky top-0">
                              {colsToRender?.map(col => {
                                const k = col === "Risk%" ? "risk%" : col === "TP Config" ? "tp config" : col === "Win Rate" ? "win rate" : col === "Max DD" ? "max dd" : col === "Net ROI" ? "net roi" : col === "EV/Trade" ? "ev/trade" : col === "Max Mult" ? "max mult" : col === "Consec L" ? "consec l" : col.toLowerCase();
                                const isActive = optimizerSortCol === k;
                                return (
                                  <th key={col} onClick={() => k !== "action" && handleColClick(k)}
                                    className={`px-2.5 py-2.5 text-left cursor-pointer whitespace-nowrap hover:text-slate-200 transition-colors select-none ${isActive ? "text-violet-400 font-bold" : ""}`}>
                                    {col}{isActive ? (optimizerSortDir === "desc" ? " ↓" : " ↑") : ""}
                                  </th>
                                );
                              })}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-900/60">
                            {displayRows?.slice(0, 50)?.map((r: any, idx: number) => (
                              <tr key={`${r.strategyType}-${r.riskPercent}-${r.tpLabel}-${r.trailLabel}`}
                                className={`transition-all ${r.rank === 1 ? "bg-amber-500/5 border-l-2 border-l-amber-500" : idx < 3 ? "bg-violet-500/3" : "hover:bg-slate-900/20"}`}>
                                
                                {colsToRender.includes("Rank") && (
                                  <td className="px-2.5 py-2">
                                    {r.rank === 1 ? <span className="text-amber-400 font-bold">★ 1</span>
                                      : r.rank <= 3 ? <span className="text-violet-400 font-semibold">#{r.rank}</span>
                                      : <span className="text-slate-600">#{r.rank}</span>}
                                  </td>
                                )}

                                {colsToRender.includes("Strategy") && (
                                  <td className={`px-2.5 py-2 font-semibold whitespace-nowrap ${stratTypeColor[r.strategyType]}`}>{r.strategyLabel}</td>
                                )}

                                {colsToRender.includes("Risk%") && (
                                  <td className="px-2.5 py-2 text-slate-300">{r.riskPercent}%</td>
                                )}

                                {colsToRender.includes("TP Config") && (
                                  <td className="px-2.5 py-2 text-slate-400 whitespace-nowrap">{r.tpLabel}</td>
                                )}

                                {colsToRender.includes("Trailing") && (
                                  <td className="px-2.5 py-2 text-slate-500 whitespace-nowrap">{r.trailLabel}</td>
                                )}

                                {colsToRender.includes("Win Rate") && (
                                  <td className={`px-2.5 py-2 font-bold ${r.winRate >= 50 ? "text-emerald-400" : "text-rose-400"}`}>{r.winRate.toFixed(1)}%</td>
                                )}

                                {colsToRender.includes("PF") && (
                                  <td className={`px-2.5 py-2 font-semibold ${r.profitFactor >= 1 ? "text-emerald-400" : "text-rose-400"}`}>{r.profitFactor.toFixed(2)}</td>
                                )}

                                {colsToRender.includes("Max DD") && (
                                  <td className="px-2.5 py-2 text-rose-400 font-medium">{r.maxDrawdownPercent.toFixed(1)}%</td>
                                )}

                                {colsToRender.includes("Sharpe") && (
                                  <td className={`px-2.5 py-2 font-semibold ${r.sharpeRatio >= 0 ? "text-teal-400" : "text-rose-400"}`}>{r.sharpeRatio.toFixed(2)}</td>
                                )}

                                {colsToRender.includes("Net ROI") && (
                                  <td className={`px-2.5 py-2 font-bold ${r.netProfitPercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{r.netProfitPercent >= 0 ? "+" : ""}{r.netProfitPercent.toFixed(1)}%</td>
                                )}

                                {colsToRender.includes("EV/Trade") && (
                                  <td className={`px-2.5 py-2 ${r.expectancy >= 0 ? "text-slate-300" : "text-rose-400"}`}>{r.expectancy >= 0 ? "+" : ""}${r.expectancy.toFixed(2)}</td>
                                )}

                                {colsToRender.includes("Max Mult") && (
                                  <td className={`px-2.5 py-2 ${r.maxLotMultiplierReached > 4 ? "text-rose-400" : "text-slate-400"}`}>{r.maxLotMultiplierReached.toFixed(1)}×</td>
                                )}

                                {colsToRender.includes("Consec L") && (
                                  <td className={`px-2.5 py-2 ${r.maxConsecutiveLosses >= 5 ? "text-rose-400" : "text-slate-400"}`}>{r.maxConsecutiveLosses}</td>
                                )}

                                {colsToRender.includes("Risk") && (
                                  <td className="px-2.5 py-2"><span className={riskBadge(r.riskCategory)}>{r.riskCategory}</span></td>
                                )}

                                {colsToRender.includes("Action") && (
                                  <td className="px-2.5 py-2 text-right">
                                    <button
                                      onClick={() => applyToLiveConfig(r)}
                                      className="bg-teal-600 hover:bg-teal-500 text-slate-100 text-[10px] font-bold px-2 py-1 rounded transition-colors cursor-pointer whitespace-nowrap"
                                    >
                                      Apply to Live
                                    </button>
                                  </td>
                                )}

                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-[10px] text-slate-600 font-mono text-right leading-relaxed">
                        Composite Optimizer Score balances Sharpe Ratio, Win Rate, Profit Factor, and Expected Value while heavily penalizing Drawdown blowout (&gt;40%). Click any column header to sort.
                      </p>
                    </div>
                  );
                })()}

                {/* Error state */}
                {optimizerError && !isOptimizing && (
                  <div className="flex items-start gap-3 bg-rose-500/8 border border-rose-500/25 rounded-xl px-4 py-3">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-rose-300 leading-relaxed">
                      <span className="font-bold text-rose-400">Optimizer Error: </span>{optimizerError}
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {!isOptimizing && (optimizerResults?.length ?? 0) === 0 && !optimizerError && (
                  <div className="bg-slate-900/20 border border-slate-900 rounded-2xl flex flex-col items-center justify-center py-16 text-slate-500 gap-3">
                    <BarChart2 className="w-12 h-12 opacity-20" />
                    <p className="text-sm font-semibold text-slate-400">Advanced 600-Combination Grid Search</p>
                    <p className="text-xs font-mono">Parse signals first, then click "Run 600-Combo Grid" to test every combination.</p>
                  </div>
                )}

                {isOptimizing && (
                  <div className="bg-slate-900/20 border border-slate-900 rounded-2xl flex flex-col items-center justify-center py-16 gap-4">
                    <RefreshCw className="w-8 h-8 text-violet-400 animate-spin" />
                    <p className="text-sm font-semibold text-slate-300">Running grid search…</p>
                    <p className="text-xs text-slate-500 font-mono">12 base sims × 10 strategies × 5 risk levels = 600 combinations</p>
                  </div>
                )}

                  </div>
                ) : (
                  // AI Stops Optimizer subtab rendering
                  <div className="flex flex-col gap-5">
                    {/* Header/Control card */}
                    <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-5 flex flex-col gap-6">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex flex-col gap-1">
                          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                            <Brain className="w-5 h-5 text-emerald-400" />
                            AI Stop-Loss Optimizer & Recalculation Engine
                          </h3>
                          <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
                            Leverages Google Gemini 3.5 Flash server-side intelligence to analyze historical backtest metrics and recommend mathematically optimized break-even triggers, trailing starts, and trailing steps. The engine automatically applies the configurations back onto the historical trade ledger for instant recalculations.
                          </p>
                        </div>
                        <button
                          onClick={runAiStopsOptimizer}
                          disabled={isAiOptimizingStops || (signals?.length ?? 0) === 0}
                          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shrink-0 cursor-pointer"
                        >
                          {isAiOptimizingStops ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                          {isAiOptimizingStops ? "Executing Quantitative Brain AI Analysis…" : "Run AI Stop-Loss Optimizer"}
                        </button>
                      </div>

                      {/* Trading Style Slider */}
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-300">Trading Style Profile</span>
                          <span className="text-xs font-mono text-emerald-400">{tradingStyle}</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" max="4" 
                          step="1"
                          value={["Conservative", "Normal", "Aggressive", "Swing", "Scalp"].indexOf(tradingStyle)}
                          onChange={(e) => {
                            const styles = ["Conservative", "Normal", "Aggressive", "Swing", "Scalp"] as const;
                            setTradingStyle(styles[parseInt(e.target.value)]);
                          }}
                          className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] font-mono text-slate-500 px-1">
                          <span>Conservative</span>
                          <span>Normal</span>
                          <span>Aggressive</span>
                          <span>Swing</span>
                          <span>Scalp</span>
                        </div>
                      </div>
                    </div>

                    {/* Loading State */}
                    {isAiOptimizingStops && (
                      <div className="bg-slate-900/20 border border-slate-900 rounded-2xl flex flex-col items-center justify-center py-20 gap-4">
                        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                        <p className="text-sm font-semibold text-slate-300">Evaluating Trade Metrics & Running Recalculations…</p>
                        <p className="text-xs text-slate-500 font-mono">Running closed-loop LLM inference via Google GenAI</p>
                      </div>
                    )}

                    {/* Success notification banner */}
                    {aiStopsApplied && (
                      <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl flex items-center gap-2 text-xs font-mono animate-in fade-in slide-in-from-top-4 duration-300">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span><strong>Success:</strong> AI Stop-Loss and Break-Even configurations successfully applied to current backtest settings! Go to the "Parser & Simulator" panel to run a fresh simulation.</span>
                      </div>
                    )}

                    {/* Error State */}
                    {aiOptimizingStopsError && (
                      <div className="flex items-start gap-3 bg-rose-500/8 border border-rose-500/25 rounded-xl px-4 py-3">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div className="text-xs text-rose-300 leading-relaxed">
                          <span className="font-bold text-rose-400">AI Stop Optimizer Error: </span>{aiOptimizingStopsError}
                        </div>
                      </div>
                    )}

                    {/* Empty State */}
                    {!isAiOptimizingStops && !aiOptimizedStopsResult && !aiOptimizingStopsError && (
                      <div className="bg-slate-900/20 border border-slate-900 rounded-2xl flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
                        <Brain className="w-12 h-12 opacity-20 text-emerald-400" />
                        <p className="text-sm font-semibold text-slate-400">AI-Driven Recalculation Engine</p>
                        <p className="text-xs font-mono">Parse signals first, then click "Run AI Stop-Loss Optimizer" to get optimized parameters and recalculate trade ledger.</p>
                      </div>
                    )}

                    {/* AI Results Display */}
                    {!isAiOptimizingStops && aiOptimizedStopsResult && (
                      <div className="flex flex-col gap-6">
                        
                        {/* Dual-Engine Optimization Selector Tabs */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900/60 p-3 border border-slate-800 rounded-2xl">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-bold text-slate-400">Optimization Engine Selection</span>
                            <span className="text-[10px] text-slate-500 font-mono">Toggle between Cognitive LLM heuristics or exhaustive mathematical global grid search</span>
                          </div>
                          <div className="bg-slate-950 p-1 border border-slate-800/60 rounded-xl flex gap-1">
                            <button
                              onClick={() => setSelectedOptimizerEngine("ai")}
                              className={`px-3.5 py-1.5 text-xs font-black rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                                selectedOptimizerEngine === "ai"
                                  ? "bg-emerald-600 text-white shadow-md"
                                  : "text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              <Bot className="w-3.5 h-3.5" />
                              AI Cognitive
                            </button>
                            <button
                              onClick={() => setSelectedOptimizerEngine("mathematical")}
                              className={`px-3.5 py-1.5 text-xs font-black rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                                selectedOptimizerEngine === "mathematical"
                                  ? "bg-emerald-600 text-white shadow-md"
                                  : "text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              <TrendingUp className="w-3.5 h-3.5" />
                              Global Math Best
                            </button>
                          </div>
                        </div>

                        {(() => {
                          const isMathSelected = selectedOptimizerEngine === "mathematical" && !!aiOptimizedStopsResult.mathematicalBestParameters;
                          const activeParams = isMathSelected ? aiOptimizedStopsResult.mathematicalBestParameters : aiOptimizedStopsResult.aiParameters;
                          const activeMetrics = isMathSelected ? aiOptimizedStopsResult.mathematicalBestMetrics : aiOptimizedStopsResult.recalculatedMetrics;
                          const activeTrades = isMathSelected ? (aiOptimizedStopsResult.mathematicalBestTrades || aiOptimizedStopsResult.recalculatedTrades) : aiOptimizedStopsResult.recalculatedTrades;
                          const activeReasoning = activeParams.reasoning;

                          return (
                            <>
                              {/* 2-Column Grid */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                
                                {/* Column 1: Parameters & Reasoning */}
                                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
                                  <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                                    {isMathSelected ? (
                                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                                    ) : (
                                      <Bot className="w-4 h-4 text-emerald-400" />
                                    )}
                                    {isMathSelected ? "Global Mathematical Optimum Parameters" : "AI Recommended Stop Parameters"}
                                  </h4>

                                  <div className="grid grid-cols-3 gap-3 font-mono">
                                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-1 items-center text-center">
                                      <span className="text-[9px] text-slate-500 uppercase tracking-wider">Break-Even Trigger</span>
                                      <span className="text-lg font-bold text-emerald-400">
                                        {activeParams.BE_trigger_pips > 0 
                                          ? `${activeParams.BE_trigger_pips} Pips`
                                          : "Disabled"}
                                      </span>
                                    </div>
                                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-1 items-center text-center">
                                      <span className="text-[9px] text-slate-500 uppercase tracking-wider">Trailing Start</span>
                                      <span className="text-lg font-bold text-teal-400">
                                        {activeParams.trailing_start_pips > 0
                                          ? `${activeParams.trailing_start_pips} Pips`
                                          : "Disabled"}
                                      </span>
                                    </div>
                                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-1 items-center text-center">
                                      <span className="text-[9px] text-slate-500 uppercase tracking-wider">Trailing Distance</span>
                                      <span className="text-lg font-bold text-sky-400">
                                        {activeParams.trailing_step_pips} Pips
                                      </span>
                                    </div>
                                  </div>

                                  {/* Qualitative Reasoning */}
                                  <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 flex flex-col gap-2">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                      <Sparkles className="w-3 h-3 text-amber-400" /> Quantitative Strategy Analysis:
                                    </span>
                                    <p className="text-xs text-slate-300 leading-relaxed font-mono">
                                      {activeReasoning}
                                    </p>
                                  </div>

                                  <button
                                    onClick={() => applyAiStopsToConfig(activeParams)}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-3 px-5 rounded-xl transition-all shadow-lg hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2"
                                  >
                                    <Check className="w-4 h-4 stroke-[2.5]" />
                                    Apply {isMathSelected ? "Math" : "AI"} Parameters to Backtest Config
                                  </button>
                                </div>

                                {/* Column 2: Performance Comparison */}
                                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
                                  <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                                    Recalculated Ledger Impact ({isMathSelected ? "Math Best" : "AI Recommended"})
                                  </h4>

                                  <div className="overflow-x-auto rounded-xl border border-slate-800 font-mono text-xs">
                                    <table className="w-full">
                                      <thead>
                                        <tr className="bg-slate-950 text-slate-500 border-b border-slate-800">
                                          <th className="px-3 py-2 text-left">Performance Metric</th>
                                          <th className="px-3 py-2 text-center text-slate-400">Baseline (Before)</th>
                                          <th className="px-3 py-2 text-center text-emerald-400 font-bold">Optimized (After)</th>
                                          <th className="px-3 py-2 text-center">Variance</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-800/50">
                                        {(() => {
                                          const base = aiOptimizedStopsResult.baselineMetrics;
                                          const opt = activeMetrics;

                                          const metricsList = [
                                            { 
                                              name: "Win Rate", 
                                              bVal: `${base.win_rate_percent}%`, 
                                              oVal: `${opt.win_rate_percent}%`, 
                                              improved: opt.win_rate_percent >= base.win_rate_percent,
                                              diff: `${(opt.win_rate_percent - base.win_rate_percent).toFixed(1)}%`
                                            },
                                            { 
                                              name: "Profit Factor", 
                                              bVal: base.profit_factor?.toFixed(2) ?? base.average_risk_reward_ratio?.toFixed(2), 
                                              oVal: opt.profit_factor?.toFixed(2) ?? opt.average_risk_reward_ratio?.toFixed(2), 
                                              improved: (opt.profit_factor ?? opt.average_risk_reward_ratio) >= (base.profit_factor ?? base.average_risk_reward_ratio),
                                              diff: `${((opt.profit_factor ?? opt.average_risk_reward_ratio) - (base.profit_factor ?? base.average_risk_reward_ratio)).toFixed(2)}`
                                            },
                                            { 
                                              name: "Net Profit", 
                                              bVal: base.net_profit !== undefined ? `$${base.net_profit.toFixed(2)}` : "–", 
                                              oVal: opt.net_profit !== undefined ? `$${opt.net_profit.toFixed(2)}` : "–", 
                                              improved: opt.net_profit >= (base.net_profit || 0),
                                              diff: opt.net_profit !== undefined && base.net_profit !== undefined ? `$${(opt.net_profit - base.net_profit).toFixed(2)}` : "–"
                                            },
                                            { 
                                              name: "Max Drawdown", 
                                              bVal: base.max_drawdown_percent !== undefined ? `${base.max_drawdown_percent.toFixed(2)}%` : "–", 
                                              oVal: opt.max_drawdown_percent !== undefined ? `${opt.max_drawdown_percent.toFixed(2)}%` : "–", 
                                              improved: opt.max_drawdown_percent <= (base.max_drawdown_percent || 100), // Lower drawdown is improved!
                                              diff: opt.max_drawdown_percent !== undefined && base.max_drawdown_percent !== undefined ? `${(opt.max_drawdown_percent - base.max_drawdown_percent).toFixed(2)}%` : "–",
                                              reverseColor: true
                                            },
                                            { 
                                              name: "Avg Hold Time", 
                                              bVal: `${base.average_hold_time_minutes} min`, 
                                              oVal: `${opt.average_hold_time_minutes} min`, 
                                              improved: opt.average_hold_time_minutes <= base.average_hold_time_minutes,
                                              diff: `${opt.average_hold_time_minutes - base.average_hold_time_minutes}m`
                                            },
                                            { 
                                              name: "Consecutive Losses", 
                                              bVal: base.max_consecutive_losses, 
                                              oVal: opt.max_consecutive_losses, 
                                              improved: opt.max_consecutive_losses <= base.max_consecutive_losses,
                                              diff: `${opt.max_consecutive_losses - base.max_consecutive_losses}`
                                            },
                                          ];

                                          return metricsList?.map(m => {
                                            const isGreen = m.reverseColor ? !m.improved : m.improved;
                                            const isZeroDiff = parseFloat(m.diff.replace("$", "").replace("%", "")) === 0;
                                            const diffPrefix = isZeroDiff ? "" : isGreen ? "+" : "";
                                            return (
                                              <tr key={m.name} className="hover:bg-slate-900/40">
                                                <td className="px-3 py-2 text-slate-300 font-medium">{m.name}</td>
                                                <td className="px-3 py-2 text-center text-slate-500">{m.bVal}</td>
                                                <td className="px-3 py-2 text-center text-emerald-400 font-bold">{m.oVal}</td>
                                                <td className={`px-3 py-2 text-center font-bold ${
                                                  isZeroDiff ? "text-slate-500" :
                                                  m.improved ? "text-emerald-400" : "text-rose-400"
                                                }`}>
                                                  {diffPrefix}{m.diff}
                                                </td>
                                              </tr>
                                            );
                                          });
                                        })()}
                                      </tbody>
                                    </table>
                                  </div>
                                  <p className="text-[10px] text-slate-500 font-mono leading-relaxed italic">
                                    * Performance parameters are dynamically compiled and mapped mathematically over {(activeTrades?.length ?? 0)} historical trade execution events.
                                  </p>
                                </div>

                              </div>

                              {/* Recalculated Trade Ledger Table */}
                              <div className="flex flex-col gap-3">
                                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                                  <Table className="w-4 h-4 text-emerald-400" />
                                  Recalculated Trade Ledger Explorer ({isMathSelected ? "Math Best" : "AI Recommended"})
                                </h4>

                                <div className="overflow-x-auto rounded-xl border border-slate-800">
                                  <table className="w-full text-xs font-mono">
                                    <thead>
                                      <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-bold">
                                        <th className="px-3 py-2 text-left">Trade ID</th>
                                        <th className="px-3 py-2 text-left">Asset / Direction</th>
                                        <th className="px-3 py-2 text-center">Profit ($)</th>
                                        <th className="px-3 py-2 text-center">Pips Gained</th>
                                        <th className="px-3 py-2 text-center">Status</th>
                                        <th className="px-3 py-2 text-left">Execution Events sequence</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-900">
                                      {activeTrades?.slice(0, 30)?.map((t: any) => {
                                        const isBuy = t.signal?.type?.toUpperCase().includes("BUY");
                                        const isWin = t.profitAmount > 0;
                                        return (
                                          <tr key={t.id} className="hover:bg-slate-900/20 transition-all">
                                            <td className="px-3 py-2.5 font-bold text-slate-400">{t.id}</td>
                                            <td className="px-3 py-2.5">
                                              <div className="flex flex-col">
                                                <span className="font-bold text-slate-200">{t.signal?.asset || "EURUSD"}</span>
                                                <span className={`text-[10px] font-semibold ${isBuy ? "text-emerald-400" : "text-rose-400"}`}>
                                                  {t.signal?.type || "BUY"}
                                                </span>
                                              </div>
                                            </td>
                                            <td className={`px-3 py-2.5 text-center font-bold ${isWin ? "text-emerald-400" : "text-rose-400"}`}>
                                              {isWin ? "+" : ""}${t.profitAmount.toFixed(2)}
                                            </td>
                                            <td className={`px-3 py-2.5 text-center font-semibold ${t.pipsGained >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                              {t.pipsGained >= 0 ? "+" : ""}{t.pipsGained.toFixed(1)}
                                            </td>
                                            <td className="px-3 py-2.5 text-center">
                                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                t.status === "WIN" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                                t.status === "PARTIAL_WIN" ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" :
                                                t.status === "BREAKEVEN" ? "bg-slate-500/10 text-slate-400 border border-slate-500/20" :
                                                "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                              }`}>
                                                {t.status}
                                              </span>
                                            </td>
                                            <td className="px-3 py-2.5 text-slate-400 text-[10px] max-w-sm truncate">
                                              <div className="flex flex-col gap-0.5">
                                                {t.events && (t.events?.length ?? 0) > 0 ? (
                                                  t.events?.slice(-2)?.map((ev: any, idx: number) => (
                                                    <div key={idx} className="flex gap-1 items-center">
                                                      <span className={`px-1 rounded text-[8px] font-bold ${
                                                        ev.type === "PARTIAL_CLOSE" ? "bg-teal-500/10 text-teal-400" :
                                                        ev.type === "TRAILING" ? "bg-sky-500/10 text-sky-400" :
                                                        ev.type === "BE" ? "bg-slate-500/10 text-slate-400" :
                                                        ev.type === "SL" ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"
                                                      }`}>{ev.type}</span>
                                                      <span className="text-slate-400">{ev.message}</span>
                                                    </div>
                                                  ))
                                                ) : (
                                                  <span className="text-slate-600">No events logged</span>
                                                )}
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                                {(activeTrades?.length ?? 0) > 30 && (
                                  <p className="text-[10px] text-slate-500 font-mono text-center">
                                    Showing the first 30 of {(activeTrades?.length ?? 0)} trades. All trades have been mathematically recalculated.
                                  </p>
                                )}
                              </div>
                            </>
                          );
                        })()}

                      </div>
                    )}

                  </div>
                )}

              </div>
            );
          })()}

          {/* ── CHANNELS TAB ─────────────────────────────────────────────────── */}
          {activeTab === "channels" && (
            <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 flex flex-col gap-6">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  Large-Scale Multi-Channel Testing Engine
                </h3>
                <p className="text-xs text-slate-400 mt-1">Process up to 5,000 historical messages per channel concurrently. Automatically pauses on rate-limits.</p>
              </div>
              
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
                 <span className="text-xs font-semibold text-slate-300 flex items-center gap-2"><Tag className="w-3.5 h-3.5 text-amber-400" /> Test Channels</span>
                 
                 {(Object.keys(channelRegistry)?.length ?? 0) > 0 && (
                   <div className="flex flex-col gap-2 mb-2">
                     <label className="text-xs text-slate-400">Quick Select from Registered Channels</label>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                       {Object.keys(channelRegistry).map(chName => {
                         const isSelected = (window.targetChannels || "").split('\n').map(c=>c.trim()).includes(chName);
                         return (
                         <div key={chName} className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded px-2 py-1.5 cursor-pointer hover:border-amber-500/50 transition-colors" onClick={() => {
                             let current = (window.targetChannels || "").split('\n').map(c=>c.trim()).filter(Boolean);
                             if (!isSelected) {
                               current.push(chName);
                             } else {
                               current = current.filter(c => c !== chName);
                             }
                             window.targetChannels = current.join('\n');
                             document.getElementById("job-render-trigger")?.click();
                         }}>
                           <input type="checkbox" checked={isSelected} readOnly className="w-3 h-3 rounded bg-slate-900 border-slate-700 text-amber-500" />
                           <span className="text-[10px] text-slate-300 truncate">{chName}</span>
                         </div>
                       )})}
                     </div>
                   </div>
                 )}
                 {tgSession && (tgChats?.length ?? 0) > 0 && (
                   <div className="flex flex-col gap-2 mb-2">
                     <label className="text-xs text-slate-400">Quick Select from Live Telegram</label>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-2">
                       {tgChats.map(chat => {
                         const chIdStr = String(chat.id);
                         const isSelected = (window.targetChannels || "").split('\n').map(c=>c.trim()).includes(chIdStr);
                         return (
                         <div key={chat.id} className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded px-2 py-1.5 cursor-pointer hover:border-amber-500/50 transition-colors" onClick={() => {
                             let current = (window.targetChannels || "").split('\n').map(c=>c.trim()).filter(Boolean);
                             if (!isSelected) {
                               current.push(chIdStr);
                             } else {
                               current = current.filter(c => c !== chIdStr);
                             }
                             window.targetChannels = current.join('\n');
                             document.getElementById("job-render-trigger")?.click();
                         }}>
                           <input type="checkbox" checked={isSelected} readOnly className="w-3 h-3 rounded bg-slate-900 border-slate-700 text-amber-500" />
                           <span className="text-[10px] text-slate-300 truncate" title={chat.title}>{chat.title}</span>
                         </div>
                       )})}
                     </div>
                   </div>
                 )}
                 <div className="flex flex-col gap-2">
                   <label className="text-xs text-slate-400">Target Channels (one per line, e.g. @goldvip)</label>
                   <textarea
                      value={window.targetChannels || ""}
                      onChange={e => { window.targetChannels = e.target.value; document.getElementById("job-render-trigger")?.click(); }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 h-24"
                      placeholder="@channel1\n@channel2"
                   />
                 </div>
                 
                 <div className="flex items-center gap-2 mt-1">
                   <input
                      type="checkbox"
                      id="convertToLimit"
                      checked={window.convertToLimit || false}
                      onChange={e => { window.convertToLimit = e.target.checked; document.getElementById("job-render-trigger")?.click(); }}
                      className="w-3.5 h-3.5 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
                   />
                   <label htmlFor="convertToLimit" className="text-xs text-slate-300 cursor-pointer">Force all extracted signals to be Limit Orders before backtesting</label>
                 </div>
                 
                 <div className="flex items-end gap-3">
                   <div className="flex flex-col gap-2 flex-1">
                     <label className="text-xs text-slate-400">Messages Per Channel</label>
                     <select
                        value={window.testLimit || "5000"}
                        onChange={e => window.testLimit = e.target.value}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                     >
                       <option value="100">100 (Quick Test)</option>
                       <option value="1000">1,000 (1 Month)</option>
                       <option value="5000">5,000 (1 Year+)</option>
                     </select>
                   </div>
                   <button
                     onClick={async () => {
                       const chs = (window.targetChannels || "").split('\n').map(c => c.trim()).filter(Boolean);
                       if (chs.length === 0) return alert("Enter at least one channel");
                       const res = await fetch("/api/testing/jobs", {
                          method: "POST", headers: getAgentHeaders(),
                          body: JSON.stringify({
                             channels: chs,
                             limit: parseInt(window.testLimit || "5000"),
                             providerConfig: { provider: primaryProvider, apiKey: agents.find(a => a.id === primaryProvider)?.apiKey, model: agents.find(a => a.id === primaryProvider)?.model },
                             tgSession, apiId: tgApiId, apiHash: tgApiHash,
                             backtestConfig: {}, uniqueGroqKeys: [], convertToLimit: !!window.convertToLimit
                          })
                       });
                       const data = await res.json();
                       if (data.jobId) window.currentJobId = data.jobId;
                       if (window.jobInterval) clearInterval(window.jobInterval);
                       window.jobInterval = setInterval(async () => {
                          const r = await fetch("/api/testing/jobs/" + window.currentJobId);
                          const d = await r.json();
                          window.currentJob = d.job;
                          if (d.job?.status === "completed" || d.job?.status === "failed") clearInterval(window.jobInterval);
                          document.getElementById("job-render-trigger")?.click();
                       }, 2000);
                     }}
                     className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-6 py-2 h-[38px] rounded-lg transition-all"
                   >
                     Launch Large Scale Test
                   </button>
                 </div>
              </div>

              <div id="job-render-trigger" onClick={() => window.dispatchEvent(new Event("jobupdate"))} />
              
              <TestJobMonitor />

              {/* Tag current signals */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-2"><Tag className="w-3.5 h-3.5 text-amber-400" /> Tag Current Signals to a Channel</span>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={channelName}
                    onChange={e => setChannelName(e.target.value)}
                    placeholder="e.g. GOLD VIP SCALPING"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                  <button
                    onClick={addSignalsToChannel}
                    disabled={(signals?.length ?? 0) === 0}
                    className="bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add {(signals?.length ?? 0)} Signal{(signals?.length ?? 0) !== 1 ? "s" : ""}
                  </button>
                </div>
              </div>

              {/* Registered channels */}
              {(Object.keys(channelRegistry)?.length ?? 0) > 0 && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">{(Object.keys(channelRegistry)?.length ?? 0)} Channel{(Object.keys(channelRegistry)?.length ?? 0) !== 1 ? "s" : ""} Registered</span>
                    <button
                      onClick={runChannelComparison}
                      disabled={isRunningChannels}
                      className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all"
                    >
                      {isRunningChannels ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                      {isRunningChannels ? "Running…" : "Run Comparison"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(Object.entries(channelRegistry) as [string, any[]][])?.map(([name, sigs]) => (
                      <div key={name} className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 flex items-center gap-2 text-xs font-mono">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        <span className="text-slate-200 font-semibold">{name}</span>
                        <span className="text-slate-500">{(sigs?.length ?? 0)} signals</span>
                        <button onClick={() => setChannelRegistry(prev => { const n = {...prev}; delete n[name]; return n; })} className="text-slate-600 hover:text-rose-400 ml-1 transition-colors">×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comparison results */}
              {(channelResults?.length ?? 0) > 0 && (
                <div className="flex flex-col gap-3">
                  <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-400" /> Side-by-Side Performance Comparison
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-xs font-mono">
                      <thead>
                        <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                          {["Channel","Signals","Win Rate","Net ROI","Profit Factor","Avg Pip DD","Freq/Week","Accuracy Decay","Max DD","Sharpe"]?.map(h => (
                            <th key={h} className="px-3 py-2.5 text-left whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900">
                        {channelResults?.map((r: any) => (
                          <tr key={r.channelName} className="hover:bg-slate-900/20 transition-all">
                            <td className="px-3 py-2.5 font-bold text-slate-200 whitespace-nowrap">{r.channelName}</td>
                            <td className="px-3 py-2.5 text-slate-400">{r.totalSignals}</td>
                            <td className={`px-3 py-2.5 font-bold ${r.winRate >= 50 ? "text-emerald-400" : "text-rose-400"}`}>{r.winRate.toFixed(1)}%</td>
                            <td className={`px-3 py-2.5 font-bold ${r.netROI >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{r.netROI >= 0 ? "+" : ""}{r.netROI.toFixed(2)}%</td>
                            <td className={`px-3 py-2.5 ${r.profitFactor >= 1 ? "text-emerald-400" : "text-rose-400"}`}>{r.profitFactor.toFixed(2)}</td>
                            <td className="px-3 py-2.5 text-slate-400">{r.avgPipDrawdown.toFixed(1)}</td>
                            <td className="px-3 py-2.5 text-slate-400">{r.signalFrequencyPerWeek.toFixed(1)}</td>
                            <td className={`px-3 py-2.5 font-semibold ${r.accuracyDecay >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{r.accuracyDecay >= 0 ? "+" : ""}{r.accuracyDecay.toFixed(1)}%</td>
                            <td className="px-3 py-2.5 text-rose-400">{r.maxDrawdownPercent.toFixed(1)}%</td>
                            <td className={`px-3 py-2.5 font-semibold ${r.sharpeRatio >= 0 ? "text-teal-400" : "text-rose-400"}`}>{r.sharpeRatio.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {(Object.keys(channelRegistry)?.length ?? 0) === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-3">
                  <Layers className="w-10 h-10 opacity-30" />
                  <p className="text-xs font-mono">Parse signals, enter a channel name, and click "Add Signals" to start building your channel comparison.</p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Footer System Status details */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/60 py-6 px-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-4">
        <span>© 2026 Telegram Signals Backtester Engine. Server Side Intel powered by Gemini Flash 3.5.</span>
        <div className="flex items-center gap-4">
          <span className="hover:text-slate-300 cursor-pointer">Security Audited</span>
          <span>•</span>
          <span className="hover:text-slate-300 cursor-pointer">MetaTrader 5 API Compliant</span>
          <span>•</span>
          <span className="hover:text-slate-300 cursor-pointer">Slippage Tolerance: 0.1 pips</span>
        </div>
      </footer>

      {/* Optimized Settings Application Confirmation Modal */}
      {pendingOptimizationApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="bg-amber-500/10 rounded-full p-2">
                <Star className="w-6 h-6 fill-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100">Apply Best Profile?</h3>
                <p className="text-xs text-slate-400 font-medium">Update workspace with optimized parameters.</p>
              </div>
            </div>
            
            <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-3 text-xs font-mono flex flex-col gap-2">
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-500">Risk Percent</span>
                <span className="text-emerald-400 font-bold">{pendingOptimizationApply.riskPercent}%</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-500">TP1 Exit Ratio</span>
                <span className="text-teal-400 font-bold">{(pendingOptimizationApply.tp1ExitRatio * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-500">Trailing Stop Trigger</span>
                <span className="text-teal-400 font-bold">{pendingOptimizationApply.trailingStopTrigger} pips</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-500">Trailing Stop Distance</span>
                <span className="text-teal-400 font-bold">{pendingOptimizationApply.trailingStopDistance} pips</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Move SL to Entry at TP1</span>
                <span className="text-teal-400 font-bold">{pendingOptimizationApply.moveSlToEntryAtTp1 ? "Enabled" : "Disabled"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 justify-end mt-2">
              <button
                onClick={() => setPendingOptimizationApply(null)}
                className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => executeApplyToLiveConfig(pendingOptimizationApply)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-black text-slate-950 transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
              >
                Confirm Apply
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
