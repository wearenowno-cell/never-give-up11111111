const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /filteredChats\?\.map\(\(chat\) => \([\s\S]*?className=\{`w-full text-left p-2\.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 \$\{[\s\S]*?selectedChatId === chat\.id[\s\S]*?\? "bg-slate-800\/80 border-teal-500\/40 text-slate-100"[\s\S]*?: chat\.isJoined === false[\s\S]*?\? "bg-teal-950\/5 border-teal-500\/10 text-teal-300\/90 hover:bg-teal-950\/15 hover:border-teal-500\/20"[\s\S]*?: "bg-slate-950\/20 border-slate-900\/60 text-slate-400 hover:bg-slate-900 hover:text-slate-200 hover:border-slate-800"[\s\S]*?`\}/;

const newStart = `filteredChats?.map((chat) => {
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
                            }\``;

code = code.replace(regex, newStart);

// Also need to inject the checkbox before the MessageSquare icon
const regex2 = /<div className="flex items-center gap-2 overflow-hidden">[\s\S]*?<div className=\{`p-1\.5 rounded-lg shrink-0 \$\{/;

const newCheckbox = `<div className="flex items-center gap-2 overflow-hidden">
                              <input type="checkbox" checked={isSel} readOnly className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-amber-500" />
                              <div className={\`p-1.5 rounded-lg shrink-0 \${`;

code = code.replace(regex2, newCheckbox);

fs.writeFileSync('src/App.tsx', code);
console.log("Replaced map start correctly");
