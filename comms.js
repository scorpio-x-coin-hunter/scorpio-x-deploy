// comms.js – Client Message Tower & Bot Auto-Reply Engine
const express = require("express");
const router = express.Router();

const triggerWords = ["bot", "freelancer", "hire", "developer", "help", "website", "app", "automation", "chatgpt"];
const yocoLink = "https://pay.yoco.com/r/mojop9";

const defaultReply = `
🤖 Hello! I'm Scorpio-X, your AI assistant from the Blackbeard Empire.

If you need a bot, website, automation, or AI solution — you're in the right place.

💳 To begin, send a secure payment here: ${yocoLink}

Or describe what you need, and I’ll notify the Vaultkeeper.
`;

router.post("/comms", express.json(), (req, res) => {
  const msg = req.body.message?.toLowerCase().trim();
  console.log("📨 Client Message Received:", msg);

  if (!msg) {
    return res.status(400).send({ reply: "⚠️ No message received. Try again." });
  }

  const matched = triggerWords.some(word => msg.includes(word));

  if (matched) {
    console.log("🎯 Coin-triggering keyword detected!");
    return res.send({
      reply: defaultReply
    });
  }

  console.log("🕵️ Message received — no trigger words found.");
  return res.send({ reply: "📬 Message logged. We'll reply shortly if it's urgent." });
});

module.exports = router;