// vaultkeeper.js – Full Blackbeard Empire VaultKeeper System v2.0

const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const { generatePaymentLink } = require("./vaultkeeper_helpers");

const vaultLogFile = path.join(__dirname, "vault_log.json");
const WITHDRAW_PASSWORD = process.env.VAULT_WITHDRAW_PASSWORD || "blackbeard-withdraw-999";

// Helper to log every coin drop into the Vault
function logCoinEntry(entry) {
  const log = fs.existsSync(vaultLogFile)
    ? JSON.parse(fs.readFileSync(vaultLogFile))
    : [];

  log.push({ ...entry, timestamp: new Date().toISOString() });
  fs.writeFileSync(vaultLogFile, JSON.stringify(log, null, 2));
  console.log("💰 Coin logged to Vault:", entry);
}

// Helper to calculate total vault balance from log
function getVaultBalance() {
  if (!fs.existsSync(vaultLogFile)) return 0;

  const log = JSON.parse(fs.readFileSync(vaultLogFile));
  return log.reduce((sum, entry) => sum + (entry.amount || 0), 0);
}

// 🔐 Vault Deposit Endpoint (used by Bots to deposit payment info)
router.post("/vault/deposit", express.json(), (req, res) => {
  const { service, payer, amount } = req.body;

  if (!service || !payer || !amount) {
    return res.status(400).json({ message: "Missing data: service, payer, and amount are required." });
  }

  // Generate a unique payment link for this deposit
  const paymentLink = generatePaymentLink(service, amount);

  logCoinEntry({ service, payer, amount, paymentLink });

  res.json({ 
    message: "✅ Coin securely deposited. Vault updated.", 
    paymentLink 
  });
});

// 📜 Vault Report Endpoint (view all coins in log)
router.get("/vault/report", (req, res) => {
  if (!fs.existsSync(vaultLogFile)) {
    return res.json({ log: [], balance: 0 });
  }

  const log = JSON.parse(fs.readFileSync(vaultLogFile));
  const balance = getVaultBalance();
  res.json({ log, balance });
});

// 🔐 Vault Withdrawal Endpoint (password-protected)
router.post("/vault/withdraw", express.json(), (req, res) => {
  const { password, amount, tempYocoLink } = req.body;

  if (password !== WITHDRAW_PASSWORD) {
    return res.status(403).json({ message: "🚫 Access denied. Invalid withdrawal password." });
  }

  const balance = getVaultBalance();

  if (!amount || amount <= 0 || amount > balance) {
    return res.status(400).json({ message: `Invalid amount. Vault balance is ${balance}` });
  }

  if (!tempYocoLink) {
    return res.status(400).json({ message: "Temporary Yoco payment link required for withdrawal." });
  }

  // Log withdrawal event (for audit)
  logCoinEntry({ service: "WITHDRAWAL", payer: "Captain", amount: -amount, paymentLink: tempYocoLink });

  // In real use, here you would integrate actual payment processing to your Yoco account

  res.json({ message: `✅ Withdrawal of ${amount} confirmed. Funds sent to your Yoco link.` });
});

// 🔐 Admin Purge Endpoint (clear vault - disabled for safety)
router.delete("/vault/reset", (req, res) => {
  /*
  if (fs.existsSync(vaultLogFile)) {
    fs.unlinkSync(vaultLogFile);
    return res.json({ message: "🔥 Vault log reset." });
  }
  */
  return res.status(403).json({ message: "🚫 Reset disabled for security." });
});

module.exports = router;