const fs = require("fs");
const path = require("path");

const vaultLogFile = path.join(__dirname, "vault_log.json");

// ===== SAFE FILE READ =====
function readVaultLog() {
  try {
    if (!fs.existsSync(vaultLogFile)) {
      fs.writeFileSync(vaultLogFile, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(vaultLogFile, "utf8");
    return Array.isArray(JSON.parse(data)) ? JSON.parse(data) : [];
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
    timestamp: new Date().toISOString()
  });
  writeVaultLog(log);
  console.log("💰 VaultKeeper logged entry:", entry);
}

// ===== CALCULATE BALANCE =====
function calculateVaultBalance() {
  const log = readVaultLog();
  return log.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
}

// ===== SELF-PINGER DEVICE =====
// Keeps the server alive by periodically calling its own health endpoint

let selfPingInterval = null;
function startSelfPinger(appUrl, intervalMs = 5 * 60 * 1000) { // default 5 mins
  if (selfPingInterval) return; // already running

  const fetch = require("node-fetch");

  selfPingInterval = setInterval(async () => {
    try {
      const res = await fetch(appUrl);
      if (res.ok) {
        console.log("🛰️ Self-ping successful");
      } else {
        console.warn("⚠️ Self-ping responded with status:", res.status);
      }
    } catch (err) {
      console.error("⚠️ Self-ping failed:", err);
    }
  }, intervalMs);

  console.log("🛰️ Self-pinger started, pinging every", intervalMs / 1000, "seconds");
}

function stopSelfPinger() {
  if (selfPingInterval) {
    clearInterval(selfPingInterval);
    selfPingInterval = null;
    console.log("🛰️ Self-pinger stopped");
  }
}

// ===== SATELLITE DEVICE (HEARTBEAT) =====
// Simple heartbeat checker for system monitoring

let lastHeartbeat = null;
function recordHeartbeat() {
  lastHeartbeat = new Date();
  console.log("🚀 Heartbeat recorded at", lastHeartbeat.toISOString());
}

function getLastHeartbeat() {
  return lastHeartbeat ? lastHeartbeat.toISOString() : "No heartbeat recorded yet";
}

module.exports = {
  readVaultLog,
  writeVaultLog,
  logCoinEntry,
  calculateVaultBalance,
  startSelfPinger,
  stopSelfPinger,
  recordHeartbeat,
  getLastHeartbeat
};