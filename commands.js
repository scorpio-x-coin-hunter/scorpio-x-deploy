// commands.js
const express = require("express");
const router = express.Router();
const { logCoinEntry, calculateVaultBalance } = require("./vaultkeeper");

// Configurable services and their keywords
const services = [
  { name: "Ship Repair", keywords: ["repair", "fixship", "shiprepair"] },
  { name: "Treasure Map Access", keywords: ["map", "treasuremap"] },
  { name: "Rum Supply", keywords: ["rum", "drink", "beverage"] },
  // Add more services here
];

// Helper: find service by keyword
function findServiceByKeyword(keyword) {
  return services.find(svc =>
    svc.keywords.some(kw => kw.toLowerCase() === keyword.toLowerCase())
  );
}

// Generate unique payment reference and instructions
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

// POST /command
router.post("/", (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.json({ reply: "⚠️ Please send a valid command message." });
  }

  const parts = message.trim().split(/\s+/);
  const cmd = parts[0].toLowerCase();

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

  if (cmd === "balance") {
    const balance = calculateVaultBalance();
    return res.json({ reply: `💰 Current vault balance: R${balance.toFixed(2)}` });
  }

  if (cmd === "services") {
    const list = services.map(s => s.name).join(", ");
    return res.json({ reply: `🛠️ Available services: ${list}` });
  }

  // Basic chat replies for greetings and info
  const lowerMsg = message.toLowerCase();
  if (lowerMsg.includes("hello") || lowerMsg.includes("hi")) {
    return res.json({ reply: "Ahoy! Captain Nicolaas at your service. How can I help you today?" });
  }
  if (lowerMsg.includes("help")) {
    return res.json({ reply: "Send 'payment [service] [your name] [amount]' to get a payment link.\nTry 'services' to see available services." });
  }

  return res.json({ reply: "⚠️ Unknown command. Try 'help' or 'services'." });
});

module.exports = router;