# Telegram Signals Backtester - Engineering Development Guidelines

## 1. Core Architectural Laws
*   **The 300-Line Rule:** No single source file under `src/` may exceed 300 lines of code. If a module approaches this limit, it must be split into sub-services, pure utility helpers, or dedicated type directories.
*   **Single Responsibility Principle (SRP):** A file can only do one job. 
    *   `daemon.ts` listens to data streams. It cannot analyze text.
    *   `regex.ts` cleans text strings. It cannot execute database writes.
    *   `api.ts` maps network routes. It cannot process trading math.
*   **Explicit Dependency Trees:** Never allow circular dependencies. High-level services (`services/`) import from database wrappers (`database/`) and utility toolkits (`utils/`). Low-level modules are completely blind to high-level architectures.

## 2. Coding & Implementation Standards
*   **Strict Compilation Targets:** Every file must be written in valid TypeScript with explicit type assignments. The use of `any` is strictly prohibited. Use explicit structural interfaces or `unknown` with runtime type-guards.
*   **JSDoc Documentation Requirements:** Every exported function, interface, class, and method must carry a descriptive JSDoc block mapping out:
    ```typescript
    /**
     * Brief description of the module's exact business purpose.
     * @param paramName Type definition and safe functional boundary parameters.
     * @returns Expected type, explicitly detailing failure state returns.
     * @throws Specific error conditions intercepted by parent catch blocks.
     */
    ```
*   **Defensive Async Operations:** Every asynchronous call or promise resolution must live within an explicit `try-catch` boundary. Dangling detached promises are completely banned to avoid uncaught process-crashing exceptions.

## 3. Data Integrity & Precision Rules
*   **Zero-Float Leakage Policy:** Floating-point arithmetic calculations across currency allocations or pips must pass through standard mathematical rounding layers (`Math.round(val * 100) / 100`) at every logical step to eliminate IEEE 754 precision drift.
*   **Centralized Telemetry Logging:** Traditional `console.log` strings are strictly banned. All application telemetry must leverage the contextual logging layer (`logger.context("TAG")`), ensuring precise timestamp prefixes and structural event categorization across production output targets.
