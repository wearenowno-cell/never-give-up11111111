const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                 <div className="flex flex-col gap-2">
                   <label className="text-xs text-slate-400">Target Channels (one per line, e.g. @goldvip)</label>
                   <textarea`;

const replacement = `                 {tgSession && (tgChats?.length ?? 0) > 0 && (
                   <div className="flex flex-col gap-2 mb-2">
                     <label className="text-xs text-slate-400">Quick Select from Live Telegram</label>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-2">
                       {tgChats.map(chat => {
                         const chIdStr = String(chat.id);
                         const isSelected = (window.targetChannels || "").split('\\n').map(c=>c.trim()).includes(chIdStr);
                         return (
                         <div key={chat.id} className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded px-2 py-1.5 cursor-pointer hover:border-amber-500/50 transition-colors" onClick={() => {
                             let current = (window.targetChannels || "").split('\\n').map(c=>c.trim()).filter(Boolean);
                             if (!isSelected) {
                               current.push(chIdStr);
                             } else {
                               current = current.filter(c => c !== chIdStr);
                             }
                             window.targetChannels = current.join('\\n');
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
                   <textarea`;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx with live telegram multi-select in Large Scale tester");
