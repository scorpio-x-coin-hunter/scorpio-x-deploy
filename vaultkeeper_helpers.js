const crypto = require("crypto");

const basePaymentURL = "https://pay.yoco.com/r/"; // Base URL for payments (customize as needed)

// Mock function to generate a unique payment code for each service/order
function generateUniqueCode(serviceName) {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(3).toString("hex");
  const cleanName = serviceName.toLowerCase().replace(/\s+/g, "-");
  return `${cleanName}-${timestamp}-${random}`;
}

// Main function to create a unique payment link for a service or custom order
async function generatePaymentLink(service) {
  // service can have { name, amount, keywords } etc.

  // Create a unique payment code
  const paymentCode = generateUniqueCode(service.name || "order");

  // Store or register this code with your vault/payment system here
  // For now, we'll just return a full payment URL
  // In production, you'd link this code with order tracking in a database or file

  return basePaymentURL + paymentCode;
}

module.exports = {
  generatePaymentLink,
};