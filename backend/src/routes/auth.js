const express = require("express");
const db = require("../db");

const router = express.Router();

// Register
router.post("/register", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "Missing fields" });

  try {
    const stmt = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    const info = stmt.run(username, password);
    return res.json({ id: info.lastInsertRowid, username });
  } catch (e) {
    return res.status(400).json({ error: "Username already exists" });
  }
});

router.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "Missing fields" });

  
const user = db
  .prepare("SELECT * FROM users WHERE username = ? AND password = ?")
  .get(username, password);

  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  req.session.user = { id: user.id, username: user.username };
  return res.json({ message: "Logged in", user: req.session.user });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => res.json({ message: "Logged out" }));
});

router.get("/me", (req, res) => {
  res.json({ user: req.session.user || null });
});

module.exports = router;
