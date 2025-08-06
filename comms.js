// comms.js – Blackbeard Empire Client Message Engine v1.4 (Complete & Automated)

const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const services = require("./services");

// Helper: Generate unique payment link for each service and transaction
function generatePaymentLink(serviceName) {
  // Here we generate a unique ID and link per service dynamically
  const uniqueId = crypto.randomBytes(4).toString("hex"); // 8-char hex id
  // This link is a placeholder, replace with your real Yoco link generator if available
  return `https://pay.yoco.com/r/${serviceName.toLowerCase().replace(/\s+/g, "")}-${uniqueId}`;
}

// Endpoint: Receive client request and respond with payment link & info
router.post("/comms/request", express.json(), (req, res) => {
  const { serviceKeyword, clientName } = req.body;

  if (!serviceKeyword || !clientName) {
    return res.status(400).json({ message: "Missing serviceKeyword or clientName." });
  }

  // Find service by matching keywords
  const service = services.find((svc) =>
    svc.keywords.some((kw) => kw.toLowerCase() === serviceKeyword.toLowerCase())
  );

  if (!service) {
    return res.status(404).json({ message: "Service not found." });
  }

  // Generate unique payment link for this transaction
  const paymentLink = generatePaymentLink(service.name);

  // Respond with the service name and unique payment link
  res.json({
    message: `Hello ${clientName}, to proceed with ${service.name}, please pay via the link below.`,
    paymentLink,
  });
});

module.exports = router;