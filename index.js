// index.js
const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 10000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from 'public' folder (like chat.html, css, js)
app.use(express.static(path.join(__dirname, "public")));

// Mount command router
const commandRouter = require("./commands");
app.use("/", commandRouter);

app.listen(port, () => {
  console.log(`🛰️ Scorpio-X Core Server running on port ${port}`);
});