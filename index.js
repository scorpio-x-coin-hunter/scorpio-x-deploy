// index.js – Scorpio-X Core Server v3.0 – Full Blackbeard Empire Version

const express = require("express"); const fetch = require("node-fetch"); const comms = require("./comms"); const vaultkeeper = require("./vaultkeeper"); const commands = require("./commands"); require("./autoping");

const app = express(); const PORT = process.env.PORT || 3000; const CAPTAIN_SECRET = process.env.CAPTAIN_SECRET || "ghost-999";

// Middleware app.use(express.json()); app.use(comms);          // 📡 Client Message Engine app.use(vaultkeeper);    // 💰 Vault Manager app.use(commands);       // 🧠 Captain Commands

// Root Status Page app.get("/", (req, res) => { res.send(<h1>🦂 Scorpio-X Core | Blackbeard Online</h1> <p>Status: <strong>Active</strong><br/>Bots: Scanning for clients...<br/>Vaultkeeper: Watching the gold.</p> <p><a href="https://your-live-site.com" target="_blank">🔗 Visit Live Empire</a></p>); });

// Captain's Secret Control Panel app.get("/captain", (req, res) => { const key = req.query.key; if (key !== CAPTAIN_SECRET) { return res.status(403).send("🛑 Access Denied. Intruder!"); } res.send(<h2>👑 Welcome, Captain Nicolaas</h2> <ul> <li>🛰️ Bot Status: ACTIVE</li> <li>💰 Vault Tracking: ENABLED</li> <li>🧠 Command Center: OPERATIONAL</li> <li>🛡️ Render Ping Protection: ON</li> </ul>); });

// Privacy Policy Page app.get("/privacy", (req, res) => { res.send(<h2>🔐 Privacy Policy</h2> <p>This system collects NO personal data. All transactions are securely managed via encrypted links generated per job.</p>); });

// Backup Self-Ping (in case autoping fails) setInterval(() => { fetch("https://scopio.scopioxcore.onrender.com") .then(() => console.log("🌐 Pinged self to stay awake")) .catch((err) => console.error("⚠️ Ping failed:", err)); }, 5 * 60 * 1000);

app.listen(PORT, () => { console.log(🛰️ Scorpio-X Core Server v3.0 running on port ${PORT}); });

