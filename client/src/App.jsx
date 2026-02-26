import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Artist from "./pages/Artist";
import Navbar from "./components/Navbar";

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
        <BrowserRouter>
            <Navbar user={user} />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/artists/:id" element={<Artist />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
