import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Artist from "./pages/Artist";
import Search from "./pages/Search";
import Release from "./pages/Release";
import Navbar from "./components/Navbar";
import Master from "./pages/Master";

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/auth/me`, { credentials: "include" })
            .then((res) => res.json())
            .then((data) => {
                if (data.id) setUser(data);
            });
    }, []);

    return (
        <BrowserRouter>
            <Navbar user={user} />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/artists/:id" element={<Artist />} />
                <Route path="/search" element={<Search />} />
                <Route path="/releases/:id" element={<Release />} />
                <Route path="/masters/:id" element={<Master />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
