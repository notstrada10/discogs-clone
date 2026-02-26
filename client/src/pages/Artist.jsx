import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function Artists() {
    const { id } = useParams();
    const [albums, setAlbums] = useState([]);

    useEffect(() => {
        fetch(`http://localhost:3000/artists/${id}/albums`)
            .then((res) => res.json())
            .then((data) => setAlbums(data));
    }, []);

    return (
        <div>
            {albums.map((album) => (
                <p key={album.id}>{album.title}</p>
            ))}
        </div>
    );
}

export default Artists;
