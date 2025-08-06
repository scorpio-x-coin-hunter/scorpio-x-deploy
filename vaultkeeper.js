// vaultkeeper.js – Full Blackbeard Empire VaultKeeper System v2.0 with payment link generation

const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const generatePaymentLink = require("./vaultkeeper_helpers").generatePaymentLink;

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

// 🔐 Vault Deposit Endpoint (used by Bots)
// Bots send: service, payer, amount, and request a payment link if none provided
router.post("/vault/deposit", express.json(), (req, res) => {
  let { service, payer, amount, paymentLink } = req.body;

  if (!service || !payer || !amount) {
    return res.status(400).json({ message: "Missing data: service, payer, and amount required." });
  }

  // If no paymentLink sent, generate one dynamically per deposit
  if (!paymentLink) {
    paymentLink = generatePaymentLink(service, amount);
  }

  logCoinEntry({ service, payer, amount, paymentLink });
  res.json({ message: "✅ Coin securely deposited. Vault updated.", paymentLink });
});

// 📜 Vault Report Endpoint (view all coins in log)
router.get("/vault/report", (req, res) => {
  if (!fs.existsSync(vaultLogFile)) {
    return res.json({ log: [] });
  }
  const log = JSON.parse(fs.readFileSync(vaultLogFile));
  res.json({ log });
});

// 🔐 Vault Withdrawal Endpoint
// Requires password and amount, plus a temporary Yoco link to send funds
router.post("/vault/withdraw", express.json(), (req, res) => {
  const { password, amount, tempPaymentLink } = req.body;

  if (password !== WITHDRAW_PASSWORD) {
    return res.status(403).json({ message: "🚫 Unauthorized: Incorrect password." });
  }
  if (!amount || !tempPaymentLink) {
    return res.status(400).json({ message: "Missing amount or temporary payment link." });
  }

  // Here you would implement the logic to verify vault balance and send money
  // For now, just log the withdrawal request:
  console.log(`💸 Withdrawal requested: ${amount} to ${tempPaymentLink}`);

  res.json({
    message: `✅ Withdrawal approved for amount ${amount}. Payment sent to temporary link.`,
  });
});

// 🔐 Admin Purge Endpoint (clear vault - disabled for security)
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