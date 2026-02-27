import { Link } from "react-router-dom";

function Navbar({ user }) {
    return (
        <nav className="flex justify-between items-center px-6 py-4 bg-black text-white">
            <div className="flex items-center gap-6">
                <Link to="/" className="font-bold text-xl">
                    Discogs Clone
                </Link>
            </div>
            {user ? (
                <div className="flex items-center gap-4">
                    <span className="text-gray-300">{user.name}</span>
                    <button
                        className="bg-yellow-400 text-black px-4 py-2 rounded font-semibold"
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
                    className="bg-yellow-400 text-black px-4 py-2 rounded font-semibold"
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
