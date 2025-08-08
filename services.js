/**
 * server.js
 * 
 * Main Scorpio-X Core Server entry point.
 * Runs Express server, links commands API, serves static UI,
 * and ensures everything is ready for production.
 */

const express = require("express");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan"); // Logging middleware for debugging/monitoring
const helmet = require("helmet"); // Security middleware

const commandsRouter = require("./commands");

const app = express();
const PORT = process.env.PORT || 10000;

// ===== MIDDLEWARE =====

// Security headers
app.use(helmet());

// Request logging (dev-friendly format)
app.use(morgan("dev"));

// Parse incoming JSON
app.use(express.json({ limit: "1mb" }));

// Enable CORS for all requests
app.use(cors());

// ===== STATIC FILES =====
app.use(express.static(path.join(__dirname, "public")));

// ===== API ROUTES =====
app.use("/command", commandsRouter);

// ===== BASIC ROOT ROUTE =====
app.get("/", (req, res) => {
  res.send(
    "🦂 Scorpio-X Core Server is running.<br>Visit <a href='/chat.html'>/chat.html</a> to chat with Blackbeard."
  );
});

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).send("⚠️ 404 Not Found");
});

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`🛰️ Scorpio-X Core Server running on port ${PORT}`);
});