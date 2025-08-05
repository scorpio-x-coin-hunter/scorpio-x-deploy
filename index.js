// index.js – Scorpio-X Central AI Core v1.5
const express = require("express");
const fetch = require("node-fetch");
const comms = require("./comms");
const vaultkeeper = require("./vaultkeeper");
require("./autoping");

const app = express();
app.use(express.json());
app.use(comms);
app.use(vaultkeeper);

const PORT = process.env.PORT || 3000;
const CAPTAIN_SECRET = process.env.CAPTAIN_SECRET || "blackbeard-command";

app.get("/", (req, res) => {
  res.send(`
    <h1>🦂 Scorpio-X Bot System Online</h1>
    <p>Running vault, bots, and comms. Ready to hunt coin.</p>
    <a href="https://pay.yoco.com/r/mojop9" target="_blank">💳 Pay Captain Nicolaas</a>
  `);
});

app.get("/captain", (req, res) => {
  const key = req.query.key;
  if (key !== CAPTAIN_SECRET) return res.status(403).send("🛑 Intruder alert! Access denied.");
  res.send(`
    <h2>👑 Captain Access Panel</h2>
    <ul>
      <li>✅ Bot online & pinging</li>
      <li>💰 Vault connected</li>
      <li>🛰️ Comms active</li>
      <li>🔗 Yoco: <a href="https://pay.yoco.com/r/mojop9" target="_blank">View Payment Portal</a></li>
    </ul>
  `);
});

app.get("/privacy", (req, res) => {
  res.send(`
    <h2>🔒 Privacy Policy</h2>
    <p>We do not collect personal data. All payments handled via Yoco.</p>
  `);
});

const messageTemplate = `
Hi! 🤖 I'm Scorpio-X, the AI bot from the Blackbeard Empire.

We build bots, websites, and automation — fast and affordable.

💳 Payments: https://pay.yoco.com/r/mojop9
Visit: https://scorpio-x-core.onrender.com
`;

const huntKeywords = ["need a bot", "freelancer needed", "hire developer"];

setInterval(async () => {
  try {
    const response = await fetch("https://www.reddit.com/r/forhire.json");
    const data = await response.json();
    const posts = data.data.children.map(post => post.data);

    const leads = posts.filter(post =>
      huntKeywords.some(keyword =>
        post.title.toLowerCase().includes(keyword)
      )
    );

    if (leads.length) {
      console.log("🎯 Coin leads detected:");
      leads.forEach(post => {
        const url = `https://reddit.com${post.permalink}`;
        console.log(`➡️ ${post.title} | ${url}`);
        console.log(`🗨️ Auto-reply simulated to ${post.author}:`);
        console.log(messageTemplate);
      });
    } else {
      console.log("🔍 No coin leads this round.");
    }
  } catch (err) {
    console.error("⚠️ Client hunter error:", err.message);
  }
}, 10 * 60 * 1000); // Every 10 mins

app.listen(PORT, () => {
  console.log(`🛰️ Scorpio-X AI Core running on port ${PORT}`);
});