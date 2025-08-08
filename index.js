const express = require("express");
const path = require("path");
const cors = require("cors");
const commandsRouter = require("./commands");
const vaultkeeperRouter = require("./vaultkeeper");

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Enable CORS for all routes
app.use(cors());

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/command", commandsRouter);
app.use("/", vaultkeeperRouter);

// Basic root route: info message
app.get("/", (req, res) => {
  res.send(
    "🦂 Scorpio-X Core Server is running. Visit /chat.html to chat with Blackbeard."
  );
});

// === CHATBOT API & WEB CHAT ===

// In-memory message store (demo; replace with DB for production)
const messages = [];

// Simple bot auto-reply logic with smarter preset commands
function generateBotReply(message) {
  const msg = message.toLowerCase();

  if (msg.includes("hello") || msg.includes("hi")) {
    return "Ahoy! Captain Nicolaas at your service. How can we assist you today?";
  }
  if (msg.includes("services")) {
    return "We offer CV writing, logo design, website dev, marketing & more. Ask for a payment link!";
  }
  if (msg.includes("payment link")) {
    return "Send 'payment [service keyword] [your full name] [amount]' to get your unique payment instructions.";
  }
  if (msg.includes("attract clients")) {
    return `🏴‍☠️ Captain Nicolaas here! Need top-notch help with your projects? 
Our Blackbeard bots deliver CVs, websites, apps, marketing & more! 
Pay securely with unique links. DM us to get started! ⚓️`;
  }
  // Default fallback
  return "Thanks for your message. We'll get back to you shortly.";
}

// Endpoint to receive client messages (users or bots)
app.post("/comms/message", (req, res) => {
  const { sender, message } = req.body;

  if (!sender || !message) {
    return res.status(400).json({ message: "Missing sender or message." });
  }

  // Save message
  messages.push({
    sender,
    message,
    timestamp: new Date().toISOString(),
  });

  console.log(`📡 Message received from ${sender}: ${message}`);

  // Generate bot reply
  const reply = generateBotReply(message);

  res.json({ reply });
});

// Endpoint to get all messages (for monitoring/debugging)
app.get("/comms/messages", (req, res) => {
  res.json({ messages });
});

// Catch-all 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).send("⚠️ 404 Not Found");
});

// Start the server
app.listen(PORT, () => {
  console.log(`🛰️ Scorpio-X Core Server running on port ${PORT}`);
});