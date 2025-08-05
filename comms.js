// comms.js - Client message receiver + bot auto-reply
const express = require("express");
const router = express.Router();

const keywords = ["bot", "freelancer", "hire", "developer", "help"];
const yocoLink = "https://pay.yoco.com/r/mojop9";

router.post("/comms", express.json(), (req, res) => {
  const msg = req.body.message?.toLowerCase();
  console.log("📨 Incoming client message:", msg);

  if (!msg) return res.status(400).send({ reply: "Message missing!" });

  const matched = keywords.some(keyword => msg.includes(keyword));

  if (matched) {
    return res.send({
      reply: `✅ I can help! Pay to get started: ${yocoLink}`
    });
  }

  res.send({ reply: "🤖 Thanks! We'll review and reply if needed." });
});

module.exports = router;