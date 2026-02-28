import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const CONDITIONS = ["M", "NM", "VG+", "VG", "G+", "G", "F", "P"];

function Collection({ user }) {
    const [collection, setCollection] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        fetch(`${import.meta.env.VITE_API_URL}/collection`, { credentials: "include" })
            .then((res) => res.json())
            .then((data) => {
                setCollection(data);
                setLoading(false);
            });
    }, [user]);

    async function remove(id) {
        await fetch(`${import.meta.env.VITE_API_URL}/collection/${id}`, {
            method: "DELETE",
            credentials: "include",
        });
        setCollection((prev) => prev.filter((item) => item.id !== id));
    }

    if (!user) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-10">
                <p className="text-gray-400">Log in to see your collection.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-bold mb-8">My Collection</h1>

            {loading && <p className="text-gray-400">Loading...</p>}

            {!loading && collection.length === 0 && (
                <p className="text-gray-400">Your collection is empty. Find releases and add them!</p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {collection.map((item) => (
                    <div key={item.id} className="flex flex-col gap-2">
                        <Link to={`/releases/${item.discogs_release_id}`}>
                            {item.cover_image ? (
                                <img
                                    src={item.cover_image}
                                    alt={item.title}
                                    className="w-full aspect-square object-cover rounded hover:opacity-80"
                                />
                            ) : (
                                <div className="w-full aspect-square bg-gray-800 rounded" />
                            )}
                        </Link>
                        <div>
                            <p className="text-sm font-semibold truncate">{item.title}</p>
                            <p className="text-xs text-gray-400 truncate">{item.artist}</p>
                            <p className="text-xs text-gray-500">{item.year} · {item.condition}</p>
                        </div>
                        <button
                            onClick={() => remove(item.id)}
                            className="text-xs text-red-400 hover:underline self-start"
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Collection;
