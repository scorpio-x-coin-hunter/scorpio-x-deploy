// vaultkeeperHelper.js — Helper module for VaultKeeper logging and file management

const fs = require("fs");
const path = require("path");

const vaultLogFile = path.join(__dirname, "vault_log.json");

// ===== SAFE FILE READ =====
function readVaultLog() {
  try {
    if (!fs.existsSync(vaultLogFile)) {
      // Create empty vault log if it doesn't exist
      fs.writeFileSync(vaultLogFile, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(vaultLogFile, "utf8");
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("⚠️ Error reading vault log, resetting file:", err);
    fs.writeFileSync(vaultLogFile, JSON.stringify([], null, 2));
    return [];
  }
}

// ===== SAFE FILE WRITE =====
function writeVaultLog(log) {
  try {
    if (!Array.isArray(log)) {
      throw new Error("Vault log must be an array");
    }
    fs.writeFileSync(vaultLogFile, JSON.stringify(log, null, 2));
  } catch (err) {
    console.error("⚠️ Error writing vault log:", err);
  }
}

// ===== ADD TRANSACTION ENTRY =====
function logCoinEntry(entry) {
  if (!entry || typeof entry !== "object") {
    console.error("⚠️ Invalid vault entry:", entry);
    return;
  }
  const log = readVaultLog();
  log.push({
    service: entry.service || "Unknown Service",
    payer: entry.payer || "Unknown",
    amount: Number(entry.amount) || 0,
    paymentLink: entry.paymentLink || null,
    confirmed: entry.confirmed || false,
    timestamp: new Date().toISOString(),
  });
  writeVaultLog(log);
  console.log("💰 VaultKeeper logged entry:", entry);
}

module.exports = {
  readVaultLog,
  writeVaultLog,
  logCoinEntry,
};