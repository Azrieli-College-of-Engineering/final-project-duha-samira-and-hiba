const express = require("express");
const db = require("../db");

const router = express.Router();

// Vulnerable: no auth + userId from client
router.post("/comment", (req, res) => {
  const { userId, content } = req.body || {};
  if (!userId || !content) return res.status(400).json({ error: "Bad payload" });

  db.prepare("INSERT INTO comments (userId, content, createdAt) VALUES (?, ?, ?)")
    .run(userId, content, new Date().toISOString());

  res.json({ message: "Comment saved (vulnerable)" });
});

router.get("/comments", (req, res) => {
  const rows = db.prepare(`
    SELECT u.username, c.content, c.createdAt
    FROM comments c
    JOIN users u ON u.id = c.userId
    ORDER BY c.id DESC
    LIMIT 20
  `).all();

  res.json({ comments: rows });
});

module.exports = router;
