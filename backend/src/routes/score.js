const express = require("express");
const db = require("../db");

const router = express.Router();

// Vulnerable: no auth + userId is taken from client
router.post("/score", (req, res) => {
  const { userId, score } = req.body || {};
  if (!userId || typeof score !== "number") return res.status(400).json({ error: "Bad payload" });

  db.prepare("INSERT INTO scores (userId, score, createdAt) VALUES (?, ?, ?)")
    .run(userId, score, new Date().toISOString());

  res.json({ message: "Score saved (vulnerable)", userId, score });
});

router.get("/leaderboard", (req, res) => {
  const rows = db.prepare(`
    SELECT u.username, s.score, s.createdAt
    FROM scores s
    JOIN users u ON u.id = s.userId
    ORDER BY s.score DESC
    LIMIT 10
  `).all();

  res.json({ leaderboard: rows });
});

module.exports = router;
