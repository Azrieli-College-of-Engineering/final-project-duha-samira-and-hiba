const express = require("express");
const session = require("express-session");
require("./db");

const app = express();

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

const PORT = 3000;

app.listen(PORT, () => {
  console.log( `Server running on http://localhost:${PORT}`);
});
