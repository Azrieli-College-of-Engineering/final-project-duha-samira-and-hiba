const requireAuth = require("../middleware/requireAuth");
const express = require("express");
const db = require("../db");

const router = express.Router();

router.post("/score", requireAuth, (req, res) => {
  const { score } = req.body || {};
  if (typeof score !== "number" || score < 0 ) return res.status(400).json({ error: "Invalid score" });

  const userId = req.session.user.id;

  db.prepare("INSERT INTO scores (userId, score, createdAt) VALUES (?, ?, ?)")
    .run(userId, score, new Date().toISOString());

  res.json({ message: "Score saved (secure)", userId, score });
});

module.exports = router;
