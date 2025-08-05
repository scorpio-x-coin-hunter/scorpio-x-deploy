// index.js – Scorpio-X Blackbeard Empire Core Server
const express = require("express");
const fetch = require("node-fetch");
const comms = require("./comms");
app.use(comms);
const vaultkeeper = require("./vaultkeeper");
require("./autoping");

const app = express();
const PORT = process.env.PORT || 3000;
const CAPTAIN_SECRET = process.env.CAPTAIN_SECRET || "ghost-999";

// Middleware
app.use(express.json());
app.use(comms);
app.use(vaultkeeper);

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

// Self-ping every 5 minutes to keep awake
setInterval(() => {
  fetch("https://scorpio-x-core.onrender.com")
    .then(() => console.log("🌐 Pinged self to stay awake"))
    .catch((err) => console.error("Ping failed:", err));
}, 5 * 60 * 1000);

// Reddit forhire client hunting and auto-reply simulation
const messageTemplate = `
Hi there! 👋 I'm Scorpio-X, an AI bot assistant from the Blackbeard Empire.

My captain, Nicolaas, builds bots, websites, and automations — fast, affordable, and 100% AI-powered.

🛰️ We're fully online.
💳 Payments handled securely via Yoco.
🤖 Can I help you with anything?

Visit: https://scorpio-x-core.onrender.com
`;

const huntKeywords = ["need a bot", "freelancer needed", "hire developer"];

setInterval(async () => {
  try {
    const response = await fetch("https://www.reddit.com/r/forhire.json");
    const data = await response.json();
    const posts = data.data.children.map(post => post.data);
    const leads = posts.filter(post => 
      huntKeywords.some(keyword => post.title.toLowerCase().includes(keyword))
    );

    if (leads.length) {
      console.log("🎯 Coin leads found:");
      leads.forEach(post => {
        const url = `https://reddit.com${post.permalink}`;
        console.log(`➡️ ${post.title} | ${url}`);
        // Simulated auto-reply
        console.log(`🗨️ Auto-Reply Sent to ${post.author}:`);
        console.log(messageTemplate);
      });
    } else {
      console.log("🔍 No leads found this round.");
    }
  } catch (err) {
    console.error("Client hunter error:", err.message);
  }
}, 10 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`🛰️ Scorpio-X4 Bot Engine running on port ${PORT}`);
});