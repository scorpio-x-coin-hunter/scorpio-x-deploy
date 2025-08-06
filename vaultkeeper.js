// vaultkeeper.js – Scorpio-X Blackbeard Empire VaultKeeper v1.6 (Complete & Self-Contained)

const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const vaultLogFile = path.join(__dirname, "vault_log.json");
const VAULT_WITHDRAWAL_PASSWORD = process.env.VAULT_PASSWORD || "blackbeard-ghost-999"; // Secure password for withdrawals

// Helper: Read vault log
function readVaultLog() {
  if (!fs.existsSync(vaultLogFile)) return [];
  try {
    return JSON.parse(fs.readFileSync(vaultLogFile));
  } catch (e) {
    console.error("⚠️ Vault log read error:", e);
    return [];
  }
}

// Helper: Write vault log
function writeVaultLog(log) {
  fs.writeFileSync(vaultLogFile, JSON.stringify(log, null, 2));
}

// Log a new coin deposit entry
function logCoinEntry(entry) {
  const log = readVaultLog();
  log.push({ ...entry, timestamp: new Date().toISOString() });
  writeVaultLog(log);
  console.log("💰 Coin logged to Vault:", entry);
}

// Calculate total amount in vault
function getVaultBalance() {
  const log = readVaultLog();
  return log.reduce((sum, entry) => sum + (entry.amount || 0), 0);
}

// 🔐 Deposit coins into vault (Bots use this)
router.post("/vault/deposit", express.json(), (req, res) => {
  const { service, payer, amount, paymentLink } = req.body;

  if (!service || !payer || !amount || amount <= 0) {
    return res.status(400).json({ message: "Missing or invalid deposit data." });
  }

  logCoinEntry({ service, payer, amount, paymentLink });
  return res.json({ message: "✅ Coin securely deposited. Vault updated.", currentBalance: getVaultBalance() });
});

// 📜 Get vault report (All deposits logged)
router.get("/vault/report", (req, res) => {
  res.json({ log: readVaultLog(), currentBalance: getVaultBalance() });
});

// 🔐 Withdraw funds from vault (Admin only)
router.post("/vault/withdraw", express.json(), (req, res) => {
  const { password, amount, yocoLink } = req.body;

  if (password !== VAULT_WITHDRAWAL_PASSWORD) {
    return res.status(403).json({ message: "🛑 Access Denied: Incorrect password." });
  }

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid withdrawal amount." });
  }

  const currentBalance = getVaultBalance();
  if (amount > currentBalance) {
    return res.status(400).json({ message: "Insufficient funds in vault." });
  }

  if (!yocoLink) {
    return res.status(400).json({ message: "Missing Yoco payment link for withdrawal." });
  }

  // Log withdrawal as negative entry
  logCoinEntry({ service: "WITHDRAWAL", payer: "Captain", amount: -amount, paymentLink: yocoLink });

  return res.json({
    message: `💸 Withdrawal of ${amount} processed to Yoco link.`,
    currentBalance: getVaultBalance(),
  });
});

// 🔥 Dangerous Reset (disabled by default, uncomment to enable)
// router.delete("/vault/reset", (req, res) => {
//   if (fs.existsSync(vaultLogFile)) {
//     fs.unlinkSync(vaultLogFile);
//     return res.json({ message: "🔥 Vault log reset." });
//   }
//   return res.json({ message: "Vault log not found." });
// });

module.exports = router;