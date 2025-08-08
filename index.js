const express = require("express");
const path = require("path");
const cors = require("cors"); // Added cors

const commandsRouter = require("./commands"); // your commands.js router

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Enable CORS for all routes
app.use(cors());

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