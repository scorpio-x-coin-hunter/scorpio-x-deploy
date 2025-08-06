// commands.js – Blackbeard Captain Override & Command Center v2.5 const express = require("express"); const router = express.Router();

const CAPTAIN_SECRET = process.env.CAPTAIN_SECRET || "blackbeard-command";

// 🧠 Available Commands: // "blackbeard-command" (or your secret password) // "status report" => current system status // "show vault" => redirect to vault report log // Add more as needed

router.post("/command", express.json(), (req, res) => { const { message } = req.body; if (!message) return res.status(400).json({ reply: "No command received." });

const msg = message.toLowerCase().trim();

// 🗝️ Secret Captain Command if (msg === CAPTAIN_SECRET) { console.log("🗝️ Captain override accessed."); return res.send({ reply: "🏴‍☠️ Captain, the Blackbeard Empire reports: All bots operational. Vault secure. No threats detected." }); }

// 🚀 Status Report if (msg.includes("status report")) { return res.send({ reply: "🚐 Systems online. Coin radar active. Uptime stable. Bots sweeping sea lanes." }); }

// 📆 Vault Report if (msg.includes("show vault")) { return res.redirect("/vault/report"); }

// ❌ Fallback res.send({ reply: "⚠️ Unknown command. Please try again or contact Vaultkeeper." }); });

module.exports = router;

