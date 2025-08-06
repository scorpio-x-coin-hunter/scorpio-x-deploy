// vaultkeeper.js – Blackbeard VaultKeeper v2.0

const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const VAULT_FILE = path.join(__dirname, "vault_log.json");
const WITHDRAW_PASS = process.env.WITHDRAW_PASS || "blackbeard-vault-pass";

// 💾 Log deposit into vault
function logCoinEntry(entry) {
  const log = fs.existsSync(VAULT_FILE)
    ? JSON.parse(fs.readFileSync(VAULT_FILE))
    : [];
  log.push({ ...entry, timestamp: new Date().toISOString() });
  fs.writeFileSync(VAULT_FILE, JSON.stringify(log, null, 2));
  console.log("💰 Vault deposit:", entry);
}

// 📥 Deposit coins to vault
router.post("/vault/deposit", express.json(), (req, res) => {
  const { service, payer, amount, paymentLink } = req.body;
  if (!service || !payer || !amount) {
    return res.status(400).json({ message: "❌ Missing data." });
  }

  logCoinEntry({ service, payer, amount, paymentLink });
  res.json({ message: "✅ Deposit logged in vault." });
});

// 📤 Withdraw coins from vault with password
router.post("/vault/withdraw", express.json(), (req, res) => {
  const { amount, destination, passcode } = req.body;

  if (passcode !== WITHDRAW_PASS) {
    return res.status(403).json({ message: "🚫 Invalid passcode. Access denied." });
  }

  if (!amount || !destination) {
    return res.status(400).json({ message: "❌ Missing amount or destination." });
  }

  // You can expand this logic later to integrate payout APIs
  console.log(`💸 Withdrawal requested: R${amount} to ${destination}`);

  res.json({ message: `💸 R${amount} will be transferred to ${destination}. Vault locked again.` });
});

// 📜 Vault transaction log
router.get("/vault/report", (req, res) => {
  if (!fs.existsSync(VAULT_FILE)) return res.json({ log: [] });
  const log = JSON.parse(fs.readFileSync(VAULT_FILE));
  res.json({ log });
});

// ⚠️ Disabled vault reset (can be unlocked manually)
router.delete("/vault/reset", (req, res) => {
  return res.status(403).json({ message: "❌ Vault reset is disabled for safety." });
});

module.exports = router;