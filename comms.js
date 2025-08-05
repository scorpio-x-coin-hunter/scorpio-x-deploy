const express = require("express");
const fs = require("fs");
const router = express.Router();

const yocoBase = "https://pay.yoco.com/r/";

// Map your services to their Yoco payment links
const serviceLinkMap = {
  "cv": yocoBase + "mojop9-cv",
  "cover letter": yocoBase + "mojop9-coverletter",
  "studybuddy": yocoBase + "mojop9-studybuddy",
  "proofreading": yocoBase + "mojop9-proofreading",
  "portfolio": yocoBase + "mojop9-portfolio",
  "freelance profile": yocoBase + "mojop9-freelance",
  "social pack": yocoBase + "mojop9-socialpack",
  "bio writeup": yocoBase + "mojop9-biowriteup",
  "email letter": yocoBase + "mojop9-emailletter"
  // Add more services here
};

// Secret override command (only for you, Captain!)
const captainOverrideKey = "blackbeardcommand";

// General keywords to trigger the default response
const triggerWords = [
  "bot", "freelancer", "hire", "developer", "help", "website",
  "app", "automation", "chatgpt",
  ...Object.keys(serviceLinkMap) // Include service keywords
];

// Logs all incoming messages to cointrail.log
function logCoinTrail(message) {
  const log = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFile("cointrail.log", log, (err) => {
    if (err) console.error("[Logger] Failed to write coin trail:", err);
  });
}

// Helper to find matching service in a message
function findServiceKeyword(msg) {
  const lowerMsg = msg.toLowerCase();
  return Object.keys(serviceLinkMap).find(keyword => lowerMsg.includes(keyword));
}

// The Bot Route
router.post("/comms", express.json(), (req, res) => {
  const msg = req.body.message?.toLowerCase().trim();
  console.log("📨 Client Message Received:", msg);

  if (!msg) {
    return res.status(400).send({ reply: "⚠️ No message received. Try again." });
  }

  // Secret Captain Command
  if (msg === captainOverrideKey) {
    console.log("🗝️ Captain override accessed.");
    return res.send({
      reply: "🏴‍☠️ Captain, the Blackbeard Empire reports: All bots operational. Last coin detected at 12:42PM."
    });
  }

  // VaultKeeper Status Command
  if (msg === "vault status") {
    return res.send({ reply: "🗃️ VaultKeeper status: Vault secure. GodBots standing by." });
  }

  // Log message to coin trail
  logCoinTrail(msg);

  // Look for service keyword
  const matchedService = findServiceKeyword(msg);

  if (matchedService) {
    const paymentLink = serviceLinkMap[matchedService];
    return res.send({
      reply: `🤖 You requested *${matchedService}* service.\n💳 Complete your payment here: ${paymentLink}\nOnce confirmed, Scorpio-X will get to work!`
    });
  }

  // Trigger word, but no match
  const matchedGeneral = triggerWords.some(word => msg.includes(word));
  if (matchedGeneral) {
    return res.send({
      reply: `🤖 Hello! I'm Scorpio-X, your AI assistant from the Blackbeard Empire.\n\nIf you need a bot, website, CV, StudyBuddy or automation, you’re in the right place.\n💳 To begin, pay here: ${yocoBase}mojop9\nOr describe what you need and I’ll notify the VaultKeeper.`
    });
  }

  // No match at all
  return res.send({ reply: "📬 Message logged. We’ll reply soon if urgent." });
});

module.exports = router;