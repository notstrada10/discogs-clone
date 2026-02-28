CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL
);

CREATE TABLE artists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT
);

CREATE TABLE albums (
    id SERIAL PRIMARY KEY,
    artist_id INT REFERENCES artists(id),
    title VARCHAR(255) NOT NULL,
    release_year INT,
    genre VARCHAR(255),
    image_url TEXT,
    UNIQUE (artist_id, title)
);

CREATE TABLE collections(
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    discogs_release_id INT NOT NULL,
    condition VARCHAR(10) CHECK (condition IN ('M', 'NM', 'VG+', 'VG', 'G+', 'G', 'F', 'P')),
    title VARCHAR(255),
    artist VARCHAR(255),
    cover_image TEXT,
    year INT,
    UNIQUE (user_id, discogs_release_id)
);

CREATE TABLE listings(
    id SERIAL PRIMARY KEY,
    album_id INT REFERENCES albums(id),
    seller_id INT REFERENCES users(id),
    price DECIMAL(10, 2),
    condition VARCHAR(10) CHECK (condition IN ('M', 'NM', 'VG+', 'VG', 'G+', 'G', 'F', 'P')),
    description TEXT
);
