require("dotenv").config();
const passport = require("passport");

const { Pool } = require("pg");
const pool = process.env.DATABASE_URL
    ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
    : new Pool({ database: "discogs_clone" });

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

var GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
    new GoogleStrategy(
        {
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.SERVER_URL
                ? `${process.env.SERVER_URL}/auth/google/callback`
                : "http://localhost:3000/auth/google/callback",
        },
        async function (accessToken, refreshToken, profile, cb) {
            try {
                const result = await pool.query(
                    "SELECT * FROM users WHERE google_id = $1",
                    [profile.id],
                );

                if (result.rows.length > 0) {
                    return cb(null, result.rows[0]);
                } else {
                    const newUser = await pool.query(
                        "INSERT INTO users (google_id, name, email) VALUES ($1, $2, $3) RETURNING *",
                        [
                            profile.id,
                            profile.displayName,
                            profile.emails[0].value,
                        ], // what 3 values from profile go here?
                    );
                    return cb(null, newUser.rows[0]);
                }
            } catch (err) {
                return cb(err);
            }
        },
    ),
);

// used to serialize the user for the session
passport.serializeUser(function (user, done) {
    done(null, user.id);
    // where is this user.id going? Are we supposed to access this anywhere?
});

// used to deserialize the user
passport.deserializeUser(async function (id, done) {
    try {
        const result = await pool.query("SELECT * FROM users WHERE id = $1", [
            id,
        ]);
        done(null, result.rows[0]);
    } catch (err) {
        done(err);
    }
});
