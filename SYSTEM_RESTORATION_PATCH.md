# Workspace Cleanup Manifest

The following list identifies legacy, orphaned, temporary, or redundant files generated during previous logic adjustments, simulation tuning, or partial patching sequences. To enforce the new pristine architecture and avoid confusing any future engineers or LLM agents, you must safely delete all the files listed below from the project root.

### Temporary Logic Fix Scripts (Node.js)
```text
add_tick_size.cjs
dummy.cjs
fix_10016_retry.cjs
fix_EA_margin_stop.cjs
fix_EA_market.cjs
fix_adjust_ea.cjs
fix_ea_adjust.cjs
fix_ea_advanced.cjs
fix_ea_delay.cjs
fix_ea_errors.cjs
fix_ea_generator.cjs
fix_ea_lot_crash.cjs
fix_ea_margin_stops.cjs
fix_ea_ontick_full.cjs
fix_ea_ontick_skip.cjs
fix_ea_price.cjs
fix_ea_queue.cjs
fix_ea_symbol.cjs
fix_ea_symbol_crash.cjs
fix_ea_ticks_and_defaults.cjs
fix_entry_norm.cjs
fix_entry_snap.cjs
fix_filter.cjs
fix_helpers_symbol.cjs
fix_inputs.cjs
fix_inputs_force.cjs
fix_manage_positions.cjs
fix_margin_calc.cjs
fix_margin_check.cjs
fix_mastermind_instruction.cjs
fix_mastermind_instruction2.cjs
fix_mastermind_schema.cjs
fix_mastermind_strict.cjs
fix_media_filter.cjs
fix_min_lot.cjs
fix_oninit_symbols.cjs
fix_ontick_symbol.cjs
fix_pending_entry.cjs
fix_regex.cjs
fix_server_ea.cjs
fix_sl_zero.cjs
fix_statusType_failover.cjs
fix_syntax.cjs
fix_telegram_fetch.cjs
fix_totallot.cjs
fix_ui_buttons.cjs
fix_ui_config.cjs
fix.cjs
full_ea_replace.cjs
generate_mq5.cjs
patch_boundary.cjs
patch_calcpnl.cjs
patch_clean_json.cjs
patch_daemon.cjs
patch_fetch.cjs
patch_fix.cjs
patch_math.cjs
patch_server_yf.cjs
patch_sim.cjs
patch_simparams.cjs
patch_specs.cjs
patch_telegram.cjs
patch_yf.cjs
patch_yf2.cjs
patch.cjs
recover_ts.cjs
rewrite_ea_full.cjs
rewrite_ea.cjs
rewrite_portfolio_route.cjs
split_tools.cjs
truncate_api.cjs
test-request.cjs
test_gen_ea.cjs
test_parse.cjs
test-dist.cjs
test-yf.cjs
update_app_ui.cjs
update_ea_v5.cjs
update_mastermind.cjs
update_server_filter.cjs
make_api.cjs
fix_api_imports.cjs
check_brackets.cjs
fix_startServer.cjs
fix_pnl.cjs
```

### Temporary Bash / Shell Scripts
```text
patch_daemon.sh
patch_dataengine.sh
patch_precision.sh
patch_sim.sh
patch_sim2.sh
patch_sim_outlier.sh
test-curl.sh
```

### Test Artifacts, Dumps, and Patches
```text
test-yf.ts
test-yf2.ts
test-yf3.ts
test_ea.mq5
test_ea2.mq5
test_final.mq5
test_final2.mq5
test_final3.mq5
test_fixed.mq5
test.mq5
test_failover.txt
tmp_failover.txt
test_mql5.txt
test_mql5_2.txt
fix_execute_brain.patch
fix_server.patch
```

### Next Steps for System Maintainer
Run the following terminal command to quickly purge the files from the root and achieve zero code rot:
```bash
rm -f *.cjs *.patch *.mq5 *.sh test*.txt tmp*.txt test*.ts
```
*(Ensure you are running this from the exact project root to avoid deleting essential nested source code.)*
