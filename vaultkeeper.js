// vaultkeeper.js – Blackbeard Empire Vault Command System
const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

// Path for coin deposit log file
const vaultLogFile = path.join(__dirname, "vault_log.json");

// Map of services to their Yoco payment links
const servicePaymentLinks = {
  "cv-making": "https://pay.yoco.com/r/7v8zDd",
  "study-buddy": "https://pay.yoco.com/r/mOzlDp",
  "proofreading": "https://pay.yoco.com/r/2Bo0Dn",
  "website-design": "https://pay.yoco.com/r/2DevRY",
  "app-development": "https://pay.yoco.com/r/4njGOA",
  "automation-consulting": "https://pay.yoco.com/r/2LbDwR",
  "free-launcher-cv": "https://pay.yoco.com/r/71kZxa",
  "chatbot-development": "https://pay.yoco.com/r/4G0xe9",
  "cover-letter": "https://pay.yoco.com/r/mMGWyq",
  "business-plan": "https://pay.yoco.com/r/4xjzq1",
  "logo-design": "https://pay.yoco.com/r/4arnwD",
  "social-media-content": "https://pay.yoco.com/r/mojGZa",
  // Add the rest of your service keys and links here...
};

// Helper to log coin deposit entries
function logCoinEntry(entry) {
  const log = fs.existsSync(vaultLogFile)
    ? JSON.parse(fs.readFileSync(vaultLogFile))
    : [];

  log.push({ ...entry, timestamp: new Date().toISOString() });
  fs.writeFileSync(vaultLogFile, JSON.stringify(log, null, 2));
  console.log("💰 Coin logged to Vault:", entry);
}

// Endpoint to receive deposit from payment confirmation (simulated)
router.post("/vault/deposit", express.json(), (req, res) => {
  const { service, payer } = req.body;

  if (!service || !payer) {
    return res.status(400).json({ message: "Missing service or payer data." });
  }

  if (!servicePaymentLinks[service]) {
    return res.status(400).json({ message: "Unknown service." });
  }

  logCoinEntry({ service, payer });
  res.json({ message: "Coin securely deposited. Vault updated." });
});

// Endpoint to get deposit report
router.get("/vault/report", (req, res) => {
  if (!fs.existsSync(vaultLogFile)) {
    return res.json({ log: [] });
  }

  const log = JSON.parse(fs.readFileSync(vaultLogFile));
  res.json({ log });
});

// Simulate bot deployment management (stub for your 5 GodBots)
const bots = [
  { id: 1, name: "GodBot Alpha", status: "idle" },
  { id: 2, name: "GodBot Beta", status: "idle" },
  { id: 3, name: "GodBot Gamma", status: "idle" },
  { id: 4, name: "GodBot Delta", status: "idle" },
  { id: 5, name: "GodBot Epsilon", status: "idle" },
];

// Endpoint to get bots status
router.get("/vault/bots/status", (req, res) => {
  res.json({ bots });
});

// Endpoint to deploy a bot to a job (simulate)
router.post("/vault/bots/deploy", express.json(), (req, res) => {
  const { botId, jobUrl } = req.body;

  const bot = bots.find(b => b.id === botId);
  if (!bot) return res.status(404).json({ message: "Bot not found." });
  if (bot.status !== "idle") return res.status(400).json({ message: "Bot is busy." });

  bot.status = "deployed";
  bot.jobUrl = jobUrl;
  bot.deployedAt = new Date().toISOString();

  console.log(`🤖 ${bot.name} deployed to ${jobUrl}`);
  res.json({ message: `${bot.name} deployed successfully.` });
});

// Endpoint to recall a bot
router.post("/vault/bots/recall", express.json(), (req, res) => {
  const { botId } = req.body;

  const bot = bots.find(b => b.id === botId);
  if (!bot) return res.status(404).json({ message: "Bot not found." });

  bot.status = "idle";
  delete bot.jobUrl;
  delete bot.deployedAt;

  console.log(`🛑 ${bot.name} recalled to base.`);
  res.json({ message: `${bot.name} recalled successfully.` });
});

module.exports = router;