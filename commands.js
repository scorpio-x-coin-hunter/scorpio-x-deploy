// commands.js — Handles service commands and payment generation

const express = require("express");
const router = express.Router();
const { logCoinEntry } = require("./vaultkeeperHelper");

// ===== CONFIGURABLE SERVICES =====
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

// ===== SERVICE LOOKUP =====
function findServiceByKeyword(keyword) {
  return services.find((svc) =>
    svc.keywords.some((kw) => kw.toLowerCase() === keyword.toLowerCase())
  );
}

// ===== PAYMENT GENERATION =====
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
        reply: "Usage: payment [service keyword] [your full name] [amount]",
      });
    }

    const serviceKeyword = parts[1];
    const payerName = parts.slice(2, parts.length - 1).join(" ");
    const amountStr = parts[parts.length - 1];
    const amount = parseFloat(amountStr);

    if (isNaN(amount) || amount <= 0) {
      return res.json({
        reply: "⚠️ Invalid amount. Please enter a valid number.",
      });
    }

    const service = findServiceByKeyword(serviceKeyword);
    if (!service) {
      return res.json({
        reply: `⚠️ Service keyword "${serviceKeyword}" not found.`,
      });
    }

    const { paymentReference, paymentInfo } = generatePaymentInstructions(
      service.name,
      payerName,
      amount
    );

    // Log payment request
    logCoinEntry({
      service: service.name,
      payer: payerName,
      amount,
      paymentLink: paymentReference,
      confirmed: false,
    });

    return res.json({
      reply: `🪙 Payment instructions for ${service.name}:`,
      paymentInfo,
    });
  }

  // Fallback reply
  res.json({ reply: "⚠️ Unknown command. Please try again." });
});

module.exports = router;