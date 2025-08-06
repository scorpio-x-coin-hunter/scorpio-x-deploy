// index.js – Scorpio-X Blackbeard Empire Core Server v2.1 (Full Integrated Version)

const express = require("express");
const fetch = require("node-fetch");
const comms = require("./comms");
const vaultkeeper = require("./vaultkeeper");
const commands = require("./commands");
require("./autoping");

const app = express();
const PORT = process.env.PORT || 3000;
const CAPTAIN_SECRET = process.env.CAPTAIN_SECRET || "ghost-999";

// Middleware
app.use(express.json());
app.use(comms);          // 📡 Client Message Engine
app.use(vaultkeeper);    // 💰 Vault Manager (with deposits, withdrawals, reports)
app.use(commands);       // 🧠 Captain Commands

// Root Status Page
app.get("/", (req, res) => {
  res.send(`
    <h1>🦂 Scorpio-X Core | Blackbeard Online</h1>
    <p>Status: <strong>Active</strong><br/>Bots: Scanning for clients...<br/>Vaultkeeper: Watching the gold.</p>
    <p><a href="https://pay.yoco.com/r/mojop9" target="_blank">💳 Pay Captain Nicolaas</a></p>
  `);
});

// Captain's Secret Control Panel
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
      <li>📡 Yoco Link: <a href="https://pay.yoco.com/r/mojop9" target="_blank">View</a></li>
      <li>🛡️ Render Ping Protection: ON</li>
    </ul>
  `);
});

// Privacy Policy Page
app.get("/privacy", (req, res) => {
  res.send(`
    <h2>🔐 Privacy Policy</h2>
    <p>This system collects NO personal data. All transactions are securely processed via Yoco.</p>
  `);
});

// Backup Self-Ping (Optional, in case autoping fails)
setInterval(() => {
  fetch("https://scorpio-x-core.onrender.com")
    .then(() => console.log("🌐 Pinged self to stay awake"))
    .catch((err) => console.error("⚠️ Ping failed:", err));
}, 5 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`🛰️ Scorpio-X Core Server running on port ${PORT}`);
});