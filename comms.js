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

// Captain dashboard
app.get("/captain", (req, res) => {
  const key = req.query.key;
  if (key !== CAPTAIN_SECRET) {
    return res.status(403).send("Access Denied, intruder!");
  }
  res.send(`
    <h2>👑 Welcome, Captain Nicolaas</h2>
    <ul>
      <li>🛰️ All bots are operational</li>
      <li>💳 Yoco Vault: <a href="https://pay.yoco.com/r/mojop9" target="_blank">View Coin</a></li>
      <li>📡 Ping frequency stable</li>
      <li>🔐 Secure Mode: ON</li>
    </ul>
  `);
});

// Privacy info
app.get("/privacy", (req, res) => {
  res.send(`
    <h2>Privacy Policy</h2>
    <p>No personal data is collected or stored by the Blackbeard Empire bots. Payments are secure via Yoco.</p>
  `);
});

// Uptime pinger backup (secondary fail-safe)
setInterval(() => {
  fetch("https://scorpio-x-core.onrender.com")
    .then(() => console.log("🌐 [Backup Ping] Keeping server awake."))
    .catch(err => console.error("🛑 Ping error:", err));
}, 5 * 60 * 1000);

// Start engine
app.listen(PORT, () => {
  console.log(`🛰️ Scorpio-X4 Core Engine online at port ${