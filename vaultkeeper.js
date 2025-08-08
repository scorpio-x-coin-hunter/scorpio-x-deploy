/**
 * vaultkeeper.js
 * 
 * Handles all vault operations for the Blackbeard Empire:
 * - Coin deposit with unique payment references
 * - Vault balance reporting
 * - Secure withdrawals with password protection
 * - Prevents reset for security reasons
 * 
 * Author: Captain Nicolaas Johannes Els
 * Date: 2025
 */

const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const vaultLogFile = path.join(__dirname, "vault_log.json");

const WITHDRAWAL_PASSWORD = process.env.VAULT_PASS || "blackbeard-secret-2025";

// Standard Bank payment details
const BANK_NAME = "Standard Bank";
const ACCOUNT_NAME = "Nicolaas Johannes Els";
const ACCOUNT_NUMBER = "10135452331";
const ACCOUNT_TYPE = "Mymo Account";
const BANK_CODE = "051001";

// Read vault log safely
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

// Write vault log safely
function writeVaultLog(log) {
  try {
    fs.writeFileSync(vaultLogFile, JSON.stringify(log, null, 2));
  } catch (err) {
    console.error("⚠️ Error writing vault log:", err);
  }
}

// Log coin transaction
function logCoinEntry(entry) {
  const log = readVaultLog();
  log.push({ ...entry, timestamp: new Date().toISOString() });
  writeVaultLog(log);
  console.log("💰 VaultKeeper logged entry:", entry);
}

// Calculate vault balance
function calculateVaultBalance() {
  const log = readVaultLog();
  return log.reduce((sum, entry) => sum + (entry.amount || 0), 0);
}

// Generate unique payment reference for each deposit
function generatePaymentReference(service, payer) {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(10000 + Math.random() * 90000);
  const payerInitials = payer
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase() || "XXX";
  return `BB${datePart}${randomPart}${payerInitials}`;
}

// Deposit endpoint
router.post("/vault/deposit", express.json(), (req, res) => {
  const { service, payer, amount } = req.body;

  if (!service || !payer || !amount || amount <= 0) {
    return res.status(400).json({ message: "Missing or invalid data." });
  }

  const paymentReference = generatePaymentReference(service, payer);

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

  logCoinEntry({ service, payer, amount, paymentLink: paymentReference });

  res.json({
    message:
      "✅ Coin deposit initiated. Please use the following bank details to complete payment.",
    paymentInfo: paymentInfo.trim(),
    paymentReference,
  });
});

// Vault report endpoint
router.get("/vault/report", (req, res) => {
  const log = readVaultLog();
  const total = calculateVaultBalance();
  res.json({ totalBalance: total, log });
});

// Withdrawal endpoint
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

  logCoinEntry({
    service: "Withdrawal",
    payer: "Captain Nicolaas",
    amount: -amount,
    paymentLink: paymentLink || null,
  });

  res.json({ message: `💸 Withdrawal of R${amount.toFixed(2)} logged.` });
});

// Disable vault reset
router.delete("/vault/reset", (req, res) => {
  return res.status(403).json({ message: "🚫 Reset disabled for security." });
});

module.exports = router;