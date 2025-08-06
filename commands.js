// commands.js – Blackbeard Captain Override & Command Center
const express = require("express");
const router = express.Router();

const CAPTAIN_SECRET = process.env.CAPTAIN_SECRET || "blackbeard-command";

router.post("/command", express.json(), (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ reply: "No command received." });

  const msg = message.toLowerCase().trim();

  // Secret Captain Command
  if (msg === CAPTAIN_SECRET) {
    console.log("🗝️ Captain override accessed.");
    return res.send({
      reply: "🏴‍☠️ Captain, the Blackbeard Empire reports: All bots operational. Vault secure. No threats detected."
    });
  }

  // Status report command
  if (msg.includes("status report")) {
    return res.send({ reply: "🛰️ Systems online. Coin scanning enabled. Ping frequency stable." });
  }

  // Add more commands here as needed in the future
  // e.g. "shutdown", "restart", "vault status", etc.

  res.send({ reply: "⚠️ Unknown command. Please try again or contact Vaultkeeper." });
});

module.exports = router;