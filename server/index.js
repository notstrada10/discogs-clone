const { Pool } = require("pg");
const express = require("express");

const app = express();
const port = 3000;

const pool = new Pool({
    database: "discogs_clone",
});

app.get("/health", async (req, res) => {
    const result = await pool.query("SELECT NOW()");
    res.json({
        time: result.rows[0],
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
