// index.js – Scorpio-X Blackbeard Empire Core Server v2.2 (Fully Integrated, Standard Bank Only)

const express = require("express");
const fetch = require("node-fetch");
const comms = require("./comms");         // 📡 Client Message Engine (assumed present)
const vaultkeeper = require("./vaultkeeper"); // 💰 Vault Manager with deposits, withdrawals, reports
const commands = require("./commands");   // 🧠 Captain Commands Handler
require("./autoping");                    // Autoping script to keep awake (assumed present)

const app = express();
const PORT = process.env.PORT || 3000;
const CAPTAIN_SECRET = process.env.CAPTAIN_SECRET || "ghost-999";

// Middleware
app.use(express.json());
app.use(comms);
app.use(vaultkeeper);
app.use(commands);

// Root Status Page
app.get("/", (req, res) => {
  res.send(`
    <h1>🦂 Scorpio-X Core | Blackbeard Online</h1>
    <p>Status: <strong>Active</strong><br/>Bots: Scanning for clients...<br/>Vaultkeeper: Watching the gold.</p>
    <p><strong>Note:</strong> All payments go directly to Standard Bank account with unique references.</p>
  `);
});

// Captain Secret Control Panel
app.get("/captain", (req, res) => {
  const key = req.query.key;
  if (key !== CAPTAIN_SECRET) {
    return res.status(403).send("🛑 Access Denied. Intruder!");
  }
  res.send(`
    <h2>👑 Welcome, Captain Nicolaas</h2>
    <ul>
      <li>🛰️ Bot Status: ACTIVE</li>
      <li>💰 Vault Tracking: ENABLED</li>
      <li>🛡️ Render Ping Protection: ON</li>
      <li>💳 Payment Method: Standard Bank Direct (No Yoco links)</li>
    </ul>
  `);
});

// Privacy Policy Page
app.get("/privacy", (req, res) => {
  res.send(`
    <h2>🔐 Privacy Policy</h2>
    <p>This system collects NO personal data. All transactions are securely processed via Standard Bank with unique payment references for accurate tracking.</p>
  `);
});

// Backup Self-Ping (Optional)
setInterval(() => {
  fetch("https://scorpio-x-core.onrender.com")
    .then(() => console.log("🌐 Pinged self to stay awake"))
    .catch((err) => console.error("⚠️ Ping failed:", err));
}, 5 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`🛰️ Scorpio-X Core Server running on port ${PORT}`);
});