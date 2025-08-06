// vaultkeeper_helpers.js – Helper functions for Blackbeard VaultKeeper

const crypto = require("crypto");

// Generate a unique payment link for each service deposit
function generatePaymentLink(serviceName, amount) {
  // Create a unique token with service + amount + timestamp + random bytes
  const token = crypto
    .createHash("sha256")
    .update(serviceName + amount + Date.now() + crypto.randomBytes(16).toString("hex"))
    .digest("hex")
    .slice(0, 16); // short token for ease

  // Construct a mock Yoco payment link with the unique token
  // (Replace with real API integration later)
  return `https://pay.yoco.com/r/${token}`;
}

module.exports = {
  generatePaymentLink,
};