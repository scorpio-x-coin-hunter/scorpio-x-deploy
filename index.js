const express = require("express");
const path = require("path");
const commandsRouter = require("./commands"); // Your commands.js router

const app = express();
const PORT = 10000;

// Middleware to parse JSON body
app.use(express.json());

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Use commands router for /command API endpoint
app.use("/command", commandsRouter);

// Basic root route (optional)
app.get("/", (req, res) => {
  res.send(
    "🦂 Scorpio-X Core Server is running. Visit /chat.html to chat with Blackbeard."
  );
});

// Catch-all for unknown routes
app.use((req, res) => {
  res.status(404).send("⚠️ 404 Not Found");
});

// Start server
app.listen(PORT, () => {
  console.log(`🛰️ Scorpio-X Core Server running on port ${PORT}`);
});