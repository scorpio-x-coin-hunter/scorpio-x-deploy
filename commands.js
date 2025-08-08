const fs = require("fs");
const path = require("path");
const express = require("express");
const router = express.Router();
const services = require("./services"); // your services list
const vaultkeeperHelper = require("./vaultkeeperHelper"); // helper functions

const {
  logCoinEntry,
  calculateVaultBalance,
  readVaultLog,
} = vaultkeeperHelper;

// Helper to find a service by keyword (case insensitive)
function findServiceByKeyword(keyword) {
  return services.find((svc) =>
    svc.keywords.some((kw) => kw.toLowerCase() === keyword.toLowerCase())
  );
}

// Generate payment instructions for a service request
function generatePaymentInstructions(serviceName, payer, amount) {
  // Create unique payment reference code (format: BBYYYYMMDD+random+payer initials)
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(10000 + Math.random() * 90000);
  const payerInitials = payer
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();

  const paymentReference = `BB${datePart}${randomPart}${payerInitials}`;

  // Standard Bank payment details
  const BANK_NAME = "Standard Bank";
  const ACCOUNT_NAME = "Nicolaas Johannes Els";
  const ACCOUNT_NUMBER = "10135452331";
  const ACCOUNT_TYPE = "Mymo Account";
  const BANK_CODE = "051001";

  const paymentInfo = `
Please pay R${amount.toFixed(2)} to:
Bank: ${BANK_NAME}
Account Name: ${ACCOUNT_NAME}
Account Number: ${ACCOUNT_NUMBER}
Account Type: ${ACCOUNT_TYPE}
Branch Code: ${BANK_CODE}
Payment Reference: ${paymentReference}

Use the Payment Reference exactly as it appears to ensure your payment is correctly recorded.
`;

  // Log this payment request in vault
  logCoinEntry({