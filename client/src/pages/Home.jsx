import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Home() {
    const [artists, setArtists] = useState([]);

    useEffect(() => {
        fetch("http://localhost:3000/artists")
            .then((res) => res.json())
            .then((data) => setArtists(data));
    }, []);

    return (
        <div>
            {artists.map((artist) => (
                <Link key={artist.id} to={`/artists/${artist.id}`}>
                    {artist.name}
                </Link>
            ))}
        </div>
    );
}

export default Home;
