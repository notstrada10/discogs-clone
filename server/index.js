require("dotenv").config();
const { Pool } = require("pg");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
require("./auth");

const app = express();
const port = 3000;

const pool = new Pool({
    database: "discogs_clone",
});

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
        res.redirect("/");
    },
);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
