import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

const CONDITIONS = ["M", "NM", "VG+", "VG", "G+", "G", "F", "P"];

function Release({ user }) {
    const { id } = useParams();
    const [release, setRelease] = useState(null);
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const [collectionEntry, setCollectionEntry] = useState(null);
    const [condition, setCondition] = useState("VG+");
    const [listings, setListings] = useState([]);
    const [sellPrice, setSellPrice] = useState("");
    const [sellCondition, setSellCondition] = useState("VG+");
    const [sellDescription, setSellDescription] = useState("");
    const [myListing, setMyListing] = useState(null);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/discogs/releases/${id}`)
            .then((res) => res.json())
            .then((data) => setRelease(data));

        fetch(`${import.meta.env.VITE_API_URL}/listings/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setListings(data);
                if (user) setMyListing(data.find((l) => l.seller_id === user.id) ?? null);
            });

        if (user) {
            fetch(`${import.meta.env.VITE_API_URL}/collection`, { credentials: "include" })
                .then((res) => res.json())
                .then((data) => {
                    const entry = data.find((item) => String(item.discogs_release_id) === String(id));
                    setCollectionEntry(entry ?? null);
                });
        }
    }, [user]);

    useEffect(() => {
        function handleKey(e) {
            if (lightboxIndex === null) return;
            if (e.key === "ArrowRight") next();
            if (e.key === "ArrowLeft") prev();
            if (e.key === "Escape") setLightboxIndex(null);
        }
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [lightboxIndex, release]);

    async function addToCollection() {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/collection`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                discogs_release_id: Number(id),
                condition,
                title: release.title,
                artist: release.artists?.[0]?.name ?? null,
                cover_image: release.images?.[0]?.uri ?? null,
                year: release.year ?? null,
            }),
        });
        const data = await res.json();
        if (res.ok) setCollectionEntry(data);
    }

    async function createListing() {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/listings`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                discogs_release_id: Number(id),
                price: parseFloat(sellPrice),
                condition: sellCondition,
                description: sellDescription,
                title: release.title,
                artist: release.artists?.[0]?.name ?? null,
                cover_image: release.images?.[0]?.uri ?? null,
            }),
        });
        const data = await res.json();
        if (res.ok) {
            setMyListing(data);
            setListings((prev) => [...prev, { ...data, seller_name: user.name }]);
        }
    }

    async function cancelListing() {
        await fetch(`${import.meta.env.VITE_API_URL}/listings/${myListing.id}`, {
            method: "DELETE",
            credentials: "include",
        });
        setListings((prev) => prev.filter((l) => l.id !== myListing.id));
        setMyListing(null);
    }

    async function buyListing(listing) {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/listings/${listing.id}/buy`, {
            method: "POST",
            credentials: "include",
        });
        if (res.ok) {
            setListings((prev) => prev.filter((l) => l.id !== listing.id));
        }
    }

    async function removeFromCollection() {
        await fetch(`${import.meta.env.VITE_API_URL}/collection/${collectionEntry.id}`, {
            method: "DELETE",
            credentials: "include",
        });
        setCollectionEntry(null);
    }

    if (!release) return <p className="p-6">Loading...</p>;

    const images = release.images ?? [];
    const format = release.formats?.[0];
    const formatStr = [format?.name, ...(format?.descriptions ?? [])].filter(Boolean).join(", ");
    const catno = release.labels?.[0]?.catno;

    function prev() {
        setLightboxIndex((i) => (i - 1 + images.length) % images.length);
    }
    function next() {
        setLightboxIndex((i) => (i + 1) % images.length);
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">

            {/* Lightbox */}
            {lightboxIndex !== null && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
                    onClick={() => setLightboxIndex(null)}
                >
                    <button
                        className="absolute left-4 text-white text-3xl px-4 py-2 hover:text-yellow-400"
                        onClick={(e) => { e.stopPropagation(); prev(); }}
                    >
                        ‹
                    </button>
                    <img
                        src={images[lightboxIndex].uri}
                        alt={`${release.title} ${lightboxIndex + 1}`}
                        className="max-h-[85vh] max-w-[85vw] object-contain rounded"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        className="absolute right-4 text-white text-3xl px-4 py-2 hover:text-yellow-400"
                        onClick={(e) => { e.stopPropagation(); next(); }}
                    >
                        ›
                    </button>
                    <span className="absolute bottom-4 text-gray-400 text-sm">
                        {lightboxIndex + 1} / {images.length}
                    </span>
                </div>
            )}

            {/* Header */}
            <div className="flex gap-8 mb-10">
                {images[0]?.uri && (
                    <img
                        src={images[0].uri}
                        alt={release.title}
                        className="w-56 h-56 object-cover rounded-lg flex-shrink-0 cursor-pointer hover:opacity-80"
                        onClick={() => setLightboxIndex(0)}
                    />
                )}
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold">{release.title}</h1>
                    <p className="text-xl text-gray-400">{release.artists?.[0]?.name}</p>

                    <div className="text-sm text-gray-500 flex flex-col gap-1 mt-1">
                        {release.year && <span>{release.year}</span>}
                        {release.country && <span>{release.country}</span>}
                        {release.labels?.[0]?.name && <span>{release.labels[0].name}</span>}
                        {catno && <span>Cat# {catno}</span>}
                        {formatStr && <span>{formatStr}</span>}
                    </div>

                    <div className="flex gap-2 mt-2 flex-wrap">
                        {release.genres?.map((g) => (
                            <span key={g} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">{g}</span>
                        ))}
                        {release.styles?.map((s) => (
                            <span key={s} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">{s}</span>
                        ))}
                    </div>

                    {release.master_id && (
                        <Link to={`/masters/${release.master_id}`} className="text-yellow-400 text-sm hover:underline mt-2 self-start">
                            See all versions →
                        </Link>
                    )}

                    {user && (
                        <div className="flex items-center gap-2 mt-3">
                            {collectionEntry ? (
                                <button
                                    onClick={removeFromCollection}
                                    className="text-sm bg-gray-700 text-white px-4 py-2 rounded hover:bg-red-700"
                                >
                                    ✓ In Collection · Remove
                                </button>
                            ) : (
                                <>
                                    <select
                                        value={condition}
                                        onChange={(e) => setCondition(e.target.value)}
                                        className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 text-sm"
                                    >
                                        {CONDITIONS.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={addToCollection}
                                        className="text-sm bg-yellow-400 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-300"
                                    >
                                        + Add to Collection
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Community stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-white">{release.community?.have ?? "—"}</p>
                    <p className="text-xs text-gray-400 mt-1">Have</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-white">{release.community?.want ?? "—"}</p>
                    <p className="text-xs text-gray-400 mt-1">Want</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-white">
                        {release.community?.rating?.average
                            ? release.community.rating.average.toFixed(2)
                            : "—"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        Rating ({release.community?.rating?.count ?? 0} votes)
                    </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-white">{release.num_for_sale ?? "—"}</p>
                    <p className="text-xs text-gray-400 mt-1">
                        For Sale{release.lowest_price ? ` · from $${release.lowest_price.toFixed(2)}` : ""}
                    </p>
                </div>
            </div>

            {/* Notes */}
            {release.notes && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">Notes</h2>
                    <p className="text-gray-400 text-sm whitespace-pre-line">{release.notes}</p>
                </div>
            )}

            {/* Tracklist */}
            <h2 className="text-xl font-semibold mb-4">Tracklist</h2>
            <table className="w-full text-sm mb-10">
                <tbody>
                    {release.tracklist?.map((track, i) => (
                        <tr key={i} className="border-b border-gray-800">
                            <td className="py-2 pr-4 text-gray-500 w-8">{track.position}</td>
                            <td className="py-2">{track.title}</td>
                            <td className="py-2 text-right text-gray-500">{track.duration}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Identifiers */}
            {release.identifiers?.length > 0 && (
                <div className="mb-10">
                    <h2 className="text-xl font-semibold mb-4">Identifiers</h2>
                    <table className="w-full text-sm">
                        <tbody>
                            {release.identifiers.map((identifier, i) => (
                                <tr key={i} className="border-b border-gray-800">
                                    <td className="py-2 pr-4 text-gray-500 w-40">{identifier.type}</td>
                                    <td className="py-2 font-mono text-gray-300">{identifier.value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Marketplace */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Marketplace</h2>

                {/* Sell form */}
                {user && collectionEntry && !myListing && (
                    <div className="bg-gray-900 rounded-lg p-4 mb-6">
                        <p className="text-sm font-semibold mb-3">List your copy for sale</p>
                        <div className="flex flex-wrap gap-3 items-end">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-400">Price (USD)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={sellPrice}
                                    onChange={(e) => setSellPrice(e.target.value)}
                                    placeholder="9.99"
                                    className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 text-sm w-28"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-400">Condition</label>
                                <select
                                    value={sellCondition}
                                    onChange={(e) => setSellCondition(e.target.value)}
                                    className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 text-sm"
                                >
                                    {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1 flex-1 min-w-40">
                                <label className="text-xs text-gray-400">Notes (optional)</label>
                                <input
                                    type="text"
                                    value={sellDescription}
                                    onChange={(e) => setSellDescription(e.target.value)}
                                    placeholder="e.g. Original pressing, no scratches"
                                    className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 text-sm"
                                />
                            </div>
                            <button
                                onClick={createListing}
                                disabled={!sellPrice}
                                className="bg-yellow-400 text-black px-4 py-2 rounded font-semibold text-sm hover:bg-yellow-300 disabled:opacity-40"
                            >
                                List for Sale
                            </button>
                        </div>
                    </div>
                )}

                {user && myListing && (
                    <div className="bg-gray-900 rounded-lg p-4 mb-6 flex items-center justify-between">
                        <p className="text-sm text-gray-300">
                            Your listing: <span className="text-white font-semibold">${parseFloat(myListing.price).toFixed(2)}</span> · {myListing.condition}
                        </p>
                        <button
                            onClick={cancelListing}
                            className="text-sm text-red-400 hover:underline"
                        >
                            Cancel listing
                        </button>
                    </div>
                )}

                {listings.length === 0 ? (
                    <p className="text-gray-500 text-sm">No copies for sale.</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 border-b border-gray-800">
                                <th className="py-2 pr-4">Seller</th>
                                <th className="py-2 pr-4">Condition</th>
                                <th className="py-2 pr-4">Notes</th>
                                <th className="py-2 text-right">Price</th>
                                <th className="py-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {listings.map((l) => (
                                <tr key={l.id} className="border-b border-gray-800">
                                    <td className="py-3 pr-4 text-gray-300">{l.seller_name}</td>
                                    <td className="py-3 pr-4">{l.condition}</td>
                                    <td className="py-3 pr-4 text-gray-500">{l.description ?? "—"}</td>
                                    <td className="py-3 text-right font-semibold">${parseFloat(l.price).toFixed(2)}</td>
                                    <td className="py-3 pl-4">
                                        {user && l.seller_id !== user.id && (
                                            <button
                                                onClick={() => buyListing(l)}
                                                className="bg-yellow-400 text-black px-3 py-1 rounded text-xs font-semibold hover:bg-yellow-300"
                                            >
                                                Buy
                                            </button>
                                        )}
                                        {!user && (
                                            <span className="text-gray-500 text-xs">Log in to buy</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

        </div>
    );
}

export default Release;
