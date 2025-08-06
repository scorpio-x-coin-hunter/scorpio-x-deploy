// commands.js – Blackbeard Captain Override & Command Center v2.0 Full Upgrade

const express = require("express");
const router = express.Router();

const vaultkeeper = require("./vaultkeeperHelper"); // helper functions for vaultkeeper (you'll implement)
const services = require("./services"); // your services array with keywords & payment links

const CAPTAIN_SECRET = process.env.CAPTAIN_SECRET || "blackbeard-command"; 
const VAULT_WITHDRAW_PASSWORD = process.env.VAULT_WITHDRAW_PASSWORD || "vaultpass-2025"; 

// Helper: Find service by keyword
function findServiceByKeyword(keyword) {
  keyword = keyword.toLowerCase();
  return services.find(s => s.keywords.some(k => k.toLowerCase() === keyword));
}

// Generate new payment link for a service (simulate or integrate your payment API here)
function generatePaymentLink(serviceName) {
  // In real case, integrate your payment system to generate unique link here
  return `https://pay.yoco.com/r/${serviceName.toLowerCase().replace(/\s+/g, "")}-unique`;
}

router.post("/command", express.json(), async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "⚠️ No command received." });
  }

  const msg = message.toLowerCase().trim();

  // 🗝️ Captain Override
  if (msg === CAPTAIN_SECRET) {
    console.log("🗝️ Captain override accessed.");
    return res.send({
      reply: `🏴‍☠️ Captain Nicolaas, all bots operational.\nVaultkeeper active.\nEmpire logs stable.\nNo intrusions detected.`
    });
  }

  // Vaultkeeper: Check Vault Balance
  if (msg === "vault balance") {
    const balance = await vaultkeeper.getVaultBalance();
    return res.send({ reply: `💰 Vault Balance: R${balance.toFixed(2)}` });
  }

  // Vaultkeeper: Withdraw command format:
  // "withdraw <amount> <password> <yoco_payment_link>"
  if (msg.startsWith("withdraw ")) {
    const parts = msg.split(" ");
    if (parts.length < 4) {
      return res.send({ reply: "⚠️ Invalid withdraw command. Format: withdraw <amount> <password> <payment_link>" });
    }
    const amount = parseFloat(parts[1]);
    const password = parts[2];
    const payLink = parts.slice(3).join(" ");

    if (password !== VAULT_WITHDRAW_PASSWORD) {
      return res.send({ reply: "🚫 Incorrect vault withdrawal password." });
    }

    const success = await vaultkeeper.withdrawAmount(amount, payLink);
    if (success) {
      return res.send({ reply: `✅ Withdraw R${amount.toFixed(2)} sent to ${payLink}` });
    } else {
      return res.send({ reply: `❌ Withdrawal failed. Check vault balance or details.` });
    }
  }

  // Create payment link for service request by keyword
  // Example: "payment cv" or "payment logo"
  if (msg.startsWith("payment ")) {
    const keyword = msg.split(" ")[1];
    const service = findServiceByKeyword(keyword);

    if (!service) {
      return res.send({ reply: `❓ Service with keyword '${keyword}' not found.` });
    }

    // Generate unique payment link for this transaction
    const newLink = generatePaymentLink(service.name);
    // Ideally: Store this payment link and track it in vaultkeeper

    return res.send({ reply: `💳 Payment link for ${service.name}:\n${newLink}` });
  }

  // Client attracting message for Reddit or social platforms
  if (msg === "attract clients") {
    const message = 
`🏴‍☠️ Captain Nicolaas here! Need top-notch help with your projects? 
Our Blackbeard bots deliver CVs, websites, apps, marketing & more! 
Pay securely with unique links. DM us to get started! ⚓️`;
    return res.send({ reply: message });
  }

  // Placeholder: twinkle and tweet copyrighted material (to be expanded)
  if (msg === "twinkle tweet") {
    return res.send({ reply: "✨ Twinkling and tweeting content to secure copyright compliance... (feature coming soon)" });
  }

  // 📡 System Status
  if (msg.includes("status report")) {
    return res.send({
      reply: "🛰️ System Status: Online\nPing: Stable\nBots: Listening for orders.\nVault: Accepting coins."
    });
  }

  // Default fallback
  return res.send({ reply: "❌ Unknown command. Use your override key or ask for status report." });
});

module.exports = router;