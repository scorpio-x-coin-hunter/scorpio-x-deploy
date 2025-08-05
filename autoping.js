// autoping.js – Keeps Scorpio-X awake by pinging itself every 5 mins
const fetch = require("node-fetch");

const URL = "https://scorpio-x-core.onrender.com"; // Live Render app link
const INTERVAL = 1000 * 60 * 5; // 5 minutes

setInterval(() => {
  fetch(URL)
    .then(() =>
      console.log(`[🛰️ Pinger] Pinged ${URL} at ${new Date().toISOString()}`)
    )
    .catch((err) =>
      console.error(`[⚠️ Pinger Error] Failed to ping:`, err.message)
    );
}, INTERVAL);

console.log("⏰ AutoPing system is live. GodBot will not fall asleep...");