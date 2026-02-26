require("dotenv").config();
const { Pool } = require("pg");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
require("./auth");

const app = express();
const port = 3000;

const pool = new Pool({
    database: "discogs_clone",
});

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    }),
);

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false },
    }),
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/health", async (req, res) => {
    const result = await pool.query("SELECT NOW()");
    res.json({
        time: result.rows[0],
    });
});

app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] }),
);

app.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    function (req, res) {
        res.redirect("http://localhost:5173");
    },
);

app.get("/auth/me", (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user);
    } else {
        res.status(401).json({ error: "Not logged in" });
    }
});

app.get("/artists", async (req, res) => {
    const result = await pool.query("SELECT * FROM artists");
    res.json(result.rows);
});

app.get("/artists/:id/albums", async (req, res) => {
    const result = await pool.query(
        "SELECT * FROM albums WHERE artist_id = $1",
        [req.params.id],
    );
    res.json(result.rows);
});

app.get("/auth/logout", (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ error: "Logout failed" });
        res.redirect("http://localhost:5173");
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
