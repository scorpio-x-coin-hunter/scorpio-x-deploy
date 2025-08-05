// autoping.js – Full Render Wake-up Engine v1.2 const fetch = require("node-fetch");

const URL = "https://scorpio-x-core.onrender.com"; // Your live site URL const INTERVAL = 1000 * 60 * 5; // Every 5 minutes

setInterval(() => { fetch(URL) .then(() => console.log([AutoPing] ✅ Pinged ${URL} at ${new Date().toISOString()})) .catch((err) => console.error([AutoPing] ⚠️ Error pinging ${URL}:, err)); }, INTERVAL);

console.log("⏰ AutoPing engine engaged. The GodBot stays awake, Captain.");

