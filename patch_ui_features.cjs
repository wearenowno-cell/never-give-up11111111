const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `<div className="flex flex-col gap-2">
                   <label className="text-xs text-slate-400">Target Channels (one per line, e.g. @goldvip)</label>
                   <textarea
                      value={window.targetChannels || ""}
                      onChange={e => window.targetChannels = e.target.value}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 h-24"
                      placeholder="@channel1\\n@channel2"
                   />
                 </div>`;

const rep1 = `{(Object.keys(channelRegistry)?.length ?? 0) > 0 && (
                   <div className="flex flex-col gap-2 mb-2">
                     <label className="text-xs text-slate-400">Quick Select from Registered Channels</label>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                       {Object.keys(channelRegistry).map(chName => {
                         const isSelected = (window.targetChannels || "").split('\\n').map(c=>c.trim()).includes(chName);
                         return (
                         <div key={chName} className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded px-2 py-1.5 cursor-pointer hover:border-amber-500/50 transition-colors" onClick={() => {
                             let current = (window.targetChannels || "").split('\\n').map(c=>c.trim()).filter(Boolean);
                             if (!isSelected) {
                               current.push(chName);
                             } else {
                               current = current.filter(c => c !== chName);
                             }
                             window.targetChannels = current.join('\\n');
                             document.getElementById("job-render-trigger")?.click();
                         }}>
                           <input type="checkbox" checked={isSelected} readOnly className="w-3 h-3 rounded bg-slate-900 border-slate-700 text-amber-500" />
                           <span className="text-[10px] text-slate-300 truncate">{chName}</span>
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
                      placeholder="@channel1\\n@channel2"
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
                 </div>`;

code = code.replace(target1, rep1);

const target2 = `backtestConfig: backtestConfig, uniqueGroqKeys: []
                          })
                       });`;

const rep2 = `backtestConfig: backtestConfig, uniqueGroqKeys: [], convertToLimit: !!window.convertToLimit
                          })
                       });`;

code = code.replace(target2, rep2);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx with ui features");
