// commands.js – Blackbeard Captain Override & Command Center v2.0
const express = require("express");
const router = express.Router();

const CAPTAIN_SECRET = process.env.CAPTAIN_SECRET || "blackbeard-command";

router.post("/command", express.json(), (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ reply: "⚠️ No command received." });

  const msg = message.toLowerCase().trim();

  // Secret Captain Command
  if (msg === CAPTAIN_SECRET) {
    console.log("🗝️ Captain override activated.");
    return res.send({
      reply: "🏴‍☠️ Captain Nicolaas, all bots are operational. Vault secured. No threats detected."
    });
  }

  // Built-in Status Report
  if (msg.includes("status report")) {
    return res.send({
      reply: "🛰️ Systems online. Coin radar active. Ping stable. Awaiting treasure..."
    });
  }

  // Incomplete or Unrecognized Commands
  return res.send({ reply: "🤖 Unknown command. Please refer to Vaultkeeper or Empire HQ." });
});

module.exports = router;