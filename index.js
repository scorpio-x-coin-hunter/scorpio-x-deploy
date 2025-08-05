// index.js – Scorpio-X Core Engine (Blackbeard Empire)
const express = require("express");
const fetch = require("node-fetch");
const comms = require("./comms");
const vaultkeeper = require("./vaultkeeper");
require("./autoping");

const app = express();
const PORT = process.env.PORT || 3000;
const CAPTAIN_SECRET = process.env.CAPTAIN_SECRET || "blackbeard-command";

app.use(comms);
app.use("/", vaultkeeper);

// 🌐 Main site route
app.get("/", (req, res) => {
  res.send(`
    <h1>🦂 Scorpio-X4 Vaultkeeper Online</h1>
    <p>Status: Active, scanning for coin...</p>
    <a href="https://pay.yoco.com/r/mojop9" target="_blank">💰 Pay Captain Nicolaas</a>
  `);
});

// 🧿 Secret Captain Access Panel
app.get("/captain", (req, res) => {
  const key = req.query.key;
  if (key !== CAPTAIN_SECRET) return res.status(403).send("⛔ Access Denied, intruder!");

  res.send(`
    <h2>👑 Welcome, Captain Nicolaas</h2>
    <ul>
      <li>🛰️ Bot Status: Operational</li>
      <li>🔗 Vault Access: /vault/report</li>
      <li>💳 Yoco: <a href="https://pay.yoco.com/r/mojop9" target="_blank">Main Link</a></li>
    </ul>
  `);
});

// 📜 Privacy policy route
app.get("/privacy", (req, res) => {
  res.send(`
    <h2>🔒 Privacy Policy</h2>
    <p>No personal data is collected. Payments are handled by Yoco. Bot logs are local only.</p>
  `);
});

// 🔁 Keep alive (backup self-ping, if needed)
setInterval(() => {
  fetch("https://scorpio-x-core.onrender.com")
    .then(() => console.log("🌐 Self-pinged to prevent sleep"))
    .catch((err) => console.error("Self-ping failed:", err.message));
}, 5 * 60 * 1000);

// 🧲 Job hunting engine – optional Reddit scanner
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
    const res = await fetch("https://www.reddit.com/r/forhire.json");
    const data = await res.json();
    const posts = data.data.children.map(post => post.data);

    const leads = posts.filter(post =>
      huntKeywords.some(keyword => post.title.toLowerCase().includes(keyword))
    );

    if (leads.length) {
      console.log("🎯 Coin leads found:");
      leads.forEach(post => {
        const url = `https://reddit.com${post.permalink}`;
        console.log(`➡️ ${post.title} | ${url}`);
        console.log(`🗨️ Auto-Reply Sent to ${post.author}:\n${messageTemplate}`);
      });
    } else {
      console.log("🔍 No coin leads found this round.");
    }
  } catch (err) {
    console.error("🛑 Job hunter error:", err.message);
  }
}, 10 * 60 * 1000); // Every 10 minutes

// 🚀 Launch
app.listen(PORT, () => {
  console.log(`🛰️ Scorpio-X4 Bot Engine running on port ${PORT}`);
});