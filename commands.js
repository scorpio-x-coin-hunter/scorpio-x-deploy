// commands.js – Blackbeard Captain Override & Command Center v2.0
const express = require("express");
const router = express.Router();

const CAPTAIN_SECRET = process.env.CAPTAIN_SECRET || "blackbeard-command"; // You can change this in environment

router.post("/command", express.json(), (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "⚠️ No command received." });
  }

  const msg = message.toLowerCase().trim();

  // 🗝️ Captain Override
  if (msg === CAPTAIN_SECRET) {
    console.log("🗝️ Captain override accessed.");
    return res.send({
      reply: `🏴‍☠️ Captain Nicolaas, all bots are operational.
Vaultkeeper is active.
Empire logs are stable.
No current intrusions.`
    });
  }

  // 📡 System Status
  if (msg.includes("status report")) {
    return res.send({
      reply: "🛰️ System Status: Online\nPing: Stable\nBots: Listening for orders.\nVault: Accepting coins."
    });
  }

  // 🧪 Add future commands here...

  return res.send({ reply: "❌ Unknown command. Use your override key or ask for status report." });
});

module.exports = router;