const express = require("express");
const path = require("path");
const router = express.Router();

const {
  readVaultLog,
  logCoinEntry,
  calculateVaultBalance
} = require("./vaultkeeperHelper");

const vaultLogFile = path.join(__dirname, "vault_log.json");

const WITHDRAWAL_PASSWORD = process.env.VAULT_PASS || "blackbeard-secret-2025";

// Bank details constants
const BANK_NAME = "Standard Bank";
const ACCOUNT_NAME = "Nicolaas Johannes Els";
const ACCOUNT_NUMBER = "10135452331";
const ACCOUNT_TYPE = "Mymo Account";
const BANK_CODE = "051001";

// Generate unique payment reference
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

// Deposit coins route
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

// Vault balance and log report
router.get("/vault/report", (req, res) => {
  const log = readVaultLog();
  const total = calculateVaultBalance();
  res.json({ totalBalance: total, log });
});

// Withdraw coins route (password protected)
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

// Disable vault reset for security
router.delete("/vault/reset", (req, res) => {
  return res.status(403).json({ message: "🚫 Reset disabled for security." });
});

// === LEGAL PAGES ===
router.get("/legal/privacy", (req, res) => {
  res.type("text/plain").send(`
Blackbeard Empire Privacy Policy
---------------------------------
We respect your privacy and do not share your data without consent.
All transactions are securely logged and handled.
By using our service, you agree to our terms and conditions.
  `);
});

router.get("/legal/cookies", (req, res) => {
  res.type("text/plain").send(`
Blackbeard Empire Cookies Policy
-------------------------------
Our website uses minimal cookies for session and security purposes only.
No tracking or third-party cookies are employed.
By continuing to use our site, you consent to this policy.
  `);
});

router.get("/legal/refund", (req, res) => {
  res.type("text/plain").send(`
Blackbeard Empire Refund Policy
------------------------------
All sales are final unless a proven technical error occurs.
Please contact support for any disputes or issues.
  `);
});

module.exports = router;