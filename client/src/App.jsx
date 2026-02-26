import { useState, useEffect } from "react";

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetch("http://localhost:3000/auth/me", { credentials: "include" })
            .then((res) => res.json())
            .then((data) => {
                if (data.id) setUser(data);
            });
    }, []);

    return (
        <div>
            {user ? (
                <p>Hello, {user.name}</p>
            ) : (
                <button
                    onClick={() =>
                        (window.location.href =
                            "http://localhost:3000/auth/google")
                    }
                >
                    Login with Google
                </button>
            )}
        </div>
    );
}

export default App;
