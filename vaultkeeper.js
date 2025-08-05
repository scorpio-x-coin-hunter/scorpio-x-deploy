// vaultkeeper.js – Blackbeard Empire Vault Command System
const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const vaultLogFile = path.join(__dirname, "vault_log.json");

// Helper to log coin events
function logCoinEntry(entry) {
  const log = fs.existsSync(vaultLogFile)
    ? JSON.parse(fs.readFileSync(vaultLogFile))
    : [];

  log.push({ ...entry, timestamp: new Date().toISOString() });
  fs.writeFileSync(vaultLogFile, JSON.stringify(log, null, 2));
  console.log("💰 Coin logged to Vault:", entry);
}

router.post("/vault/deposit", express.json(), (req, res) => {
  const { service, payer } = req.body;

  if (!service || !payer) {
    return res.status(400).json({ message: "Missing data." });
  }

  logCoinEntry({ service, payer });
  res.json({ message: "Coin securely deposited. Vault updated." });
});

router.get("/vault/report", (req, res) => {
  if (!fs.existsSync(vaultLogFile)) {
    return res.json({ log: [] });
  }

  const log = JSON.parse(fs.readFileSync(vaultLogFile));
  res.json({ log });
});

module.exports = router;