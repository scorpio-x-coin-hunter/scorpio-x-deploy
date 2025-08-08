// index.js
const express = require("express");
const path = require("path");
const cors = require("cors");
require('dotenv').config();

const commandsRouter = require("./commands");
const vaultkeeperRouter = require("./vaultkeeper");

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.json());
app.use(cors());

// Static files - frontend served from public folder
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use("/command", commandsRouter);
app.use("/", vaultkeeperRouter);

// Root info route
app.get("/", (req, res) => {
  res.send(
    "🦂 Scorpio-X Core Server is running. Visit /chat.html to chat with Blackbeard."
  );
});

// Catch-all 404 handler
app.use((req, res) => {
  res.status(404).send("⚠️ 404 Not Found");
});

// Start server
app.listen(PORT, () => {
  console.log(`🛰️ Scorpio-X Core Server running on port ${PORT}`);
});