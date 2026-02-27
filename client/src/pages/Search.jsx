import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";

function Search() {
    const [searchParams] = useSearchParams();
    const [query, setQuery] = useState(searchParams.get("q") ?? "");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const q = searchParams.get("q");
        if (q) {
            setQuery(q);
            doSearch(q);
        }
    }, []);

    async function doSearch(q) {
        setLoading(true);
        const res = await fetch(
            `http://localhost:3000/discogs/releases?q=${encodeURIComponent(q)}`,
        );
        const data = await res.json();
        setResults(data);
        setLoading(false);
    }

    function handleSearch(e) {
        e.preventDefault();
        if (!query.trim()) return;
        doSearch(query);
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-bold mb-8">Search Releases</h1>

            <form onSubmit={handleSearch} className="flex gap-3 mb-8">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search albums, artists..."
                    className="flex-1 px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-yellow-400"
                />
                <button
                    type="submit"
                    className="bg-yellow-400 text-black px-6 py-2 rounded font-semibold"
                >
                    Search
                </button>
            </form>

            {loading && <p className="text-gray-400">Searching...</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {results.map((release) => (
                    <Link
                        key={release.discogs_id}
                        to={`/releases/${release.discogs_id}`}
                        className="bg-gray-900 text-white rounded-lg overflow-hidden block hover:ring-2 ring-yellow-400"
                    >
                        {release.cover_image ? (
                            <img
                                src={release.cover_image}
                                alt={release.title}
                                className="w-full aspect-square object-cover"
                            />
                        ) : (
                            <div className="w-full aspect-square bg-gray-700 flex items-center justify-center text-gray-500 text-sm">
                                No cover
                            </div>
                        )}
                        <div className="p-4">
                            <p className="text-sm text-gray-400">{release.artist}</p>
                            <p className="font-semibold">
                                {release.title.includes(" - ")
                                    ? release.title.split(" - ").slice(1).join(" - ")
                                    : release.title}
                            </p>
                            <span className="text-sm text-gray-400">{release.year}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default Search;
