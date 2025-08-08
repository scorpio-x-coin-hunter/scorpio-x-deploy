const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const { readVaultLog, logCoinEntry, calculateVaultBalance } = require("./vaultkeeperHelper");

// ===== CONFIGURABLE SERVICES =====
const services = [
  { name: "Ship Repair", keywords: ["repair", "fixship", "shiprepair"] },
  { name: "Treasure Map Access", keywords: ["map", "treasuremap"] },
  { name: "Rum Supply", keywords: ["rum", "drink", "beverage"] },
  { name: "Reddit Marketing", keywords: ["reddit", "marketing", "promo"] },
  { name: "Logo Design", keywords: ["logo", "design", "branding"] },
  { name: "Website Development", keywords: ["website", "web", "dev"] },
  { name: "CV Writing", keywords: ["cv", "resume", "job"] },
  { name: "Copywriting", keywords: ["copy", "writing", "content"] },
  { name: "Social Media Management", keywords: ["social", "media", "management"] },
  { name: "SEO Optimization", keywords: ["seo", "optimization"] },
  // Add more services here as needed
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

// ===== MAIN COMMAND HANDLER =====
router.post("/", (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.json({ reply: "⚠️ Please send a valid command message." });
  }

  const parts = message.trim().split(/\s+/);
  const cmd = parts[0].toLowerCase();

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
      return res.json({ reply: `⚠️ Service keyword "${serviceKeyword}" not found.` });
    }

    const { paymentReference, paymentInfo } = generatePaymentInstructions(
      service.name,
      payerName,
      amount
    );

    // Log the payment request
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

  // === BALANCE COMMAND ===
  if (cmd === "balance") {
    const balance = calculateVaultBalance();
    return res.json({ reply: `💰 Current vault balance is R${balance.toFixed(2)}.` });
  }

  // === SERVICES COMMAND ===
  if (cmd === "services") {
    const list = services.map(s => `- ${s.name} (keywords: ${s.keywords.join(", ")})`).join("\n");
    return res.json({ reply: `🛠️ Available services:\n${list}` });
  }

  // === HELP COMMAND ===
  if (cmd === "help") {
    return res.json({
      reply: `Available commands:
- payment [service keyword] [your full name] [amount]
- balance
- services
- help
`
    });
  }

  // Fallback reply for unknown commands
  return res.json({ reply: "⚠️ Unknown command. Try 'help' for a list of commands." });
});

module.exports = router;