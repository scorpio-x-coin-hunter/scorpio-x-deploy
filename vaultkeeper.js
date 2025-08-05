// vaultkeeper.js – Full Blackbeard Empire VaultKeeper System v1.5
const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const vaultLogFile = path.join(__dirname, "vault_log.json");

// Helper to log every coin drop into the Vault
function logCoinEntry(entry) {
  const log = fs.existsSync(vaultLogFile)
    ? JSON.parse(fs.readFileSync(vaultLogFile))
    : [];

  log.push({ ...entry, timestamp: new Date().toISOString() });
  fs.writeFileSync(vaultLogFile, JSON.stringify(log, null, 2));
  console.log("💰 Coin logged to Vault:", entry);
}

// 🔐 Vault Deposit Endpoint (used by Bots)
router.post("/vault/deposit", express.json(), (req, res) => {
  const { service, payer, amount, paymentLink } = req.body;

  if (!service || !payer) {
    return res.status(400).json({ message: "Missing data." });
  }

  logCoinEntry({ service, payer, amount, paymentLink });
  res.json({ message: "✅ Coin securely deposited. Vault updated." });
});

// 📜 Vault Report Endpoint (view all coins in log)
router.get("/vault/report", (req, res) => {
  if (!fs.existsSync(vaultLogFile)) {
    return res.json({ log: [] });
  }

  const log = JSON.parse(fs.readFileSync(vaultLogFile));
  res.json({ log });
});

// 🔐 Admin Purge Endpoint (clear vault - future use, disabled now)
router.delete("/vault/reset", (req, res) => {
  // Uncomment the lines below ONLY if you want reset enabled
  /*
  if (fs.existsSync(vaultLogFile)) {
    fs.unlinkSync(vaultLogFile);
    return res.json({ message: