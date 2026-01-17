
import { Link, useLocation } from 'react-router-dom';
import { Leaf, Shield, User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

const Navbar = () => {
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/';
    };

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-bg-dark/80 backdrop-blur-lg border-b border-white/10 py-3' : 'bg-transparent py-5'}`}>
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <Leaf className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">
                        <span className="text-primary">Eco</span>Guard <span className="text-success text-sm font-medium px-2 py-0.5 bg-success/10 rounded-full ml-1">PRO</span>
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    {[
                        { name: 'Home', path: '/' },
                        { name: 'Deforestation', path: '/deforestation' },
                        { name: 'Landfill Detection', path: '/landfill' },
                        ...(user && (user.role === 'OFFICIAL' || user.role === 'ADMIN') ? [{ name: 'Gov Dashboard', path: '/gov-dashboard' }] : [])
                    ].map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === link.path ? 'text-primary' : 'text-muted'}`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 text-sm">
                                <User className="w-4 h-4 text-primary" />
                                <span>{user.name}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 hover:bg-danger/20 hover:text-danger rounded-full transition-colors order-last"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="glow-button px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2"
                        >
                            <Shield className="w-4 h-4" />
                            Access System
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
