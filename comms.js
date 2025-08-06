// comms.js – Client Message Tower & Bot Auto-Reply Engine
const express = require("express");
const router = express.Router();

const triggerWords = [
  "bot", "freelancer", "hire", "developer", "help", "website",
  "app", "automation", "chatgpt", "resume", "cv", "design",
  "services", "writing", "ai", "logo", "copywriting", "job"
];

const defaultReply = `
🤖 Hello! I'm Scorpio-X from the ⚓ Blackbeard Empire.

I can help you with bots, websites, content, CVs, automation, and more.

💳 To begin, choose a service: https://scorpio-x-core.onrender.com

Need something custom? Just tell me what you need, and I’ll notify the Vaultkeeper.`;

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

  console.log("🕵️ Message received — no trigger words found.");
  return res.send({ reply: "📬 Message received. We’ll be in touch shortly, Captain is watching..." });
});

module.exports = router;