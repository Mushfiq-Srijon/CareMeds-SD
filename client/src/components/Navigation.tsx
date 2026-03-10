import { useLocation, Link } from 'react-router-dom';
import { useState } from 'react';
import '../styles/Navigation.css';

export default function Navigation() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Hide navbar on landing page
  if (location.pathname === '/') {
    return null;
  }

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/home', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/help', label: 'Help' },
    { path: '/cart', label: 'Cart' },
    { path: '/profile', label: 'User Profile' },
  ];

  return (
    <nav className="custom-navbar">
      <div className="custom-navbar-container">

        {/* Brand */}
        <Link to="/home" className="custom-navbar-brand">
          Care<span>Meds</span>
        </Link>

        {/* Hamburger */}
        <button
          className="custom-navbar-toggler"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation"
        >
          <span className="custom-navbar-toggler-icon"></span>
          <span className="custom-navbar-toggler-icon"></span>
          <span className="custom-navbar-toggler-icon"></span>
        </button>

        {/* Links */}
        <div className={`custom-navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`custom-nav-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>

      </div>
    </nav>
  );
}