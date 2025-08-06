// comms.js – Blackbeard Message Tower + Payment Redirect Engine v2.0

const express = require("express");
const router = express.Router();

const triggerWords = ["bot", "freelancer", "hire", "developer", "help", "website", "app", "automation", "chatgpt", "cv", "services"];

// 🔁 Simulated dynamic vault link (replace with real vault API call if needed)
function getVaultLink() {
  return "https://blackbeard-vault.fakepaylink.com/pay"; // Placeholder
}

const defaultReply = () => `
🤖 Hello! I’m Scorpio-X, your AI assistant from the Blackbeard Empire.

If you need a bot, website, CV, or AI solution — you're in the right place.

💳 Secure payments are handled by the Empire Vault.
👉 Begin here: ${getVaultLink()}

Or describe what you need, and I’ll alert the Vaultkeeper.
`;

router.post("/comms", express.json(), (req, res) => {
  const msg = req.body.message?.toLowerCase().trim();
  console.log("📨 Client Message Received:", msg);

  if (!msg) {
    return res.status(400).send({ reply: "⚠️ No message received. Try again." });
  }

  const matched = triggerWords.some(word => msg.includes(word));

  if (matched) {
    console.log("🎯 Trigger word detected. Responding with Vault link.");
    return res.send({ reply: defaultReply() });
  }

  console.log("🕵️ Message received. No trigger found.");
  return res.send({ reply: "📬 Message logged. A human agent will respond soon if needed." });
});

module.exports = router;