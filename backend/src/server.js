const express = require("express");
const session = require("express-session");
require("./db");

const app = express();

const authRoutes = require("./routes/auth");
const scoreRoutes = require("./routes/score");
const commentRoutes = require("./routes/comments");

app.use(express.json());

app.use(
  session({
    secret: "dev-secret",
    resave: false,
    saveUninitialized:false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false
    }
  })
);

app.get("/api/health", (req, res) => {
  res.json({ status: "Backend is running" });
});

app.use("/api", authRoutes);
app.use("/api", scoreRoutes);
app.use("/api", commentRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log( `Server running on http://localhost:${PORT}`);
});
