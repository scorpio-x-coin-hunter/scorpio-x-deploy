const express = require("express");
const path = require("path");
const cors = require("cors");
const commandsRouter = require("./commands");
const vaultkeeperRouter = require("./vaultkeeper");
const {
  startSelfPinger,
  recordHeartbeat,
  getLastHeartbeat
} = require("./vaultkeeperHelper");

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.json());
app.use(cors());

// Static files (for chat UI, etc.)
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/command", commandsRouter);
app.use("/vaultkeeper", vaultkeeperRouter);

// Root route - info message
app.get("/", (req, res) => {
  res.send(
    "🦂 Scorpio-X Core Server is running. Visit /chat.html to chat with Blackbeard."
  );
});

// Heartbeat API (satellite device)
app.get("/heartbeat", (req, res) => {
  const lastBeat = getLastHeartbeat();
  res.json({ lastHeartbeat: lastBeat });
});

// Endpoint to manually record heartbeat (for internal or external ping)
app.post("/heartbeat", (req, res) => {
  recordHeartbeat();
  res.json({ status: "Heartbeat recorded." });
});

// Start server
app.listen(PORT, () => {
  console.log(`🛰️ Scorpio-X Core Server running on port ${PORT}`);

  // Start the self-pinger to keep server alive
  // Make sure you set your Render app URL in environment variable or replace below
  const appUrl = process.env.APP_URL || `http://localhost:${PORT}/`;
  startSelfPinger(appUrl);
});