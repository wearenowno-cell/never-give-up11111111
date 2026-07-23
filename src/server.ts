import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { initDatabase } from "./database/db.js";
import { logger } from "./utils/logger.js";
import { apiRouter } from "./routes/api.js";

// Load environment variables
dotenv.config();

/**
 * Global Uncaught Exception & Rejection Handlers
 * Ensures the daemon and server never crash unexpectedly.
 */
process.on("uncaughtException", (error) => {
  logger.error("[Global Error] Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("[Global Error] Unhandled Rejection at:", promise, "reason:", reason);
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Initialize SQLite Database Pool (WAL Mode)
  try {
    initDatabase();
    logger.info("[Database] SQLite connection pool initialized successfully.");
  } catch (dbError) {
    logger.error("[Database] Failed to initialize SQLite:", dbError);
    process.exit(1);
  }

  // 2. Middlewares
  app.use(express.json({ limit: "10mb" }));

  // 3. API Router
  app.use(apiRouter);

  // 4. Vite Frontend Middleware or Static Files (Production)
  if (process.env.NODE_ENV !== "production") {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      logger.info("[Vite] Development middleware attached.");
    } catch (viteError) {
      logger.error("[Vite] Failed to start Vite dev server:", viteError);
    }
  } else {
    const distPath = path.join(process.cwd(), 'dist', 'client');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    logger.info("[Express] Static production files serving enabled.");
  }

  // 5. Start HTTP Listener
  app.listen(PORT, "0.0.0.0", () => {
    logger.info(`[Server] Boot sequence complete. Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
