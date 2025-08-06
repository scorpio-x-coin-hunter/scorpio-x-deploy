// comms.js – Scorpio-X Blackbeard Empire Client Message Engine v1.0 (Complete)

const express = require("express");
const router = express.Router();

// In-memory message store for demo (replace with DB for production)
const messages = [];

// Endpoint to receive client messages (bots or users)
router.post("/comms/message", express.json(), (req, res) => {
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

  // For now, echo back confirmation (can add bot reply logic later)
  res.json({ message: "Message received and logged." });
});

// Endpoint to get all messages (for monitoring/debugging)
router.get("/comms/messages", (req, res) => {
  res.json({ messages });
});

module.exports = router;