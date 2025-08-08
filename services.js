const express = require("express");
const cors = require("cors");               // <-- Add this line
const path = require("path");
const commandsRouter = require("./commands");

const app = express();
const PORT = process.env.PORT || 10000;    // <-- Use environment variable or fallback

// Middleware to parse JSON request bodies
app.use(express.json());

// Enable CORS for all routes (allows cross-origin requests)
app.use(cors());                           // <-- Add this line

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Use commands router for /command endpoint
app.use("/command", commandsRouter);

// Basic root route: info message
app.get("/", (req, res) => {
  res.send(
    "🦂 Scorpio-X Core Server is running. Visit /chat.html to chat with Blackbeard."
  );
});

// Catch-all 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).send("⚠️ 404 Not Found");
});

// Start the server
app.listen(PORT, () => {
  console.log(`🛰️ Scorpio-X Core Server running on port ${PORT}`);
});