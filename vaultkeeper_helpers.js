// vaultkeeper_helpers.js – Helper utilities for Blackbeard Empire VaultKeeper

const crypto = require("crypto");

// Base Yoco link prefix for generating new payment links dynamically
// (This should be your official Yoco API endpoint or link generator)
const BASE_YOCO_LINK = "https://pay.yoco.com/r/";

// Example list of service codes or tokens (could be expanded or integrated with DB)
const serviceCodes = {
  "CV Creation": "7v8zDd",
  "Study Buddy": "mOzlDp",
  "Proofreading": "2Bo0Dn",
  // Add all your services here, or dynamically generate later
};

// Generate a unique payment link string for a given service and amount
function generatePaymentLink(serviceName, amount) {
  // If you want to use service-specific codes, find it here:
  const serviceCode = serviceCodes[serviceName] || "default";

  // Create a unique token based on serviceName, amount, and current timestamp
  const uniqueString = `${serviceName}-${amount}-${Date.now()}`;

  const hash = crypto.createHash("sha256").update(uniqueString).digest("hex").slice(0, 8);

  // Construct the final payment link with unique token appended (customize as per Yoco API)
  // For now, simulate a unique payment link by appending token after base link + service code
  const paymentLink = `${BASE_YOCO_LINK}${serviceCode}-${hash}`;

  return paymentLink;
}

module.exports = { generatePaymentLink };