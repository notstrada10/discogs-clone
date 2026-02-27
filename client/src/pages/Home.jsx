import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const FEATURED_ARTISTS = [
    "The Beatles",
    "Pink Floyd",
    "David Bowie",
    "Radiohead",
    "Daft Punk",
    "Kendrick Lamar",
];

function Home() {
    const [query, setQuery] = useState("");
    const [featured, setFeatured] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        Promise.all(
            FEATURED_ARTISTS.map((name) =>
                fetch(
                    `${import.meta.env.VITE_API_URL}/discogs/artist?q=${encodeURIComponent(name)}`,
                )
                    .then((res) => res.json())
                    .then((data) => ({ name, cover_image: data.cover_image })),
            ),
        ).then(setFeatured);
    }, []);

    function handleSearch(e) {
        e.preventDefault();
        if (!query.trim()) return;
        navigate(`/search?q=${encodeURIComponent(query)}`);
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <h1 className="text-4xl font-bold mb-2">Discover Music</h1>
            <p className="text-gray-400 mb-8">Search the world's largest music database</p>

            <form onSubmit={handleSearch} className="flex gap-3 mb-12">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search albums, artists..."
                    className="flex-1 px-4 py-3 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-yellow-400 text-lg"
                />
                <button
                    type="submit"
                    className="bg-yellow-400 text-black px-6 py-3 rounded font-semibold text-lg"
                >
                    Search
                </button>
            </form>

            <h2 className="text-xl font-semibold mb-4">Featured Artists</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {featured.map((artist) => (
                    <button
                        key={artist.name}
                        onClick={() =>
                            navigate(`/search?q=${encodeURIComponent(artist.name)}`)
                        }
                        className="flex flex-col items-center gap-2 group"
                    >
                        {artist.cover_image ? (
                            <img
                                src={artist.cover_image}
                                alt={artist.name}
                                className="w-full aspect-square object-cover rounded-full group-hover:ring-2 ring-yellow-400"
                            />
                        ) : (
                            <div className="w-full aspect-square bg-gray-700 rounded-full" />
                        )}
                        <span className="text-sm text-center text-gray-300 group-hover:text-white">
                            {artist.name}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default Home;
