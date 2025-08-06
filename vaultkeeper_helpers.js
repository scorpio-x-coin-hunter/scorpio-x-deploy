// vaultkeeper_helpers.js – Blackbeard VaultKeeper payment link generator helper

/**
 * Generates a unique payment link for a given service and amount.
 * This link should be used by bots to send to clients for payment.
 * You can customize the base URL to your payment processing platform.
 */

const crypto = require("crypto");

const BASE_PAYMENT_URL = "https://your-custom-payments.com/pay"; // CHANGE to your actual payment processor base URL

/**
 * Generates a unique hash string to append to payment link
 * @param {string} service 
 * @param {number} amount 
 * @returns {string} unique token
 */
function generateUniqueToken(service, amount) {
  const raw = `${service}-${amount}-${Date.now()}-${Math.random()}`;
  return crypto.createHash("sha256").update(raw).digest("hex").slice(0, 10);
}

/**
 * Generate a full payment link for the service and amount
 * @param {string} service 
 * @param {number} amount 
 * @returns {string} URL
 */
function generatePaymentLink(service, amount) {
  const token = generateUniqueToken(service, amount);
  // You can add more query params as needed (like service name, amount, token, etc)
  return `${BASE_PAYMENT_URL}?service=${encodeURIComponent(service)}&amount=${amount}&token=${token}`;
}

module.exports = {
  generatePaymentLink
};