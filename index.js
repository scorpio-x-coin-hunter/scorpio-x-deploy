// index.js
const express = require("express");
const path = require("path");
const cors = require("cors");
const commandsRouter = require("./commands");
const vaultkeeperRouter = require("./vaultkeeper");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

app.use("/command", commandsRouter);
app.use("/vault", vaultkeeperRouter);

app.get("/", (req, res) => {
  res.send("🦂 Scorpio-X Core Server is running. Visit /chat.html to chat with Blackbeard.");
});

// Basic health check endpoint
app.get("/health", (req, res) => res.json({ status: "OK", timestamp: new Date() }));

// Catch-all 404 handler
app.use((req, res) => {
  res.status(404).send("⚠️ 404 Not Found");
});

app.listen(PORT, () => {
  console.log(`🛰️ Scorpio-X Core Server running on port ${PORT}`);
});