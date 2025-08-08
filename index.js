const express = require("express");
const path = require("path");
const cors = require("cors");

const commandsRouter = require("./commands"); // your commands.js router

const app = express();
const PORT = 10000;

// Enable CORS for all origins (for dev & testing)
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from 'static' folder at '/static' URL path
app.use('/static', express.static(path.join(__dirname, "static")));

// Use commands router at /command
app.use("/command", commandsRouter);

// Basic root route: info message
app.get("/", (req, res) => {
  res.send(
    "🦂 Scorpio-X Core Server is running. Visit /static/chat.html to chat with Blackbeard."
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