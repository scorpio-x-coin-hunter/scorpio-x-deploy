const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const { logCoinEntry, readVaultLog } = require("./vaultkeeperHelper");

// ===== CONFIGURABLE SERVICES =====
const services = [
  { name: "Ship Repair", keywords: ["repair", "fixship", "shiprepair"], description: "Fix your ship and keep it seaworthy." },
  { name: "Treasure Map Access", keywords: ["map", "treasuremap", "treasure"], description: "Get exclusive access to treasure maps." },
  { name: "Rum Supply", keywords: ["rum", "drink", "beverage"], description: "Order barrels of fine rum." },
  { name: "CV Writing", keywords: ["cv", "resume", "curriculum"], description: "Professional CV writing and editing." },
  { name: "Logo Design", keywords: ["logo", "branding"], description: "Get a unique logo for your brand." },
  { name: "Website Development", keywords: ["website", "web", "site"], description: "Build a sleek website for your business." },
  { name: "Marketing Services", keywords: ["marketing", "ads", "promotion"], description: "Boost your brand with marketing." },
  { name: "Reddit Content Creation", keywords: ["reddit", "content", "posts"], description: "High-quality Reddit posts and comments." },
  { name: "Social Media Management", keywords: ["social", "media", "management"], description: "Manage your social profiles professionally." },
  { name: "Legal Consultation", keywords: ["legal", "consult", "lawyer"], description: "Basic legal advice and consultation." }
];

// ===== SAFE FILE READ/WRITE =====
function safeReadJSON(filePath) {
  try {
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("⚠️ Failed to read JSON:", err);
    return [];
  }
}

function safeWriteJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("⚠️ Failed to write JSON:", err);
  }
}

// ===== SERVICE LOOKUP =====
function findServiceByKeyword(keyword) {
  return services.find(svc =>
    svc.keywords.some(kw => kw.toLowerCase() === keyword.toLowerCase())
  );
}

// ===== PAYMENT GENERATION =====
function generatePaymentInstructions(serviceName, payer, amount) {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(10000 + Math.random() * 90000);
  const payerInitials = payer
    .split(" ")
    .map(w => w[0])
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

// ===== COMMAND HANDLER =====
router.post("/", (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.json({ reply: "⚠️ Please send a valid command message." });
  }

  const parts = message.trim().split(/\s+/);
  const cmd = parts[0].toLowerCase();

  // === HELP COMMAND ===
  if (cmd === "help") {
    const serviceList = services.map(svc => `- ${svc.name}: ${svc.description}`).join("\n");
    return res.json({
      reply: `🦜 Blackbeard Services Available:\n${serviceList}\n\nTo get payment instructions, type:\npayment [service keyword] [your full name] [amount]\nExample: payment rum John Doe 150`
    });
  }

  // === PAYMENT COMMAND ===
  if (cmd === "payment") {
    if (parts.length < 4) {
      return res.json({
        reply: "Usage: payment [service keyword] [your full name] [amount]"
      });
    }

    const serviceKeyword = parts[1];
    const payerName = parts.slice(2, parts.length - 1).join(" ");
    const amountStr = parts[parts.length - 1];
    const amount = parseFloat(amountStr);

    if (isNaN(amount) || amount <= 0) {
      return res.json({ reply: "⚠️ Invalid amount. Please enter a valid number." });
    }

    const service = findServiceByKeyword(serviceKeyword);
    if (!service) {
      return res.json({ reply: `⚠️ Service keyword "${serviceKeyword}" not found. Use "help" to see available services.` });
    }

    const { paymentReference, paymentInfo } = generatePaymentInstructions(
      service.name,
      payerName,
      amount
    );

    // Log the payment request in vaultkeeper
    logCoinEntry({
      service: service.name,
      payer: payerName,
      amount,
      paymentLink: paymentReference,
      confirmed: false,
    });

    return res.json({
      reply: `🪙 Payment instructions for ${service.name}:`,
      paymentInfo
    });
  }

  // === SHOW BALANCE COMMAND ===
  if (cmd === "balance") {
    const log = readVaultLog();
    const total = log.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
    return res.json({ reply: `💰 Total coins in vault: R${total.toFixed(2)}` });
  }

  // === LIST SERVICES COMMAND ===
  if (cmd === "services") {
    const list = services.map(svc => `${svc.name} (${svc.keywords[0]})`).join(", ");
    return res.json({ reply: `Available services: ${list}` });
  }

  // === UNKNOWN COMMAND FALLBACK ===
  return res.json({
    reply: "⚠️ Unknown command. Type 'help' to see available commands."
  });
});

module.exports = router;