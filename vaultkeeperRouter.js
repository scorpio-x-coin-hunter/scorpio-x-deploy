const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const vaultLogFile = path.join(__dirname, "vault_log.json");

// ===== SAFE FILE READ =====
function readVaultLog() {
  try {
    if (!fs.existsSync(vaultLogFile)) {
      fs.writeFileSync(vaultLogFile, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(vaultLogFile, "utf8");
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("⚠️ Error reading vault log, resetting file:", err);
    fs.writeFileSync(vaultLogFile, JSON.stringify([], null, 2));
    return [];
  }
}

// ===== SAFE FILE WRITE =====
function writeVaultLog(log) {
  try {
    if (!Array.isArray(log)) {
      throw new Error("Vault log must be an array");
    }
    fs.writeFileSync(vaultLogFile, JSON.stringify(log, null, 2));
  } catch (err) {
    console.error("⚠️ Error writing vault log:", err);
  }
}

// ===== ADD TRANSACTION ENTRY =====
function logCoinEntry(entry) {
  if (!entry || typeof entry !== "object") {
    console.error("⚠️ Invalid vault entry:", entry);
    return;
  }
  const log = readVaultLog();
  log.push({
    service: entry.service || "Unknown Service",
    payer: entry.payer || "Unknown",
    amount: Number(entry.amount) || 0,
    paymentLink: entry.paymentLink || null,
    confirmed: entry.confirmed || false,
    timestamp: new Date().toISOString(),
  });
  writeVaultLog(log);
  console.log("💰 VaultKeeper logged entry:", entry);
}

// ===== CALCULATE BALANCE =====
function calculateVaultBalance() {
  const log = readVaultLog();
  return log.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
}

// ===== SERVICE LIST & LOOKUP =====
const services = [
  { name: "Ship Repair", keywords: ["repair", "fixship", "shiprepair"] },
  { name: "Treasure Map Access", keywords: ["map", "treasuremap"] },
  { name: "Rum Supply", keywords: ["rum", "drink", "beverage"] },
  { name: "CV Writing", keywords: ["cv", "resume", "jobapp"] },
  { name: "Logo Design", keywords: ["logo", "branding"] },
  { name: "Website Development", keywords: ["website", "webdev", "site"] },
  { name: "Marketing Campaign", keywords: ["marketing", "ads", "promotion"] },
  { name: "Reddit Posting", keywords: ["reddit", "post", "promotion"] },
  { name: "Social Media Management", keywords: ["socialmedia", "social", "media"] },
];

function findServiceByKeyword(keyword) {
  return services.find((svc) =>
    svc.keywords.some((kw) => kw.toLowerCase() === keyword.toLowerCase())
  );
}

// ===== PAYMENT INSTRUCTION GENERATION =====
function generatePaymentInstructions(serviceName, payer, amount) {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(10000 + Math.random() * 90000);
  const payerInitials =
    payer
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 3)
      .toUpperCase() || "XXX";

  const paymentReference = `BB${datePart}${randomPart}${payerInitials}`;

  const BANK_NAME = "Standard Bank";
  const ACCOUNT_NAME = "Nicolaas Johannes Els";
  const ACCOUNT_NUMBER = "10135452331";
  const ACCOUNT_TYPE = "Mymo Account";
  const BANK_CODE = "051001";

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

  return { paymentReference, paymentInfo };
}

// ===== ROUTES =====

// POST /vault/payment - Request payment instructions
router.post("/payment", express.json(), (req, res) => {
  const { serviceKeyword, payerName, amount } = req.body;

  if (!serviceKeyword || !payerName || !amount) {
    return res.status(400).json({ message: "Missing required payment info." });
  }

  const service = findServiceByKeyword(serviceKeyword);
  if (!service) {
    return res.status(404).json({ message: `Service keyword "${serviceKeyword}" not found.` });
  }

  const amtNum = Number(amount);
  if (isNaN(amtNum) || amtNum <= 0) {
    return res.status(400).json({ message: "Invalid amount. Must be a positive number." });
  }

  const { paymentReference, paymentInfo } = generatePaymentInstructions(
    service.name,
    payerName,
    amtNum
  );

  logCoinEntry({
    service: service.name,
    payer: payerName,
    amount: amtNum,
    paymentLink: paymentReference,
    confirmed: false,
  });

  res.json({
    message: `Payment instructions generated for ${service.name}.`,
    paymentReference,
    paymentInfo,
  });
});

// POST /vault/confirm - Confirm payment by reference code
router.post("/confirm", express.json(), (req, res) => {
  const { paymentReference } = req.body;

  if (!paymentReference) {
    return res.status(400).json({ message: "Missing paymentReference to confirm." });
  }

  const log = readVaultLog();
  const entry = log.find((e) => e.paymentLink === paymentReference);

  if (!entry) {
    return res.status(404).json({ message: `Payment reference "${paymentReference}" not found.` });
  }

  entry.confirmed = true;
  writeVaultLog(log);

  res.json({ message: `Payment ${paymentReference} confirmed. Thank you, ${entry.payer}!` });
});

// GET /vault/balance - Get total vault balance
router.get("/balance", (req, res) => {
  const balance = calculateVaultBalance();
  res.json({ balance });
});

// GET /vault/log - Get full vault log entries
router.get("/log", (req, res) => {
  const log = readVaultLog();
  res.json({ log });
});

module.exports = {
  router,
  logCoinEntry,
  calculateVaultBalance,
};