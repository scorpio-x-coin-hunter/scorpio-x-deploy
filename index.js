const express = require("express");
const path = require("path");
const comms = require("./comms");         // Your chat command engine
const vaultkeeper = require("./vaultkeeper"); // Vault logic & API
const commands = require("./commands");   // Commands logic & API
require("./autoping");                     // Keep server alive

const app = express();
const PORT = process.env.PORT || 3000;
const CAPTAIN_SECRET = process.env.CAPTAIN_SECRET || "blackbeard-secret-2025";

// Middleware to parse JSON
app.use(express.json());

// Serve the front-end chat UI from the 'public' folder
app.use(express.static(path.join(__dirname, "public")));

// Use your core middleware
app.use(comms);
app.use(vaultkeeper);
app.use(commands);

// Root status page
app.get("/", (req, res) => {
  res.send(`
    <h1>🦂 Scorpio-X Core | Blackbeard Online</h1>
    <p>Status: <strong>Active</strong><br/>Bots: Scanning for clients...<br/>Vaultkeeper: Watching the gold.</p>
    <p><strong>Open <a href="/chat.html">/chat.html</a> to chat with Blackbeard live</strong></p>
  `);
});

// Captain control panel
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
      <li>🛡️ Server Protection: ON</li>
    </ul>
  `);
});

// Privacy policy
app.get("/privacy", (req, res) => {
  res.send(`
    <h2>🔐 Privacy Policy</h2>
    <p>This system collects NO personal data. All payments go directly to Standard Bank account with unique payment references.</p>
  `);
});

// Backup self-ping to keep alive (every 5 min)
setInterval(() => {
  fetch("https://your-render-deployment-url.onrender.com") // Change to your actual URL
    .then(() => console.log("🌐 Pinged self to stay awake"))
    .catch((err) => console.error("⚠️ Ping failed:", err));
}, 5 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`🛰️ Scorpio-X Core Server running on port ${PORT}`);
});