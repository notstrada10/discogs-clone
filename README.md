# Discogs Clone

A full-stack record database and marketplace app built on top of the [Discogs API](https://www.discogs.com/developers). Search millions of releases, explore artists and master releases, manage your collection, and buy or sell records with other users.

---

## Features

- **Search** releases by title, artist, or keyword
- **Release pages** with tracklist, identifiers, images, community stats, and marketplace listings
- **Master release pages** with dynamic filtering by year, country, and format across all versions
- **Artist pages** with cover image and discography
- **Collection** — add records you own, browse and manage your library
- **Marketplace** — list records from your collection for sale; other users can buy them
- **Google OAuth** login — one click, no passwords

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router 7, Tailwind CSS 4, Vite |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL |
| Auth | Passport.js, Google OAuth 2.0, express-session |
| Data | Discogs REST API |
| Deployment | Railway |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL running locally
- A [Discogs developer token](https://www.discogs.com/settings/developers)
- A [Google OAuth app](https://console.cloud.google.com/) (Client ID + Secret)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/discogs-clone.git
cd discogs-clone
```

### 2. Set up the database

```bash
psql -U postgres -c "CREATE DATABASE discogs_clone;"
psql discogs_clone < server/db.sql
```

### 3. Configure environment variables

Create `server/.env`:

```env
DATABASE_URL=
SESSION_SECRET=your-secret-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
DISCOGS_TOKEN=your-discogs-token
CLIENT_URL=http://localhost:5173
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:3000
```

### 4. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 5. Run locally

In one terminal:
```bash
cd server && node index.js
```

In another:
```bash
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Project Structure

```
discogs-clone/
├── client/               # React frontend
│   └── src/
│       ├── pages/        # Home, Search, Release, Master, Artist, Collection
│       └── components/   # Navbar
└── server/
    ├── index.js          # Express app + all API routes
    ├── auth.js           # Passport Google OAuth strategy
    └── db.sql            # Database schema
```

---

## API Routes

### Auth
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/auth/google` | Start Google OAuth flow |
| `GET` | `/auth/google/callback` | OAuth callback |
| `GET` | `/auth/me` | Get current user |
| `GET` | `/auth/logout` | Log out |

### Discogs (proxied)
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/discogs/releases` | Search releases |
| `GET` | `/discogs/releases/:id` | Get a release |
| `GET` | `/discogs/masters/:id` | Get a master release |
| `GET` | `/discogs/masters/:id/versions` | Get versions (paginated) |
| `GET` | `/discogs/masters/:id/versions/all` | Get all versions (cached) |
| `GET` | `/discogs/artist` | Search artists |

### Collection
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/collection` | Get your collection |
| `POST` | `/collection` | Add a release |
| `DELETE` | `/collection/:id` | Remove a release |

### Marketplace
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/listings/:discogs_release_id` | Get listings for a release |
| `POST` | `/listings` | Create a listing |
| `DELETE` | `/listings/:id` | Cancel your listing |
| `POST` | `/listings/:id/buy` | Buy a listing |
