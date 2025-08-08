const express = require("express");
const path = require("path");
const cors = require("cors");

// Import all routers
const commandsRouter = require("./commands");
const vaultKeeperRouter = require("./vaultkeeper");  // added vaultkeeper routes

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS for all routes (cross-origin requests)
app.use(cors());

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Mount routers
app.use("/command", commandsRouter);
app.use("/", vaultKeeperRouter);  // Vault keeper endpoints under root or specific paths

// Root info route
app.get("/", (req, res) => {
  res.send(
    "🦂 Scorpio-X Core Server is running. Visit /chat.html to chat with Blackbeard."
  );
});

// 404 catch-all handler
app.use((req, res) => {
  res.status(404).send("⚠️ 404 Not Found");
});

// Start server listener
app.listen(PORT, () => {
  console.log(`🛰️ Scorpio-X Core Server running on port ${PORT}`);
});