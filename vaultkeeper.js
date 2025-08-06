// vaultkeeper.js – Blackbeard Empire VaultKeeper System v2.0 (100% Complete & Standalone)

const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const vaultLogFile = path.join(__dirname, "vault_log.json");

// Vault withdrawal password (set environment variable VAULT_PASSWORD in production)
const VAULT_PASSWORD = process.env.VAULT_PASSWORD || "blackbeard-secret-007";

// Load entire vault transaction log (deposits + withdrawals)
function loadVaultLog() {
  if (!fs.existsSync(vaultLogFile)) return [];
  try {
    return JSON.parse(fs.readFileSync(vaultLogFile, "utf-8"));
  } catch {
    return [];
  }
}

// Save full vault log back to file
function saveVaultLog(log) {
  fs.writeFileSync(vaultLogFile, JSON.stringify(log, null, 2));
}

// Log deposit (coins coming in)
function logDeposit(entry) {
  const log = loadVaultLog();
  log.push({ ...entry, type: "deposit", timestamp: new Date().toISOString() });
  saveVaultLog(log);
  console.log("💰 Deposit logged:", entry);
}

// Log withdrawal (coins going out)
function logWithdrawal(entry) {
  const log = loadVaultLog();
  log.push({ ...entry, type: "withdrawal", timestamp: new Date().toISOString() });
  saveVaultLog(log);
  console.log("🛡️ Withdrawal logged:", entry);
}

// Calculate current vault balance = sum of deposits - sum of withdrawals
function getVaultBalance() {
  const log = loadVaultLog();
  return log.reduce((acc, entry) => {
    if (entry.type === "deposit") return acc + Number(entry.amount);
    if (entry.type === "withdrawal") return acc - Number(entry.amount);
    return acc;
  }, 0);
}

// 🚪 Deposit endpoint - bots call this to record incoming coins
router.post("/vault/deposit", express.json(), (req, res) => {
  const { service, payer, amount, paymentLink } = req.body;

  if (!service || !payer || !amount) {
    return res.status(400).json({ message: "Missing required fields: service, payer, amount." });
  }

  logDeposit({ service, payer, amount, paymentLink });
  return res.json({ message: "✅ Deposit recorded and vault updated." });
});

// 🏦 Withdrawal endpoint - Captain calls this to withdraw coins with password and Yoco withdrawal link
router.post("/vault/withdraw", express.json(), (req, res) => {
  const { password, amount, withdrawalLink } = req.body;

  if (password !== VAULT_PASSWORD) {
    return res.status(403).json({ message: "🚫 Unauthorized: Invalid password." });
  }

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid withdrawal amount." });
  }

  const balance = getVaultBalance();
  if (amount > balance) {
    return res.status(400).json({ message: "Insufficient funds in vault." });
  }

  if (!withdrawalLink) {
    return res.status(400).json({ message: "Withdrawal Yoco link required." });
  }

  logWithdrawal({ amount, withdrawalLink });
  return res.json({
    message: `🛡️ Withdrawal of ${amount} confirmed and queued for transfer.`,
    remainingBalance: balance - amount,
  });
});

// 📜 Vault report endpoint - view full transaction history and balance
router.get("/vault/report", (req, res) => {
  const log = loadVaultLog();
  const balance = getVaultBalance();
  return res.json({ balance, transactions: log });
});

// 🚫 Reset endpoint disabled for security - manual reset must be done by deleting vault_log.json file
router.delete("/vault/reset", (req, res) => {
  return res.status(403).json({ message: "🚫 Vault reset disabled for security." });
});

module.exports = router;