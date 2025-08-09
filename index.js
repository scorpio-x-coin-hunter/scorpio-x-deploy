const express = require("express");
const path = require("path");
const cors = require("cors");

// Import routers
const commandsRouter = require("./commands");
const vaultkeeperRouter = require("./vaultkeeper"); // Make sure this exports a router named 'router' or default export

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/command", commandsRouter);
app.use("/vault", vaultkeeperRouter); // Use the imported vaultkeeper router directly

// Root route
app.get("/", (req, res) => {
  res.send(
    "🦂 Scorpio-X Core Server is running. Visit /chat.html to chat with Blackbeard."
  );
});

// === CHATBOT API & WEB CHAT ===
const messages = [];

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

// Receive messages API
app.post("/comms/message", (req, res) => {
  const { sender, message } = req.body;

  if (!sender || !message) {
    return res.status(400).json({ message: "Missing sender or message." });
  }

  messages.push({
    sender,
    message,
    timestamp: new Date().toISOString(),
  });

  console.log(`📡 Message received from ${sender}: ${message}`);

  const reply = generateBotReply(message);
  res.json({ reply });
});

// Get all messages API
app.get("/comms/messages", (req, res) => {
  res.json({ messages });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).send("⚠️ 404 Not Found");
});

// Start server
app.listen(PORT, () => {
  console.log(`🛰️ Scorpio-X Core Server running on port ${PORT}`);
});