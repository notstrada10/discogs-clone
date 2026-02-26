function App() {
    return (
        <div className="bg-red-500 text-white p-8">
            <h1 className="text-3xl font-bold">Discogs Clone</h1>
            <button
                onClick={() =>
                    (window.location.href = "http://localhost:3000/auth/google")
                }
            >
                Login with Google
            </button>
        </div>
    );
}

export default App;
