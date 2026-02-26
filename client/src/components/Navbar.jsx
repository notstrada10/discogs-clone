import { Link } from "react-router-dom";

function Navbar({ user }) {
    return (
        <nav>
            <Link to="/">Discogs Clone</Link>
            {user ? (
                <div>
                    <span>{user.name}</span>
                    <button
                        onClick={() =>
                            (window.location.href =
                                "http://localhost:3000/auth/logout")
                        }
                    >
                        Logout
                    </button>
                </div>
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
        </nav>
    );
}

export default Navbar;
