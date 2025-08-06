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

// Get total amount in vault (sum of all deposits and withdrawals)
function getVaultTotal() {
  if (!fs.existsSync(vaultLogFile)) return 0;

  const log = JSON.parse(fs.readFileSync(vaultLogFile));
  return log.reduce((sum, entry) => sum + (entry.amount || 0), 0);
}

// 🔐 Vault Deposit Endpoint (used by Bots)
router.post("/vault/deposit", express.json(), (req, res) => {
  const { service, payer, amount } = req.body;

  if (!service || !payer || !amount) {
    return res.status(400).json({ message: "Missing required data (service, payer, amount)." });
  }

  // Generate unique payment link for this deposit
  const paymentLink = generatePaymentLink(service, amount);

  logCoinEntry({ service, payer, amount, paymentLink });

  res.json({
    message: "✅ Coin securely deposited. Vault updated.",
    paymentLink
  });
});

// 📜 Vault Report Endpoint (view all coins in log + total)
router.get("/vault/report", (req, res) => {
  if (!fs.existsSync(vaultLogFile)) {
    return res.json({ log: [], totalAmount: 0 });
  }

  const log = JSON.parse(fs.readFileSync(vaultLogFile));
  const totalAmount = getVaultTotal();

  res.json({ log, totalAmount });
});

// 🔐 Vault Withdrawal Endpoint (secure, requires passcode and amount)
const WITHDRAWAL_PASSCODE = process.env.VAULT_WITHDRAWAL_PASSCODE || "blackbeard-secret";

router.post("/vault/withdraw", express.json(), (req, res) => {
  const { passcode, amount, yocoLink } = req.body;

  if (passcode !== WITHDRAWAL_PASSCODE) {
    return res.status(403).json({ message: "🚫 Unauthorized: Invalid passcode." });
  }

  const totalAmount = getVaultTotal();

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "❌ Invalid withdrawal amount." });
  }

  if (amount > totalAmount) {
    return res.status(400).json({ message: `❌ Insufficient funds. Vault total is ${totalAmount}.` });
  }

  if (!yocoLink || typeof yocoLink !== "string") {
    return res.status(400).json({ message: "❌ Valid Yoco withdrawal link required." });
  }

  // Log the withdrawal as a negative entry
  logCoinEntry({ service: "Withdrawal", payer: "Captain Nicolaas", amount: -amount, paymentLink: yocoLink });

  // Here you can integrate actual payment processing logic with Yoco API if you want (not included)

  res.json({
    message: `✅ Withdrawal of ${amount} approved and logged. Payment link used: ${yocoLink}`,
    vaultRemaining: totalAmount - amount
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