import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

function Master() {
    const { id } = useParams();
    const [master, setMaster] = useState(null);
    const [allVersions, setAllVersions] = useState([]);
    const [loading, setLoading] = useState(true);

    // filters
    const [yearFilter, setYearFilter] = useState("");
    const [countryFilter, setCountryFilter] = useState("");
    const [formatFilter, setFormatFilter] = useState("");

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/discogs/masters/${id}`)
            .then((res) => res.json())
            .then((data) => setMaster(data));

        fetch(`${import.meta.env.VITE_API_URL}/discogs/masters/${id}/versions/all`)
            .then((res) => res.json())
            .then((data) => {
                setAllVersions(data.versions ?? []);
                setLoading(false);
            });
    }, []);

    if (!master) return <p className="p-6">Loading...</p>;

    const isFiltering = yearFilter || countryFilter || formatFilter;

    const filtered = allVersions
        .filter((v) => !yearFilter || String(v.released) === yearFilter)
        .filter((v) => !countryFilter || v.country === countryFilter)
        .filter((v) => !formatFilter || v.format === formatFilter);

    const years = [...new Set(allVersions.map((v) => v.released).filter(Boolean))].sort();
    const countries = [...new Set(allVersions.map((v) => v.country).filter(Boolean))].sort();
    const formats = [...new Set(allVersions.map((v) => v.format).filter(Boolean))].sort();

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            {/* Header */}
            <div className="flex gap-8 mb-10">
                {master.images?.[0]?.uri && (
                    <img
                        src={master.images[0].uri}
                        alt={master.title}
                        className="w-48 h-48 object-cover rounded-lg flex-shrink-0"
                    />
                )}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{master.title}</h1>
                    <p className="text-xl text-gray-500 mt-1">
                        {master.artists?.[0]?.name}
                    </p>
                    <p className="text-gray-500 mt-1">{master.year}</p>
                    <p className="text-gray-400 text-sm mt-2">
                        {loading ? "Loading..." : `${isFiltering ? `${filtered.length} of ` : ""}${allVersions.length} versions`}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-6 flex-wrap">
                <select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="bg-white text-gray-900 px-3 py-2 rounded border border-gray-300"
                >
                    <option value="">All Years</option>
                    {years.map((y) => (
                        <option key={y} value={y}>
                            {y}
                        </option>
                    ))}
                </select>
                <select
                    value={countryFilter}
                    onChange={(e) => setCountryFilter(e.target.value)}
                    className="bg-white text-gray-900 px-3 py-2 rounded border border-gray-300"
                >
                    <option value="">All Countries</option>
                    {countries.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>
                <select
                    value={formatFilter}
                    onChange={(e) => setFormatFilter(e.target.value)}
                    className="bg-white text-gray-900 px-3 py-2 rounded border border-gray-300"
                >
                    <option value="">All Formats</option>
                    {formats.map((f) => (
                        <option key={f} value={f}>
                            {f}
                        </option>
                    ))}
                </select>
                {(yearFilter || countryFilter || formatFilter) && (
                    <button
                        onClick={() => {
                            setYearFilter("");
                            setCountryFilter("");
                            setFormatFilter("");
                        }}
                        className="text-sm text-yellow-400 hover:underline px-2"
                    >
                        Clear filters
                    </button>
                )}
            </div>

            {/* Versions table */}
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-300 text-gray-500 text-left">
                        <th className="pb-2 pr-4">Label / Cat#</th>
                        <th className="pb-2 pr-4">Year</th>
                        <th className="pb-2 pr-4">Country</th>
                        <th className="pb-2">Format</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map((v) => (
                        <tr
                            key={v.id}
                            className="border-b border-gray-200 hover:bg-gray-100"
                        >
                            <td className="py-2 pr-4">
                                <Link
                                    to={`/releases/${v.id}`}
                                    className="text-gray-900 hover:text-yellow-600"
                                >
                                    {[v.label, v.catno].filter(Boolean).join(" – ") || "—"}
                                </Link>
                            </td>
                            <td className="py-2 pr-4 text-gray-500">
                                {v.released ?? "—"}
                            </td>
                            <td className="py-2 pr-4 text-gray-500">
                                {v.country ?? "—"}
                            </td>
                            <td className="py-2 text-gray-500">
                                {v.format ?? "—"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {loading && (
                <p className="text-gray-400 mt-4">Loading versions...</p>
            )}

            {!loading && filtered.length === 0 && (
                <p className="text-gray-400 mt-4">No versions match your filters.</p>
            )}
        </div>
    );
}

export default Master;
