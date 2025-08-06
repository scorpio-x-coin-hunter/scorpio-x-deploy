// vaultkeeper.js – Full Blackbeard Empire VaultKeeper System v2.0

const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const vaultLogFile = path.join(__dirname, "vault_log.json");

// Password to authorize withdrawals — change this before deployment!
const WITHDRAWAL_PASSWORD = process.env.VAULT_PASS || "blackbeard-secret-2025";

// Helper: Read vault log file safely
function readVaultLog() {
  if (!fs.existsSync(vaultLogFile)) return [];
  try {
    const data = fs.readFileSync(vaultLogFile);
    return JSON.parse(data);
  } catch (err) {
    console.error("⚠️ Error reading vault log:", err);
    return [];
  }
}

// Helper: Write vault log file safely
function writeVaultLog(log) {
  try {
    fs.writeFileSync(vaultLogFile, JSON.stringify(log, null, 2));
  } catch (err) {
    console.error("⚠️ Error writing vault log:", err);
  }
}

// Helper: Log coin deposit entry
function logCoinEntry(entry) {
  const log = readVaultLog();
  log.push({ ...entry, timestamp: new Date().toISOString() });
  writeVaultLog(log);
  console.log("💰 Coin logged to Vault:", entry);
}

// Helper: Calculate total vault balance
function calculateVaultBalance() {
  const log = readVaultLog();
  return log.reduce((total, entry) => total + (entry.amount || 0), 0);
}

// 🔐 Deposit endpoint: bots call this to add coins to vault
router.post("/vault/deposit", express.json(), (req, res) => {
  const { service, payer, amount, paymentLink } = req.body;

  if (!service || !payer || !amount || amount <= 0) {
    return res.status(400).json({ message: "Missing or invalid data." });
  }

  logCoinEntry({ service, payer, amount, paymentLink });
  res.json({ message: "✅ Coin securely deposited. Vault updated." });
});

// 📜 Vault report: Get full log and total balance
router.get("/vault/report", (req, res) => {
  const log = readVaultLog();
  const total = calculateVaultBalance();
  res.json({ totalBalance: total, log });
});

// 🔐 Withdrawal endpoint: Admin withdraws money by providing password & Yoco link
router.post("/vault/withdraw", express.json(), (req, res) => {
  const { password, amount, yocoLink } = req.body;

  if (password !== WITHDRAWAL_PASSWORD) {
    return res.status(403).json({ message: "🚫 Unauthorized: Wrong password." });
  }

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid withdrawal amount." });
  }

  const currentBalance = calculateVaultBalance();
  if (amount > currentBalance) {
    return res.status(400).json({ message: "Insufficient vault balance." });
  }

  if (!yocoLink || typeof yocoLink !== "string") {
    return res.status(400).json({ message: "Invalid Yoco payment link." });
  }

  // Log the withdrawal as a negative transaction
  logCoinEntry({ service: "Withdrawal", payer: "Captain Nicolaas", amount: -amount, paymentLink: yocoLink });

  res.json({ message: `💸 Withdrawal of ${amount} initiated to your Yoco link.` });
});

// 🚫 Vault reset endpoint - Disabled for security
router.delete("/vault/reset", (req, res) => {
  return res.status(403).json({ message: "🚫 Reset disabled for security." });
});

module.exports = router;