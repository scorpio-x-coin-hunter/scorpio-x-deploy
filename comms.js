const express = require("express");
const router = express.Router();
const { generatePaymentLink } = require("./vaultkeeper_helpers");

const triggerWords = [
  "bot", "freelancer", "hire", "developer", "help",
  "website", "app", "automation", "chatgpt", "ai", "scorpio"
];

const defaultService = {
  name: "General AI Help",
  keywords: ["help", "ai", "assistant"],
  amount: 100, // Example default amount
};

router.post("/comms", express.json(), async (req, res) => {
  const msg = req.body.message?.toLowerCase().trim();
  console.log("📨 Client Message Received:", msg);

  if (!msg) {
    return res.status(400).send({ reply: "⚠️ No message received. Try again." });
  }

  const matched = triggerWords.some(word => msg.includes(word));

  if (matched) {
    const paymentLink = await generatePaymentLink(defaultService);

    console.log("🎯 Coin-triggering keyword detected!");
    return res.send({
      reply: `
🤖 Hello! I'm Scorpio-X from the Blackbeard Empire.

If you need a bot, website, automation, or AI help — you've landed at the right dock.

💳 Click to pay and begin: ${paymentLink}

I'll notify the Vaultkeeper and we’ll begin shortly.
      `.trim()
    });
  }

  console.log("🕵️ Message received — no trigger words found.");
  return res.send({ reply: "📬 Message logged. We'll reply shortly if it's urgent." });
});

module.exports = router;