const fs = require("fs");
const path = require("path");
const express = require("express");
const router = express.Router();

const services = require("./services"); // your services list
const vaultkeeperHelper = require("./vaultkeeperHelper");

const {
  logCoinEntry,
  calculateVaultBalance,
  readVaultLog,
} = vaultkeeperHelper;

// Helper: find service by keyword (case-insensitive)
function findServiceByKeyword(keyword) {
  return services.find((svc) =>
    svc.keywords.some((kw) => kw.toLowerCase() === keyword.toLowerCase())
  );
}

// Generate payment instructions and log payment
function generatePaymentInstructions(serviceName, payer, amount) {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(10000 + Math.random() * 90000);
  const payerInitials = payer
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpper