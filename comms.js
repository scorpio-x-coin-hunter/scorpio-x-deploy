const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

// Vaultkeeper helper functions (read/write logs)
const {
  readVaultLog,
  writeVaultLog,
  logCoinEntry,
  calculateVaultBalance,
} = require("./vaultkeeperHelper");

// ====== Configurable services ======
const services = [
  { name: "Ship Repair", keywords: ["repair", "fixship", "shiprepair"] },
  { name: "Treasure Map Access", keywords: ["map", "treasuremap"] },
  { name: "Rum Supply", keywords: ["rum", "drink", "beverage"] },
];

// Helper: safe read JSON file
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

// Helper: safe write JSON file
function safeWriteJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("⚠️ Failed to write JSON:", err);
  }
}

// Find service by keyword (case-insensitive)
function findServiceByKeyword(keyword) {
  return services.find((svc) =>
    svc.keywords.some((kw) => kw.toLowerCase() === keyword.toLowerCase())
  );
}

// Generate payment reference & instructions
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

  // Bank details - update here if needed
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

  // Log the payment request (unconfirmed)
  const vaultPath = path.join(__dirname, "vault_log.json");
  const logData = safeReadJSON(vaultPath);

  logData.push({
    service: serviceName,
    payer,
    amount,
    paymentLink: paymentReference,
    confirmed: false,
    timestamp: new Date().toISOString(),
  });

  safeWriteJSON(vaultPath, logData);

  return { paymentReference, paymentInfo };
}

// === MAIN COMMAND HANDLER ===
router.post("/", express.json(), (req, res) => {
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
      return res.json({ reply: "⚠️ Invalid amount. Please enter a valid number." });
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

    return res.json({
      reply: `🪙 Payment instructions for ${service.name}:`,
      paymentInfo,
    });
  }

  // === CONFIRM PAYMENT ===
  if (cmd === "confirm" && parts[1]?.toLowerCase() === "payment") {
    if (parts.length < 3) {
      return res.json({
        reply: "Usage: confirm payment [payment reference code]",
      });
    }

    const paymentRef = parts.slice(2).join("");
    const vaultPath = path.join(__dirname, "vault_log.json");
    const logData = safeReadJSON(vaultPath);

    const found = logData.find((entry) => entry.paymentLink === paymentRef);
    if (!found) {
      return res.json({ reply: `❌ Payment reference ${paymentRef} not found.` });
    }

    found.confirmed = true;
    safeWriteJSON(vaultPath, logData);

    return res.json({
      reply: `✅ Payment reference ${paymentRef} confirmed. Thank you, ${found.payer}!`,
    });
  }

  // === DEFAULT BOT RESPONSE ===
  return res.json({
    reply: `☠️ Arrr, I heard ye say: "${message}". But I only understand 'payment' and 'confirm payment' commands... for now.`,
  });
});

// --- BEGIN: Communications router included from your recent snippet ---

// In-memory message store (demo only)
const messages = [];

// Simple bot auto-reply logic for messages
function generateBotReply(message) {
  const msg = message.toLowerCase();

  if (msg.includes("hello") || msg.includes("hi")) {
    return "Ahoy! Captain Nicolaas at your service. How can we assist you today?";
  }
  if (msg.includes("services")) {
    return "We offer CV writing, logo design, website dev, marketing & more. Ask for a payment link!";
  }
  if (msg.includes("payment link")) {
    return "Send 'payment <service>' to get your unique payment link.";
  }
  if (msg.includes("attract clients")) {
    return `🏴‍☠️ Captain Nicolaas here! Need top-notch help with your projects? 
Our Blackbeard bots deliver CVs, websites, apps, marketing & more! 
Pay securely with unique links. DM us to get started! ⚓️`;
  }
  // Default fallback
  return "Thanks for your message. We'll get back to you shortly.";
}

// Endpoint to receive client messages (users or bots)
router.post("/comms/message", express.json(), (req, res) => {
  const { sender, message } = req.body;

  if (!sender || !message) {
    return res.status(400).json({ message: "Missing sender or message." });
  }

  // Save message in-memory
  messages.push({
    sender,
    message,
    timestamp: new Date().toISOString(),
  });

  console.log(`📡 Message received from ${sender}: ${message}`);

  // Generate bot reply
  const reply = generateBotReply(message);

  res.json({ reply });
});

// Endpoint to get all messages (for monitoring/debugging)
router.get("/comms/messages", (req, res) => {
  res.json({ messages });
});

// Export the router
module.exports = router;