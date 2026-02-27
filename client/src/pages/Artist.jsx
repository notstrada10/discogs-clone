import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function Artists() {
    const { id } = useParams();
    const [artist, setArtist] = useState(null);
    const [albums, setAlbums] = useState([]);

    useEffect(() => {
        fetch(`http://localhost:3000/artists/${id}`)
            .then((res) => res.json())
            .then((data) => setArtist(data));

        fetch(`http://localhost:3000/artists/${id}/albums`)
            .then((res) => res.json())
            .then((data) => setAlbums(data));
    }, []);

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <div className="flex items-center gap-6 mb-10">
                {artist?.image_url ? (
                    <img
                        src={artist.image_url}
                        alt={artist.name}
                        className="w-24 h-24 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-700" />
                )}
                <div>
                    <h1 className="text-3xl font-bold">{artist?.name}</h1>
                    {artist?.description && (
                        <p className="text-gray-400 mt-1">{artist.description}</p>
                    )}
                </div>
            </div>

            <h2 className="text-xl font-semibold mb-4">Albums</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {albums.map((album) => (
                    <div
                        key={album.id}
                        className="bg-gray-900 text-white rounded-lg overflow-hidden"
                    >
                        {album.image_url ? (
                            <img
                                src={album.image_url}
                                alt={album.title}
                                className="w-full aspect-square object-cover"
                            />
                        ) : (
                            <div className="w-full aspect-square bg-gray-700 flex items-center justify-center text-gray-500 text-sm">
                                No cover
                            </div>
                        )}
                        <div className="p-4">
                            <p className="text-lg font-semibold">{album.title}</p>
                            <p className="text-sm text-gray-400 mt-1">{album.release_year}</p>
                            {album.genre && (
                                <span className="inline-block mt-2 text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                                    {album.genre}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Artists;
