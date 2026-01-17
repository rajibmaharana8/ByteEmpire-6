import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Deforestation from './pages/Deforestation';
import Landfill from './pages/Landfill';
import GovDashboard from './pages/GovDashboard';
import Navbar from './components/Navbar';

function App() {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

    return (
        <BrowserRouter>
            <div className="min-h-screen">
                <div className="stars-container"></div>
                {user && <Navbar />}
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={user ? <Home /> : <Login />} />
                    <Route path="/deforestation" element={user ? <Deforestation /> : <Login />} />
                    <Route path="/landfill" element={user ? <Landfill /> : <Login />} />
                    <Route path="/gov-dashboard" element={user ? (user.role === 'OFFICIAL' || user.role === 'ADMIN' ? <GovDashboard /> : <Home />) : <Login />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}


export default App;
