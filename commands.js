// commands.js – Scorpio-X Blackbeard Empire Commands Module v2.2

const express = require("express");
const router = express.Router();
const services = require("./services");
const fetch = require("node-fetch");

const VAULT_DEPOSIT_URL = process.env.VAULT_DEPOSIT_URL || "http://localhost:3000/vault/deposit";
const VAULT_REPORT_URL = process.env.VAULT_REPORT_URL || "http://localhost:3000/vault/report";
const WITHDRAWAL_PASSWORD = process.env.VAULT_PASS || "blackbeard-secret-2025";

// Helper to find service by keyword
function findServiceByKeyword(keyword) {
  keyword = keyword.toLowerCase();
  return services.find((s) => s.keywords.some((k) => k.toLowerCase() === keyword));
}

router.post("/command", express.json(), async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ reply: "⚠️ No command received." });
  }

  const msg = message.toLowerCase().trim();
  const parts = msg.split(" ");

  // Captain override
  if (msg === "blackbeard-command") {
    return res.send({ reply: "🏴‍☠️ Captain override active. All systems operational." });
  }

  // Vault balance request
  if (msg === "vault balance") {
    try {
      const response = await fetch(VAULT_REPORT_URL);
      const data = await response.json();
      return res.send({ reply: `💰 Vault Balance: R${data.totalBalance.toFixed(2)}` });
    } catch {
      return res.send({ reply: "⚠️ Unable to fetch vault balance right now." });
    }
  }

  // Withdraw command: "withdraw <amount> <password>"
  if (parts[0] === "withdraw") {
    if (parts.length < 3) {
      return res.send({ reply: "⚠️ Withdraw command format: withdraw <amount> <password>" });
    }
    const amount = parseFloat(parts[1]);
    const password = parts[2];

    if (password !== WITHDRAWAL_PASSWORD) {
      return res.send({ reply: "🚫 Incorrect withdrawal password." });
    }

    try {
      const response = await fetch("http://localhost:3000/vault/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, amount }),
      });
      const data = await response.json();
      return res.send({ reply: data.message || "Withdrawal processed." });
    } catch {
      return res.send({ reply: "⚠️ Withdrawal failed." });
    }
  }

  // Payment command: "payment <service_keyword> <payerName> <amount>"
  if (parts[0] === "payment") {
    if (parts.length < 4) {
      return res.send({ reply: "⚠️ Payment command format: payment <service> <payerName> <amount>" });
    }
    const serviceKeyword = parts[1];
    const payerName = parts[2];
    const amount = parseFloat(parts[3]);

    if (isNaN(amount) || amount <= 0) {
      return res.send({ reply: "⚠️ Please provide a valid amount greater than 0." });
    }

    const service = findServiceByKeyword(serviceKeyword);
    if (!service) {
      return res.send({ reply: `❓ Service '${serviceKeyword}' not found.` });
    }

    // Call vaultkeeper deposit endpoint to generate payment reference and instructions
    try {
      const response = await fetch(VAULT_DEPOSIT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service: service.name, payer: payerName, amount }),
      });
      const data = await response.json();
      if (data.paymentInfo) {
        // Extract payment reference for example
        const paymentRefMatch = data.paymentInfo.match(/Payment Reference: (.+)/);
        const paymentRef = paymentRefMatch ? paymentRefMatch[1] : "<reference>";

        return res.send({
          reply: `💰 Payment Instructions for ${service.name}:\n\n${data.paymentInfo}\n\n📝 After making the payment, please confirm by sending:\nconfirm payment ${paymentRef}\n\nExample:\nconfirm payment ${paymentRef}`,
        });
      } else {
        return res.send({ reply: "⚠️ Could not generate payment instructions right now." });
      }
    } catch (err) {
      return res.send({ reply: "⚠️ Error contacting vaultkeeper." });
    }
  }

  // Confirm payment command: "confirm payment <paymentReference>"
  if (parts[0] === "confirm" && parts[1] === "payment") {
    if (parts.length < 3) {
      return res.send({ reply: "⚠️ Confirm payment format: confirm payment <paymentReference>" });
    }
    const paymentReference = parts[2].toUpperCase();

    try {
      const response = await fetch(VAULT_REPORT_URL);
      const data = await response.json();

      // Find payment with exact reference match
      const foundPayment = data.log.find(
        (entry) =>
          entry.paymentReference &&
          entry.paymentReference.toUpperCase() === paymentReference
      );

      if (foundPayment) {
        return res.send({
          reply: `✅ Payment confirmed!\nService: ${foundPayment.service}\nPayer: ${foundPayment.payer}\nAmount: R${foundPayment.amount.toFixed(
            2
          )}\nDate: ${new Date(foundPayment.timestamp).toLocaleString()}\n\nThank you for your payment, Captain Nicolaas will process your request shortly.`,
        });
      } else {
        return res.send({ reply: `❌ No payment found with reference ${paymentReference}. Please check and try again.` });
      }
    } catch (err) {
      return res.send({ reply: "⚠️ Unable to verify payment at the moment." });
    }
  }

  // Attract clients command (help text)
  if (msg === "attract clients") {
    return res.send({
      reply: `🏴‍☠️ Captain Nicolaas here! Need expert help? Our Blackbeard bots handle CVs, web dev, marketing & more.\nPay directly to Standard Bank with unique payment references generated per client!\n\n📝 To get started, send a command like:\npayment <service> <your full name> <amount>\n\nThen confirm your payment with:\nconfirm payment <paymentReference>\n\nFair winds and smooth sailing! ⚓️`,
    });
  }

  // Unknown command fallback
  return res.send({
    reply:
      "❌ Unknown command.\nUse one of:\n- payment <service> <payerName> <amount>\n- confirm payment <paymentReference>\n- vault balance\n- withdraw <amount> <password>",
  });
});

module.exports = router;