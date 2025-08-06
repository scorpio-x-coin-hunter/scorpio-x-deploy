// vaultkeeper.js – Full Blackbeard Empire VaultKeeper System v1.6 (Complete & Secure)

const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const vaultLogFile = path.join(__dirname, "vault_log.json");
const withdrawalLogFile = path.join(__dirname, "withdrawal_log.json");

// VaultKeeper withdrawal password (change this to your own strong secret!)
const VAULT_WITHDRAW_PASSWORD = process.env.VAULT_WITHDRAW_PASSWORD || "ghost-999-secret-pass";

// Helper to log every coin deposit into the Vault
function logCoinEntry(entry) {
  const log = fs.existsSync(vaultLogFile)
    ? JSON.parse(fs.readFileSync(vaultLogFile))
    : [];

  log.push({ ...entry, timestamp: new Date().toISOString() });
  fs.writeFileSync(vaultLogFile, JSON.stringify(log, null, 2));
  console.log("💰 Coin logged to Vault:", entry);
}

// Helper to log withdrawals
function logWithdrawal(entry) {
  const log = fs.existsSync(withdrawalLogFile)
    ? JSON.parse(fs.readFileSync(withdrawalLogFile))
    : [];

  log.push({ ...entry, timestamp: new Date().toISOString() });
  fs.writeFileSync(withdrawalLogFile, JSON.stringify(log, null, 2));
  console.log("🔥 Withdrawal logged:", entry);
}

// Calculate total vault balance from deposits minus withdrawals
function getVaultBalance() {
  let totalDeposits = 0;
  let totalWithdrawals = 0;

  if (fs.existsSync(vaultLogFile)) {
    const deposits = JSON.parse(fs.readFileSync(vaultLogFile));
    totalDeposits = deposits.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  }

  if (fs.existsSync(withdrawalLogFile)) {
    const withdrawals = JSON.parse(fs.readFileSync(withdrawalLogFile));
    totalWithdrawals = withdrawals.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  }

  return totalDeposits - totalWithdrawals;
}

// 🔐 Vault Deposit Endpoint (used by Bots)
router.post("/vault/deposit", express.json(), (req, res) => {
  const { service, payer, amount, paymentLink } = req.body;

  if (!service || !payer || !amount) {
    return res.status(400).json({ message: "Missing required data (service, payer, amount)." });
  }

  logCoinEntry({ service, payer, amount: Number(amount), paymentLink });
  res.json({ message: "✅ Coin securely deposited. Vault updated." });
});

// 🔐 Vault Withdrawal Request Endpoint (must supply password)
router.post("/vault/withdraw", express.json(), (req, res) => {
  const { password, amount, yocoLink } = req.body;

  if (password !== VAULT_WITHDRAW_PASSWORD) {
    return res.status(403).json({ message: "🚫 Invalid password. Access denied." });
  }
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "❌ Invalid withdrawal amount." });
  }
  if (!yocoLink) {
    return res.status(400).json({ message: "❌ Missing Yoco payment link for withdrawal." });
  }

  const vaultBalance = getVaultBalance();

  if (amount > vaultBalance) {
    return res.status(400).json({ message: `❌ Insufficient funds. Vault balance is ${vaultBalance}.` });
  }

  // Log withdrawal
  logWithdrawal({ amount: Number(amount), yocoLink });

  // Here you can add actual payment integration with Yoco or trigger manual payout

  res.json({
    message: `💸 Withdrawal of ${amount} confirmed. Payment link: ${yocoLink}`,
    vaultBalanceAfter: vaultBalance - amount,
  });
});

// 📜 Vault Report Endpoint (view all deposits & withdrawals, password protected)
router.get("/vault/report", (req, res) => {
  const key = req.query.key;
  if (key !== VAULT_WITHDRAW_PASSWORD) {
    return res.status(403).json({ message: "🚫 Access Denied. Intruder!" });
  }

  const deposits = fs.existsSync(vaultLogFile) ? JSON.parse(fs.readFileSync(vaultLogFile)) : [];
  const withdrawals = fs.existsSync(withdrawalLogFile) ? JSON.parse(fs.readFileSync(withdrawalLogFile)) : [];

  res.json({ 
    deposits,
    withdrawals,
    vaultBalance: getVaultBalance(),
  });
});

// 🔐 Admin Purge Endpoint (clear vault logs - disabled for security)
router.delete("/vault/reset", (req, res) => {
  /*
  if (fs.existsSync(vaultLogFile)) fs.unlinkSync(vaultLogFile);
  if (fs.existsSync(withdrawalLogFile)) fs.unlinkSync(withdrawalLogFile);
  return res.json({ message: "🔥 Vault logs reset." });
  */
  return res.status(403).json({ message: "🚫 Reset disabled for security." });
});

module.exports = router;