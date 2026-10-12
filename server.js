import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { INITIAL_COLLECTORS } from "./src/data/initialData.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3e3;
const isProd = process.env.NODE_ENV === "production";
app.use(express.json({ limit: "50mb" }));
const DATA_DIR = path.resolve(__dirname, "data");
const STORE_PATH = path.resolve(DATA_DIR, "collectors-store.json");
let currentCollectors = [];
let lastUpdatedTime = (/* @__PURE__ */ new Date()).toISOString();
function initStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        currentCollectors = parsed;
        console.log(`[Store] Berhasil memuat ${currentCollectors.length} kolektor dari ${STORE_PATH}`);
        return;
      }
    }
  } catch (err) {
    console.error("[Store] Gagal membaca storage, menggunakan data awal:", err);
  }
  currentCollectors = JSON.parse(JSON.stringify(INITIAL_COLLECTORS));
  saveStoreToDisk();
  console.log(`[Store] Diinisialisasi dengan ${currentCollectors.length} kolektor default.`);
}
function saveStoreToDisk() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(currentCollectors, null, 2), "utf-8");
    lastUpdatedTime = (/* @__PURE__ */ new Date()).toISOString();
  } catch (err) {
    console.error("[Store] Gagal menyimpan ke disk:", err);
  }
}
initStore();
const sseClients = /* @__PURE__ */ new Set();
function broadcast(event) {
  const payload = `data: ${JSON.stringify(event)}

`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}
setInterval(() => {
  for (const client of sseClients) {
    try {
      client.write(":ping\n\n");
    } catch {
      sseClients.delete(client);
    }
  }
}, 2e4);
app.get("/api/realtime/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();
  sseClients.add(res);
  const initPayload = {
    type: "INIT",
    collectors: currentCollectors,
    lastUpdated: lastUpdatedTime,
    clientCount: sseClients.size
  };
  res.write(`data: ${JSON.stringify(initPayload)}

`);
  broadcast({
    type: "PRESENCE",
    collectors: currentCollectors,
    lastUpdated: lastUpdatedTime,
    clientCount: sseClients.size
  });
  req.on("close", () => {
    sseClients.delete(res);
    broadcast({
      type: "PRESENCE",
      collectors: currentCollectors,
      lastUpdated: lastUpdatedTime,
      clientCount: sseClients.size
    });
  });
});
app.get("/api/collectors", (_req, res) => {
  res.json({
    success: true,
    collectors: currentCollectors,
    lastUpdated: lastUpdatedTime,
    activeDevices: sseClients.size
  });
});
app.post("/api/collectors", (req, res) => {
  const { collectors } = req.body;
  if (!Array.isArray(collectors)) {
    return res.status(400).json({ success: false, error: "Data kolektor harus berupa array." });
  }
  currentCollectors = collectors;
  saveStoreToDisk();
  broadcast({
    type: "UPDATE",
    collectors: currentCollectors,
    lastUpdated: lastUpdatedTime,
    clientCount: sseClients.size
  });
  res.json({
    success: true,
    message: "Data berhasil diperbarui dan disinkronkan ke seluruh perangkat.",
    lastUpdated: lastUpdatedTime,
    count: currentCollectors.length
  });
});
app.put("/api/collectors/:id", (req, res) => {
  const { id } = req.params;
  const updatedCollector = req.body;
  const index = currentCollectors.findIndex((c) => c.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: "Kolektor tidak ditemukan." });
  }
  currentCollectors[index] = {
    ...currentCollectors[index],
    ...updatedCollector,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  saveStoreToDisk();
  broadcast({
    type: "UPDATE",
    collectors: currentCollectors,
    lastUpdated: lastUpdatedTime,
    clientCount: sseClients.size
  });
  res.json({
    success: true,
    collector: currentCollectors[index],
    lastUpdated: lastUpdatedTime
  });
});
app.post("/api/collectors/reset", (_req, res) => {
  currentCollectors = JSON.parse(JSON.stringify(INITIAL_COLLECTORS));
  saveStoreToDisk();
  broadcast({
    type: "RESET",
    collectors: currentCollectors,
    lastUpdated: lastUpdatedTime,
    clientCount: sseClients.size
  });
  res.json({
    success: true,
    message: "Data berhasil direset ke standar awal.",
    collectors: currentCollectors,
    lastUpdated: lastUpdatedTime
  });
});
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: (/* @__PURE__ */ new Date()).toISOString(), devices: sseClients.size });
});
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }
  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`[WOM Palembang 2 Server] Berjalan pada port ${PORT} (Mode: ${isProd ? "Production" : "Development"})`);
    console.log(`[WOM Palembang 2 Server] Real-time SSE sinkronisasi aktif pada /api/realtime/stream`);
  });
}
startServer().catch((err) => {
  console.error("[Server Error] Gagal menjalankan server:", err);
  process.exit(1);
});
