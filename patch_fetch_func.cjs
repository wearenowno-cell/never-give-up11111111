const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const fetchChatMessagesAndParse = async \(chatId: string\) => \{[\s\S]*?setIsFetchingMessages\(false\);\s*\}\s*\};\s*const filteredChats = useMemo/m;

const replacement = `const fetchChatMessagesAndParse = async (chatIds: string[]) => {
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

      const concatText = allMsgs.map((m: any) => m.text).reverse().join("\\n\\n");
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
              backupModel: backupAgent?.endpoint || "llama-3.3-70b-versatile"
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
            id: \`SIG_\${crypto.randomUUID().replace(/-/g, "_")}\`
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
  
  const filteredChats = useMemo`;

code = code.replace(regex, replacement);

// Also need to import CloudDownload
if(!code.includes('CloudDownload')) {
   code = code.replace(/import \{([\s\S]*?)\} from "lucide-react";/, (match, p1) => {
       return `import { CloudDownload, ${p1.trim()} } from "lucide-react";`;
   });
}

fs.writeFileSync('src/App.tsx', code);
console.log("Patched fetch func and import");
