// autoping.js – Keeps Render app awake by pinging itself every 5 mins
const fetch = require("node-fetch");

const URL = "https://scorpio-x-core.onrender.com"; // Your live Render URL
const INTERVAL = 1000 * 60 * 5; // 5 minutes

setInterval(() => {
  fetch(URL)
    .then(() => console.log(`[Pinger] Pinged ${URL} at ${new Date().toISOString()}`))
    .catch((err) => console.error(`[Pinger] Error pinging ${URL}:`, err));
}, INTERVAL);

console.log("⏰ AutoPing module running. Your GodBot will not fall asleep...");