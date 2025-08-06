// comms.js – Client Message Tower & Bot Auto-Reply Engine v2.0
const express = require("express");
const router = express.Router();

const triggerWords = [
  "bot", "freelancer", "hire", "developer", "help", "website", "app", "automation", "chatgpt",
  "cv", "resume", "proofread", "study", "voice", "marketing", "design", "writing", "content"
];

const yocoLink = "https://pay.yoco.com/r/mojop9";

const defaultReply = `
🤖 Ahoy! I'm Scorpio-X, your digital assistant from the Blackbeard Empire.

🛠️ Services: CVs, websites, bots, tutoring, writing, voice, design, AI & more.
💳 Start your job: <a href="${yocoLink}" target="_blank">Click here to pay securely</a>

Or send your custom job details now — and I’ll alert the Vaultkeeper. 🏴‍☠️
`;

router.post("/comms", express.json(), (req, res) => {
  const msg = req.body.message?.toLowerCase().trim();
  console.log("📨 Incoming Client Message:", msg);

  if (!msg) {
    return res.status(400).send({ reply: "⚠️ No message received. Try again, sailor." });
  }

  const matched = triggerWords.some(word => msg.includes(word));

  if (matched) {
    console.log("🎯 Trigger keyword matched. Sending default offer.");
    return res.send({
      reply: defaultReply
    });
  }

  console.log("🕵️ Message logged. No trigger keywords found.");
  return res.send({ reply: "📬 Message received. A Vaultkeeper will reply shortly if urgent." });
});

module.exports = router;