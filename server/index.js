require("dotenv").config();
const { Pool } = require("pg");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
require("./auth");

const app = express();
app.set("trust proxy", 1);
const port = process.env.PORT || 3000;

const pool = process.env.DATABASE_URL
    ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
    : new Pool({ database: "discogs_clone" });

app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    }),
);

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        },
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
        res.redirect(process.env.CLIENT_URL || "http://localhost:5173");
    },
);

app.get("/auth/me", (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user);
    } else {
        res.status(401).json({ error: "Not logged in" });
    }
});

app.get("/discogs/releases", async (req, res) => {
    const { q } = req.query;
    const response = await fetch(
        `https://api.discogs.com/database/search?q=${encodeURIComponent(q)}&type=release&per_page=20`,
        {
            headers: {
                Authorization: `Discogs token=${process.env.DISCOGS_TOKEN}`,
                "User-Agent": "DiscogsClone/1.0",
            },
        },
    );
    const data = await response.json();
    const results = (data.results ?? []).map((r) => ({
        discogs_id: r.id,
        title: r.title,
        year: r.year,
        genre: r.genre?.[0] ?? null,
        cover_image: r.cover_image ?? null,
        artist: r.title.split(" - ")[0] ?? null,
    }));
    res.json(results);
});

app.get("/discogs/artist", async (req, res) => {
    const { q } = req.query;
    const response = await fetch(
        `https://api.discogs.com/database/search?q=${encodeURIComponent(q)}&type=artist`,
        {
            headers: {
                Authorization: `Discogs token=${process.env.DISCOGS_TOKEN}`,
                "User-Agent": "DiscogsClone/1.0",
            },
        },
    );
    const data = await response.json();
    const result = data.results?.[0];
    res.json({ cover_image: result?.cover_image ?? null });
});

app.get("/discogs/masters/:id", async (req, res) => {
    const { id } = req.params;

    const response = await fetch(`https://api.discogs.com/masters/${id}`, {
        headers: {
            Authorization: `Discogs token=${process.env.DISCOGS_TOKEN}`,
            "User-Agent": "DiscogsClone/1.0",
        },
    });

    const data = await response.json();
    res.json(data);
});

app.get("/discogs/masters/:id/versions", async (req, res) => {
    const { id } = req.params;
    const page = req.query.page ?? 1;

    const response = await fetch(
        `https://api.discogs.com/masters/${id}/versions?per_page=50&page=${page}`,
        {
            headers: {
                Authorization: `Discogs token=${process.env.DISCOGS_TOKEN}`,
                "User-Agent": "DiscogsClone/1.0",
            },
        },
    );

    const data = await response.json();
    res.json(data);
});

const versionsCache = {};

app.get("/discogs/masters/:id/versions/all", async (req, res) => {
    const { id } = req.params;

    if (versionsCache[id]) {
        return res.json({ versions: versionsCache[id] });
    }

    const headers = {
        Authorization: `Discogs token=${process.env.DISCOGS_TOKEN}`,
        "User-Agent": "DiscogsClone/1.0",
    };

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    async function fetchPage(p) {
        for (let attempt = 0; attempt < 3; attempt++) {
            const r = await fetch(
                `https://api.discogs.com/masters/${id}/versions?per_page=100&page=${p}`,
                { headers },
            );
            if (r.status === 429) {
                console.error(`Rate limited on page ${p}, waiting 10s...`);
                await sleep(10000);
                continue;
            }
            const text = await r.text();
            try {
                return JSON.parse(text);
            } catch {
                console.error(`Page ${p} attempt ${attempt + 1} bad JSON, retrying...`);
                await sleep(2000);
            }
        }
        return { versions: [] };
    }

    const firstData = await fetchPage(1);
    const totalPages = firstData.pagination?.pages ?? 1;
    const all = [...(firstData.versions ?? [])];

    for (let p = 2; p <= totalPages; p++) {
        await sleep(1000);
        const d = await fetchPage(p);
        all.push(...(d.versions ?? []));
    }

    versionsCache[id] = all;
    res.json({ versions: all });
});

app.get("/auth/logout", (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ error: "Logout failed" });
        res.redirect(process.env.CLIENT_URL || "http://localhost:5173");
    });
});

app.get("/discogs/releases/:id", async (req, res) => {
    const { id } = req.params;

    // 2. Use it in the URL
    const response = await fetch(`https://api.discogs.com/releases/${id}`, {
        // 3. Add auth headers (same as other routes)
        headers: {
            Authorization: `Discogs token=${process.env.DISCOGS_TOKEN}`,
            "User-Agent": "DiscogsClone/1.0",
        },
    });

    // 4. Parse and send back the response
    const data = await response.json();
    res.json(data);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
