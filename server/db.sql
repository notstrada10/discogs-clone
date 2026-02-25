CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL
);

CREATE TABLE artists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

CREATE TABLE albums (
    id SERIAL PRIMARY KEY,
    artist_id INT REFERENCES artists(id),
    title VARCHAR(255) NOT NULL,
    release_year INT,
    genre VARCHAR(255)
);

CREATE TABLE collections(
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    album_id INT REFERENCES albums(id),
    condition VARCHAR(10) CHECK (condition IN ('M', 'NM', 'VG+', 'VG', 'G+', 'G', 'F', 'P'))
);

CREATE TABLE listings(
    id SERIAL PRIMARY KEY,
    album_id INT REFERENCES albums(id),
    seller_id INT REFERENCES users(id),
    price DECIMAL(10, 2),
    condition VARCHAR(10) CHECK (condition IN ('M', 'NM', 'VG+', 'VG', 'G+', 'G', 'F', 'P')),
    description TEXT
);
