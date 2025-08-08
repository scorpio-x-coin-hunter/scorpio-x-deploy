const express = require("express");
const router = express.Router();

const vaultkeeper = require("./vaultkeeperHelper"); // Vault functions (if needed)
const commands = require("./commands"); // Your commands router (optional)

// In-memory message store (use DB for production)
const messages = [];

// Simple bot auto-reply logic for demo
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

// Endpoint to receive client messages
router.post("/comms/message", express.json(), (req, res) => {
  const { sender, message } = req.body;

  if (!sender || !message) {
    return res.status(400).json({ message: "Missing sender or message." });
  }

  messages.push({
    sender,
    message,
    timestamp: new Date().toISOString(),
  });

  console.log(`📡 Message received from ${sender}: ${message}`);

  const reply = generateBotReply(message);

  res.json({ reply });
});

// Endpoint to get all messages (for debugging)
router.get("/comms/messages", (req, res) => {
  res.json({ messages });
});

module.exports = router;