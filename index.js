const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("🦂 Scorpio-X Engine Online. Awaiting coin hunt orders.");
});

app.listen(PORT, () => {
  console.log(`Scorpio-X Bot Server running on port ${PORT}`);
});