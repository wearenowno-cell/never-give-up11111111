const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `{job.report && (
         <div className="grid grid-cols-4 gap-3">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
               <span className="block text-[10px] text-slate-500 uppercase">Channels Success/Total</span>
               <span className="text-sm font-bold text-teal-400">{job.report.successChannels} / {job.report.channelsTested}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
               <span className="block text-[10px] text-slate-500 uppercase">Signals Extracted</span>
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
         </div>
      )}`;

const replacement = `{job.report && (
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
      )}`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Updated report UI.");
} else {
  console.log("Target for report UI not found.");
}
