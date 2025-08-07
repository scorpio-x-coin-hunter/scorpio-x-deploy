// vaultkeeper.js – Full Blackbeard Empire VaultKeeper System with Standard Bank Payment Refs v3.0

const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const vaultLogFile = path.join(__dirname, "vault_log.json");

// Password to authorize withdrawals — change this before deployment!
const WITHDRAWAL_PASSWORD = process.env.VAULT_PASS || "blackbeard-secret-2025";

// Your Standard Bank details for client payments:
const BANK_NAME = "Standard Bank";
const ACCOUNT_NAME = "Nicolaas Johannes Els";
const ACCOUNT_NUMBER = "10135452331"; // Your Mymo Account
const ACCOUNT_TYPE = "Mymo Account";
const BANK_CODE = "051001"; // Standard Bank branch code (can adjust if needed)

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

// Helper: Log coin deposit or withdrawal entry
function logCoinEntry(entry) {
  const log = readVaultLog();
  log.push({ ...entry, timestamp: new Date().toISOString() });
  writeVaultLog(log);
  console.log("💰 VaultKeeper logged entry:", entry);
}

// Helper: Calculate total vault balance
function calculateVaultBalance() {
  const log = readVaultLog();
  return log.reduce((total, entry) => total + (entry.amount || 0), 0);
}

// Helper: Generate a unique payment reference code for each client deposit
function generatePaymentReference(service, payer) {
  // Format: BB + date + random 5-digit + payer initials (max 3 letters)
  const datePart = new Date().toISOString().slice(0,10).replace(/-/g,""); // YYYYMMDD
  const randomPart = Math.floor(10000 + Math.random() * 90000);
  const payerInitials = payer.split(" ").map(w => w[0]).join("").slice(0,3).toUpperCase() || "XXX";
  return `BB${datePart}${randomPart}${payerInitials}`;
}

// 🔐 Deposit endpoint: bots call this to add coins to vault
router.post("/vault/deposit", express.json(), (req, res) => {
  const { service, payer, amount } = req.body;

  if (!service || !payer || !amount || amount <= 0) {
    return res.status(400).json({ message: "Missing or invalid data." });
  }

  // Generate a unique payment reference for this deposit
  const paymentReference = generatePaymentReference(service, payer);

  // Build the payment info string clients will receive to pay you
  const paymentInfo = `
  Please pay R${amount.toFixed(2)} to:
  Bank: ${BANK_NAME}
  Account Name: ${ACCOUNT_NAME}
  Account Number: ${ACCOUNT_NUMBER}
  Account Type: ${ACCOUNT_TYPE}
  Branch Code: ${BANK_CODE}
  Payment Reference: ${paymentReference}

  Use the Payment Reference exactly as it appears to ensure your payment is correctly recorded.
  `;

  // Log the deposit with the payment reference as paymentLink for tracking
  logCoinEntry({ service, payer, amount, paymentLink: paymentReference });

  // Respond to the client with the payment instructions
  res.json({ 
    message: "✅ Coin deposit initiated. Please use the following bank details to complete payment.",
    paymentInfo: paymentInfo.trim()
  });
});

// 📜 Vault report: Get full log and total balance
router.get("/vault/report", (req, res) => {
  const log = readVaultLog();
  const total = calculateVaultBalance();
  res.json({ totalBalance: total, log });
});

// 🔐 Withdrawal endpoint: Admin withdraws money by providing password & Yoco or bank link (optional)
router.post("/vault/withdraw", express.json(), (req, res) => {
  const { password, amount, paymentLink } = req.body;

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

  // Log the withdrawal as a negative transaction, optionally with paymentLink
  logCoinEntry({ service: "Withdrawal", payer: "Captain Nicolaas", amount: -amount, paymentLink: paymentLink || null });

  res.json({ message: `💸 Withdrawal of R${amount.toFixed(2)} logged.` });
});

// 🚫 Vault reset endpoint - Disabled for security
router.delete("/vault/reset", (req, res) => {
  return res.status(403).json({ message: "🚫 Reset disabled for security." });
});

module.exports = router;