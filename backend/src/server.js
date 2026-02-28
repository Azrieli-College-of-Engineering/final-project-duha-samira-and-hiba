const path = require("path");
const express = require("express");
const session = require("express-session");
const path = require("path");

require("./db");

const authRoutes = require("./routes/auth");
const scoreRoutes = require("./routes/score");
const commentRoutes = require("./routes/comments");

const app = express();
app.disable("x-powered-by");

app.use(express.json());
app.use(express.static(path.join(__dirname, "../../frontend")));

app.use(express.static(path.join(__dirname, "..", "..", "..", "frontend")));

app.use(
  session({
    secret: "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    },
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
  console.log(`Server running on http://localhost:${PORT}`);
});
