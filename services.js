/**
 * server.js
 * 
 * Blackbeard Empire Core Server
 * 
 * Handles:
 * - Vault deposits, withdrawals, balance reporting
 * - Payment commands and confirmations
 * - Legal notices, cookie consent headers
 * - CORS enabled, static frontend serving
 * 
 * Author: Captain Nicolaas Johannes Els
 * Date: 2025
 */

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;

const vaultLogFile = path.join(__dirname, "vault_log.json");
const WITHDRAWAL_PASSWORD = process.env.VAULT_PASS || "blackbeard-secret-2025";

// Bank details for all payments
const BANK_DETAILS = {
  BANK_NAME: "Standard Bank",
  ACCOUNT_NAME: "Nicolaas Johannes Els",
  ACCOUNT_NUMBER: "10135452331",
  ACCOUNT_TYPE: "Mymo Account",
  BANK_CODE: "051001",
};

// Configurable services offered
const services = [
  { name: "Ship Repair", keywords: ["repair", "fixship", "shiprepair"] },
  { name: "Treasure Map Access", keywords: ["map", "treasuremap"] },
  { name: "Rum Supply", keywords: ["rum", "drink", "beverage"] },
];

// ===== SAFE FILE OPERATIONS =====
function readVaultLog() {
  try {
    if (!fs.existsSync(vaultLogFile)) {
      fs.writeFileSync(vaultLogFile, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(vaultLogFile, "utf8");
    return Array.isArray(JSON.parse(data)) ? JSON.parse(data) : [];
  } catch (err) {
    console.error("⚠️ Error reading vault log, resetting file:", err);
    fs.writeFileSync(vaultLogFile, JSON.stringify([], null, 2));
    return [];
  }
}

function writeVaultLog(log) {
  try {
    if (!Array.isArray(log)) throw new Error("Vault log must be an array");
    fs.writeFileSync(vaultLogFile, JSON.stringify(log, null, 2));
  } catch (err) {
    console.error("⚠️ Error writing vault log:", err);
  }
}

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

function calculateVaultBalance() {
  const log = readVaultLog();
  return log.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
}

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

// ===== LEGAL TEXT & LINKS =====
const legalLinksHTML = `
<ul style="font-size: 14px; color: #ccc; margin: 10px 0;">
  <li><a href="/terms.html" target="_blank" style="color:#ff9900;">Terms & Conditions</a></li>
  <li><a href="/privacy.html" target="_blank" style="color:#ff9900;">Privacy Policy</a></li>
  <li><a href="/cookies.html" target="_blank" style="color:#ff9900;">Cookie Policy</a></li>
  <li><a href="/refunds.html" target="_blank" style="color:#ff9900;">Refund Policy</a></li>
</ul>
`;

const legalDisclaimer = `
⚓️ <strong>Blackbeard Empire Legal Notice</strong> ⚓️<br>
All payments are final unless otherwise stated in our Refund Policy.<br>
Please read our Terms & Conditions and Privacy Policy carefully before proceeding.<br>
By using our services, you agree to these terms.
`;

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Inject simple cookie consent banner header on every response
app.use((req, res, next) => {
  res.setHeader("Set-Cookie", "bb_cookie_consent=accepted; Path=/; HttpOnly; Max-Age=31536000");
  next();
});

// ===== API ROUTES =====

// Vault Deposit - creates payment instructions, logs deposit request
app.post("/vault/deposit", (req, res) => {
  const { service, payer, amount } = req.body;

  if (!service || !payer || !amount || amount <= 0) {
    return res.status(400).json({ message: "Missing or invalid data." });
  }

  const svc = services.find((s) => s.name.toLowerCase() === service.toLowerCase());
  if (!svc) {
    return res.status(400).json({ message: `Service "${service}" not found.` });
  }

  const paymentReference = generatePaymentReference(service, payer);

  const paymentInfo = `
Please pay R${amount.toFixed(2)} to:<br>
Bank: ${BANK_DETAILS.BANK_NAME}<br>
Account Name: ${BANK_DETAILS.ACCOUNT_NAME}<br>
Account Number: ${BANK_DETAILS.ACCOUNT_NUMBER}<br>
Account Type: ${BANK_DETAILS.ACCOUNT_TYPE}<br>
Branch Code: ${BANK_DETAILS.BANK_CODE}<br>
Payment Reference: <strong>${paymentReference}</strong><br><br>

Use the Payment Reference exactly as it appears to ensure your payment is correctly recorded.<br><br>

${legalLinksHTML}
${legalDisclaimer}
`;

  logCoinEntry({ service, payer, amount, paymentLink: paymentReference });

  res.json({
    message: "✅ Coin deposit initiated. Please use the following bank details to complete payment.",
    paymentInfo,
    paymentReference,
  });
});

// Vault Withdraw - password protected withdrawal logging
app.post("/vault/withdraw", (req, res) => {
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

// Vault Report - get total balance and full transaction log
app.get("/vault/report", (req, res) => {
  const log = readVaultLog();
  const total = calculateVaultBalance();
  res.json({ totalBalance: total, log });
});

// Command Handler - for chatbot commands: payment and confirm payment
app.post("/command", (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.json({ reply: "⚠️ Please send a valid command message." });
  }

  const parts = message.trim().split(/\s+/);
  const cmd = parts[0].toLowerCase();

  if (cmd === "payment") {
    if (parts.length < 4) {
      return res.json({
        reply: "Usage: payment [service keyword] [your full name] [amount]",
      });
    }

    const serviceKeyword = parts[1];
    const payerName = parts.slice(2, parts.length - 1).join(" ");
    const amountStr = parts[parts.length - 1];
    const amount = parseFloat(amountStr);

    if (isNaN(amount) || amount <= 0) {
      return res.json({ reply: "⚠️ Invalid amount. Please enter a valid number." });
    }

    const service = services.find((svc) =>
      svc.keywords.some((kw) => kw.toLowerCase() === serviceKeyword.toLowerCase())
    );
    if (!service) {
      return res.json({ reply: `⚠️ Service keyword "${serviceKeyword}" not found.` });
    }

    const paymentReference = generatePaymentReference(service.name, payerName);

    const paymentInfo = `
Please pay R${amount.toFixed(2)} to:<br>
Bank: ${BANK_DETAILS.BANK_NAME}<br>
Account Name: ${BANK_DETAILS.ACCOUNT_NAME}<br>
Account Number: ${BANK_DETAILS.ACCOUNT_NUMBER}<br>
Account Type: ${BANK_DETAILS.ACCOUNT_TYPE}<br>
Branch Code: ${BANK_DETAILS.BANK_CODE}<br>
Payment Reference: <strong>${paymentReference}</strong><br><br>

Use the Payment Reference exactly as it appears to ensure your payment is correctly recorded.<br><br>

${legalLinksHTML}
${legalDisclaimer}
`;

    // Log the payment request
    const log = readVaultLog();
    log.push({
      service: service.name,
      payer: payerName,
      amount,
      paymentLink: paymentReference,
      confirmed: false,
      timestamp: new Date().toISOString(),
    });
    writeVaultLog(log);

    return res.json({
      reply: `🪙 Payment instructions for ${service.name}:`,
      paymentInfo,
    });
  }

  if (cmd === "confirm" && parts[1]?.toLowerCase() === "payment") {
    if (parts.length < 3) {
      return res.json({
        reply: "Usage: confirm payment [payment reference code]",
      });
    }

    const paymentRef = parts.slice(2).join("");
    const log = readVaultLog();

    const found = log.find((entry) => entry.paymentLink === paymentRef);
    if (!found) {
      return res.json({ reply: `❌ Payment reference ${paymentRef} not found.` });
    }

    found.confirmed = true;
    writeVaultLog(log);

    return res.json({
      reply: `✅ Payment reference ${paymentRef} confirmed. Thank you, ${found.payer}!`,
    });
  }

  return res.json({
    reply: `☠️ Arrr, I heard ye say: "${message}". But I only understand 'payment' and 'confirm payment' commands... for now.`,
  });
});

// Root route info
app.get("/", (req, res) => {
  res.send(
    "🦂 Scorpio-X Core Server is running. Visit /chat.html to chat with Blackbeard."
  );
});

// 404 fallback
app.use((req, res) => {
  res.status(404).send("⚠️ 404 Not Found");
});

// Start listening
app.listen(PORT, () => {
  console.log(`🛰️ Scorpio-X Core Server running on port ${PORT}`);
});