const express = require("express");
const db = require("../db");

const router = express.Router();

const requireAuth = require("../middleware/requireAuth");

router.post("/comment", requireAuth, (req, res) => {
  const { content } = req.body || {};
  if (!content || typeof content !== "string") {
    return res.status(400).json({ error: "Bad payload" });
  }

  const userId = req.session.user.id;

  db.prepare("INSERT INTO comments (userId, content, createdAt) VALUES (?, ?, ?)")
    .run(userId, content, new Date().toISOString());

  res.json({ message: "Comment saved (secure)" });
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
