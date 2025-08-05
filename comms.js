// comms.js – Blackbeard AI Client Message Engine
const express = require("express");
const router = express.Router();

const triggerWords = [
  "bot", "freelancer", "hire", "developer", "cv", "resume", "help",
  "website", "app", "automation", "ai", "chatgpt", "service", "logo"
];

const yocoLinks = {
  cv: "https://pay.yoco.com/r/7v8zDd",
  website: "https://pay.yoco.com/r/2DevRY",
  app: "https://pay.yoco.com/r/4njGOA",
  chatbot: "https://pay.yoco.com/r/4G0xe9",
  default: "https://pay.yoco.com/r/mojop9"
};

function getPaymentLink(msg) {
  const lower = msg.toLowerCase();
  if (lower.includes("cv") || lower.includes("resume")) return yocoLinks.cv;
  if (lower.includes("website")) return yocoLinks.website;
  if (lower.includes("app")) return yocoLinks.app;
  if (lower.includes("chatbot") || lower.includes("ai")) return yocoLinks.chatbot;
  return yocoLinks.default;
}

router.post("/comms", express.json(), (req, res) => {
  const msg = req.body.message?.toLowerCase().trim();
  console.log("📨 Client Message Received:", msg);

  if (!msg) {
    return res.status(400).send({ reply: "⚠️ No message received. Try again." });
  }

  const matched = triggerWords.some(word => msg.includes(word));

  if (matched) {
    const paymentLink = getPaymentLink(msg);
    const response = `
🤖 Hello! I'm Scorpio-X, your AI assistant from the Blackbeard Empire.

It sounds like you need help with a service I offer. Here’s the secure payment link to get started:

💳 ${paymentLink}

Once paid, I’ll begin your request and send confirmation back to the Captain.`;

    console.log("🎯 Triggered! Responding with payment link.");
    return res.send({ reply: response });
  }

  console.log("🕵️ Message received — no trigger words found.");
  return res.send({ reply: "📬 Message logged. We'll reply shortly if it's urgent." });
});

module.exports = router;