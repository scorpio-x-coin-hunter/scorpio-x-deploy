// vaultkeeper.js – Full Blackbeard Empire VaultKeeper System v2.0

const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const { generatePaymentLink } = require("./vaultkeeper_helpers");

const vaultLogFile = path.join(__dirname, "vault_log.json");

// Helper to log every coin drop into the Vault
function logCoinEntry(entry) {
  const log = fs.existsSync(vaultLogFile)
    ? JSON.parse(fs.readFileSync(vaultLogFile))
    : [];

  log.push({ ...entry, timestamp: new Date().toISOString() });
  fs.writeFileSync(vaultLogFile, JSON.stringify(log, null, 2));
  console.log("💰 Coin logged to Vault:", entry);
}

// 🔐 Vault Deposit Endpoint (used by Bots)
router.post("/vault/deposit", express.json(), (req, res) => {
  const { service, payer, amount } = req.body;

  if (!service || !payer || !amount) {
    return res.status(400).json({ message: "Missing data: service, payer, or amount." });
  }

  // Generate a fresh unique payment link for this deposit
  const paymentLink = generatePaymentLink(service, amount);

  logCoinEntry({ service, payer, amount, paymentLink });
  
  // Respond with the payment link for the bot/client to pay directly
  res.json({ message: "✅ Coin deposit initiated. Use this payment link:", paymentLink });
});

// 📜 Vault Report Endpoint (view all coins in log)
router.get("/vault/report", (req, res) => {
  if (!fs.existsSync(vaultLogFile)) {
    return res.json({ log: [] });
  }

  const log = JSON.parse(fs.readFileSync(vaultLogFile));
  res.json({ log });
});

// 🔐 Admin Purge Endpoint (clear vault - future use, disabled now)
router.delete("/vault/reset", (req, res) => {
  // Uncomment below ONLY if you want to enable reset (dangerous!)
  /*
  if (fs.existsSync(vaultLogFile)) {
    fs.unlinkSync(vaultLogFile);
    return res.json({ message: "🔥 Vault log reset." });
  }
  */
  return res.status(403).json({ message: "🚫 Reset disabled for security." });
});

module.exports = router;