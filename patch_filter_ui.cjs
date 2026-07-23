const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldHeader = `              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-100">Signal Database</h3>
                  <p className="text-xs text-slate-400">Review, modify, or manually inject trades before executing the backtest engine.</p>
                </div>
                <button
                  onClick={handleAddManualSignal}
                  className="bg-slate-800 hover:bg-slate-700 text-xs text-teal-400 font-bold py-2 px-3 rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Manual Signal</span>
                </button>
              </div>`;

const newHeader = `              <div className="flex items-center justify-between">
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
              </div>`;

if (code.includes(oldHeader)) {
  code = code.replace(oldHeader, newHeader);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched filter UI in App.tsx");
} else {
  console.log("Failed to find header");
}
