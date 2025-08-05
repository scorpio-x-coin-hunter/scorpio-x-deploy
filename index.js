// index.js – Scorpio-X Blackbeard Empire Core Server
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
app.use(comms);
app.use(vaultkeeper);
app.use(commands);

// Root endpoint - status page
app.get("/", (req, res) => {
  res.send(`
    <h1>🦂 Scorpio-X4 Vaultkeeper Online</h1>
    <p>Status: Active, scanning for coin...</p>
    <a href="https://pay.yoco.com/r/mojop9" target="_blank">💰 Pay Captain Nicolaas</a>
  `);
});

// Captain secret dashboard
app.get("/captain", (req, res) => {
  const key = req.query.key;
  if (key !== CAPTAIN_SECRET) {
    return res.status(403).send("Access Denied, intruder!");
  }
  res.send(`
    <h2>👑 Welcome, Captain Nicolaas</h2>
    <ul>
      <li>🛰️ Bot is pinging for clients</li>
      <li>💳 Yoco Link: <a href="https://pay.yoco.com/r/mojop9" target="_blank">View</a></li>
      <li>📡 Uptime is protected</li>
    </ul>
  `);
});

// Privacy page
app.get("/privacy", (req, res) => {
  res.send(`
    <h2>Privacy Policy</h2>
    <p>This system does not collect or store personal data. All payments are handled securely by Yoco.</p>
  `);
});

// Optional: Self-ping for uptime protection (already handled in autoping.js)
// This one is optional now but safe to keep
setInterval(() => {
  fetch("https://scorpio-x-core.onrender.com")
    .then(() => console.log("🌐 Pinged self to stay awake"))
    .catch((err) => console.error("Ping failed:", err));
}, 5 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`🛰️ Scorpio-X4 Bot Engine running on port ${PORT}`);
});