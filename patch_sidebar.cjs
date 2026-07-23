const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add state for selected chats
code = code.replace(
  'const [selectedChatId, setSelectedChatId] = useState<string | null>(null);',
  'const [selectedChatIds, setSelectedChatIds] = useState<string[]>([]);\n  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);'
);

// 2. Modify fetchChatMessagesAndParse
const oldFetch = `const fetchChatMessagesAndParse = async (chatId: string) => {
    if (!tgSession) return;
    setSelectedChatId(chatId);
    setIsFetchingMessages(true);
    setTgError(null);
    setParseError(null);
    try {
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
      if (!response.ok) throw new Error(data.error || "Failed to fetch messages");
      
      const msgs = data.messages || [];
      if ((msgs?.length ?? 0) === 0) {
        throw new Error("No recent messages matching period filters found in this chat.");
      }

      // Concatenate texts with nice divider
      const concatText = msgs
        ?.map((m: any) => m.text)
        .reverse()
        .join("\\n\\n");
      setInputText(concatText);
      
      // Transition from message fetching to AI parsing state
      setIsFetchingMessages(false);
      setIsParsing(true);
      const primaryAgent = agents.find(a => a.id === primaryProvider);
      const backupAgent = agents.find(a => a.id === backupProvider);
      const textToSend = preFilterActive ? preFilterText(concatText) : concatText;

      try {
        const parseRes = await fetch("/api/parse-signals", {
          method: "POST",
          headers: getAgentHeaders(),
          body: JSON.stringify({ 
            text: textToSend, 
            messages: msgs,
            provider: primaryAgent?.id || "gemini",
            apiKey: primaryAgent?.apiKey || "",
            model: primaryAgent?.endpoint || "gemini-2.5-flash",
            backupProvider: backupAgent && backupAgent.isActive ? (backupAgent.id || "none") : "none",
            backupApiKey: backupAgent?.apiKey || "",
            backupModel: backupAgent?.endpoint || "llama-3.3-70b-versatile"
          }),
        });

        const parseData = await parseRes.json();
        if (!parseRes.ok) throw new Error(parseData.error || "Failed to parse signals");

        if (parseData && parseData.signals) {
          const structuredSignals = parseData.signals?.map((s: any, idx: number) => ({
            ...s,
            id: \`SIG_\${crypto.randomUUID().replace(/-/g, "_")}\`
          }));
          // Append to the existing Signal Database instead of replacing it -- otherwise each
          // new Telegram sync/parse silently wipes out every signal found in earlier batches.
          setSignals(prev => [...prev, ...structuredSignals]);
          setActiveTab("signals"); // Auto reveal signal grid!
        } else {
          throw new Error("No signal arrays parsed.");
        }
      } catch (parseErr: any) {
        setParseError(parseErr.message || "Failed to parse signals with configured engine.");
        setTgError(parseErr.message || "Failed to parse signals with configured engine.");
      } finally {
        setIsParsing(false);
      }
    } catch (err: any) {
      setTgError(err.message || "Failed to load messages from Telegram chat.");
    } finally {
      setIsFetchingMessages(false);
    }
  };`;

const newFetch = `const fetchChatMessagesAndParse = async (chatIds: string[]) => {
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
  };`;

code = code.replace(oldFetch, newFetch);

// 3. Update Custom Chat input
code = code.replace(
  'onClick={() => fetchChatMessagesAndParse(tgCustomChat.trim())}',
  'onClick={() => fetchChatMessagesAndParse([tgCustomChat.trim()])}'
);

// 4. Update the mapping loop to handle checkboxes
const oldMap = `filteredChats?.map((chat) => (
                          <button
                            key={chat.id}
                            disabled={isFetchingMessages}
                            onClick={() => fetchChatMessagesAndParse(chat.id)}
                            className={\`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 \${
                              selectedChatId === chat.id
                                ? "bg-slate-800/80 border-teal-500/40 text-slate-100"
                                : chat.isJoined === false
                                ? "bg-teal-950/5 border-teal-500/10 text-teal-300/90 hover:bg-teal-950/15 hover:border-teal-500/20"
                                : "bg-slate-950/20 border-slate-900/60 text-slate-400 hover:bg-slate-900 hover:text-slate-200 hover:border-slate-800"
                            }\`}
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <div className={\`p-1.5 rounded-lg shrink-0 \${
                                chat.isJoined === false
                                  ? "bg-teal-400/10 text-teal-400"
                                  : chat.isChannel
                                   ? "bg-teal-500/10 text-teal-400"
                                   : "bg-blue-500/10 text-blue-400"
                              }\`}>
                                <MessageSquare className="w-3.5 h-3.5" />
                              </div>`;

const newMap = `filteredChats?.map((chat) => {
                          const isSel = selectedChatIds.includes(String(chat.id));
                          return (
                          <button
                            key={chat.id}
                            disabled={isFetchingMessages}
                            onClick={() => {
                               setSelectedChatIds(prev => isSel ? prev.filter(id => id !== String(chat.id)) : [...prev, String(chat.id)]);
                            }}
                            className={\`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 \${
                              isSel
                                ? "bg-slate-800/80 border-amber-500/40 text-amber-100"
                                : chat.isJoined === false
                                ? "bg-teal-950/5 border-teal-500/10 text-teal-300/90 hover:bg-teal-950/15 hover:border-teal-500/20"
                                : "bg-slate-950/20 border-slate-900/60 text-slate-400 hover:bg-slate-900 hover:text-slate-200 hover:border-slate-800"
                            }\`}
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <input type="checkbox" checked={isSel} readOnly className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-amber-500" />
                              <div className={\`p-1.5 rounded-lg shrink-0 \${
                                chat.isJoined === false
                                  ? "bg-teal-400/10 text-teal-400"
                                  : chat.isChannel
                                   ? "bg-teal-500/10 text-teal-400"
                                   : "bg-blue-500/10 text-blue-400"
                              }\`}>
                                <MessageSquare className="w-3.5 h-3.5" />
                              </div>`;

code = code.replace(oldMap, newMap);

// Replace trailing parenthesis for the map
code = code.replace(
  '                          </button>\n                        ))',
  '                          </button>\n                        ); })'
);


// 5. Add "Sync Selected" button above list
const oldListHeader = `{/* Chat dialogs list */}`;
const newListHeader = `{/* Sync Selected Button */}
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
                    {/* Chat dialogs list */}`;

code = code.replace(oldListHeader, newListHeader);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx sidebar with multi-select");
