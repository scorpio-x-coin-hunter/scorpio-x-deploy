// comms.js – Scorpio-X Blackbeard Empire Client Message Engine v2.0 (Complete Upgrade)

const express = require("express");
const router = express.Router();

const vaultkeeper = require("./vaultkeeperHelper"); // Vault functions
const commands = require("./commands"); // Command handler (if needed)

// In-memory message store (replace with DB for production)
const messages = [];

// Simple bot auto-reply logic for demonstration
function generateBotReply(message) {
  const msg = message.toLowerCase();

  if (msg.includes("hello") || msg.includes("hi")) {
    return "Ahoy! Captain Nicolaas at your service. How can we assist you today?";
  }
  if (msg.includes("services")) {
    return "We offer CV writing, logo design, website dev, marketing & more. Ask for a payment link!";
  }
  if (msg.includes("payment link")) {
    return "Send 'payment <service>' to get your unique payment link.";
  }
  if (msg.includes("attract clients")) {
    return `🏴‍☠️ Captain Nicolaas here! Need top-notch help with your projects? 
Our Blackbeard bots deliver CVs, websites, apps, marketing & more! 
Pay securely with unique links. DM us to get started! ⚓️`;
  }
  // Default fallback
  return "Thanks for your message. We'll get back to you shortly.";
}

// Endpoint to receive client messages (bots or users)
router.post("/comms/message", express.json(), async (req, res) => {
  const { sender, message } = req.body;

  if (!sender || !message) {
    return res.status(400).json({ message: "Missing sender or message." });
  }

  // Save message
  messages.push({
    sender,
    message,
    timestamp: new Date().toISOString(),
  });

  console.log(`📡 Message received from ${sender}: ${message}`);

  // Generate bot reply
  const reply = generateBotReply(message);

  // For now, just respond with reply text (you could also save replies or send push notifications)
  res.json({ reply });
});

// Endpoint to get all messages (for monitoring/debugging)
router.get("/comms/messages", (req, res) => {
  res.json({ messages });
});

module.exports = router;