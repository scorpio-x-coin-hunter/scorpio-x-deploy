const fs = require("fs");
const path = require("path");
const express = require("express");
const router = express.Router();
const services = require("./services");
const vaultkeeperHelper = require("./vaultkeeperHelper"); // reuse helpers

const {
  logCoinEntry,
  calculateVaultBalance,
  readVaultLog,
} = vaultkeeperHelper;

// Simple helper to find service by keyword
function findServiceByKeyword(keyword) {
  return services.find((svc) =>
    svc.keywords.some((kw) => kw.toLowerCase() === keyword.toLowerCase())
  );
}

// Generate payment instructions for a service request
function generatePaymentInstructions(serviceName, payer, amount) {
  // Generate unique payment reference (same logic as vaultkeeper)
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(10000 + Math.random() * 90000);
  const payerInitials = payer
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();

  const paymentReference = `BB${datePart}${randomPart}${payerInitials}`;

  // Your Standard Bank payment details
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

  // Log deposit request in vault
  logCoinEntry({ service: serviceName, payer, amount, paymentLink: paymentReference });

  return { paymentReference, paymentInfo };
}

// Command router to handle incoming commands from /command POST
router.post("/command", (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.json({ reply: "⚠️ Please send a valid command message." });
  }

  const parts = message.trim().split(/\s+/);
  const cmd = parts[0].toLowerCase();

  // Handle payment commands: payment [serviceKeyword] [payerName] [amount]
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
      return res.json({ reply: `⚠️ Service keyword "${serviceKeyword}" not found.` });
    }

    // Generate payment instructions and log
    const { paymentReference, paymentInfo } = generatePaymentInstructions(
      service.name,
      payerName,
      amount
    );

    return res.json({
      reply: `🪙 Payment instructions for ${service.name}:\n\n${paymentInfo}\n\nYour payment reference is: ${paymentReference}`,
    });
  }

  // Confirm payment command: confirm payment [paymentReference]
  if (cmd === "confirm") {
    if (parts.length < 3) {
      return res.json({
        reply: "Usage: confirm payment [payment reference code]",
      });
    }
    const subCmd = parts[1].toLowerCase();
    if (subCmd !== "payment") {
      return res.json({ reply: "Unknown confirm command. Use 'confirm payment [ref]'." });
    }
    const paymentRef = parts.slice(2).join("");
    // Check vault log for this paymentRef
    const log = readVaultLog();
    const found = log.find((entry) => entry.paymentLink === paymentRef);
    if (!found) {
      return res.json({ reply: `❌ Payment reference ${paymentRef} not found.` });
    }
    // Mark confirmed (can add confirmation timestamp)
    found.confirmed = true;
    // Rewrite log with confirmation (for persistence)
    fs.writeFileSync(
      path.join(__dirname, "vault_log.json"),
      JSON.stringify(log, null, 2)
    );
    return res.json({
      reply: `✅ Payment reference ${paymentRef} confirmed. Thank you!`
    });
  }

  // Default fallback reply
  return res.json({
    reply: "⚠️ Unknown command. Use 'payment' or 'confirm payment'.",
  });
});

module.exports = router;