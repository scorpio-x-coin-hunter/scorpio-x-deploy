const fs = require("fs");
const path = require("path");

const vaultLogFile = path.join(__dirname, "vault_log.json");

// Read vault log safely
function readVaultLog() {
  if (!fs.existsSync(vaultLogFile)) return [];
  try {
    const data = fs.readFileSync(vaultLogFile);
    return JSON.parse(data);
  } catch (err) {
    console.error("⚠️ Error reading vault log:", err);
    return [];
  }
}

// Write vault log safely
function writeVaultLog(log) {
  try {
    fs.writeFileSync(vaultLogFile, JSON.stringify(log, null, 2));
  } catch (err) {
    console.error("⚠️ Error writing vault log:", err);
  }
}

// Log a coin transaction (deposit or withdrawal)
function logCoinEntry(entry) {
  const log = readVaultLog();
  log.push({ ...entry, timestamp: new Date().toISOString() });
  writeVaultLog(log);
  console.log("💰 VaultKeeper logged entry:", entry);
}

// Calculate current vault balance
function calculateVaultBalance() {
  const log = readVaultLog();
  return log.reduce((sum, entry) => sum + (entry.amount || 0), 0);
}

module.exports = {
  readVaultLog,
  writeVaultLog,
  logCoinEntry,
  calculateVaultBalance,
};