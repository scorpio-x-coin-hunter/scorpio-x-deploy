// comms.js – Blackbeard Empire Bot Communication Hub (Yoco-integrated)
const express = require("express");
const router = express.Router();
const services = require("./services");

const yocoGeneralLink = "https://pay.yoco.com/r/mojop9"; // Default fallback

const defaultReply = `
🤖 Hello! I'm Scorpio-X, your AI assistant from the Blackbeard Empire.

If you're looking for bots, websites, automations, or creative services — you're in the right place.

💳 Please describe what you need, and I’ll direct you to the correct vault.
`;

const secretCaptainKey = "blackbeard-command"; // Change this later

router.post("/comms", express.json(), (req, res) => {
  const msg = req.body.message?.toLowerCase().trim();
  console.log("📨 Client Message Received:", msg);

  if (!msg) {
    return res.status(400).send({ reply: "⚠️ No message received. Try again." });
  }

  // Captain override
  if (msg === secretCaptainKey) {
    console.log("🗝️ Captain override accessed.");
    return res.send({
      reply: "🏴‍☠️ Captain, all bots are standing by. Vault secured. Last coin detected today."
    });
  }

  // Check for matching service
  const match = services.find(service =>
    service.keywords.some(keyword => msg.includes(keyword))
  );

  if (match) {
    console.log(`🎯 Matched Service: ${match.name}`);
    return res.send({
      reply: `🧭 Service Found: *${match.name}*\n\nTo continue, please make payment here:\n${match.link}`
    });
  }

  console.log("🕵️ No direct service match. Sending default reply.");
  return res.send({
    reply: defaultReply
  });
});

module.exports = router;