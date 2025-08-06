// comms.js – Blackbeard Empire Client Message Tower & Bot Auto-Reply Engine v2.0
const express = require("express");
const router = express.Router();

const triggerWords = [
  "bot", "freelancer", "hire", "developer", "help", "website",
  "app", "automation", "chatgpt", "ai", "design", "build", "copywriting", "cv"
];

const yocoLink = "https://pay.yoco.com/r/mojop9";

const defaultReply = `
🤖 Hello! I'm Scorpio-X, your AI agent from the Blackbeard Empire.

If you're looking for a bot, website, CV, automation, or AI-powered service — you're in the right dock.

💳 You can begin here: ${yocoLink}

Or describe your task and I’ll notify the Vaultkeeper. 🔐
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
    return res.send({ reply: defaultReply });
  }

  console.log("🕵️ No trigger words found. Logging message for review.");
  return res.send({ reply: "📬 Message received. We'll reply shortly if needed." });
});

module.exports = router;