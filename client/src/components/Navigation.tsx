import { useLocation, Link } from 'react-router-dom';
import { useState } from 'react';
import '../styles/Navigation.css';

export default function Navigation() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Task 6: check both storages
  const role = localStorage.getItem("user_role") || sessionStorage.getItem("user_role") || "";

  // Hide navbar on landing page
  if (location.pathname === '/') {
    return null;
  }

  const isActive = (path: string) => location.pathname === path;

  const allNavItems = [
    { path: '/home',      label: 'Home',        roles: ['customer'] },
    { path: '/cart',      label: 'Cart',        roles: ['customer'] },
    { path: '/my-orders', label: 'My Orders',   roles: ['customer'] }, // ← THIS WAS MISSING
    { path: '/pharmacy',  label: 'Dashboard',   roles: ['pharmacy'] },
    { path: '/rider',     label: 'My Orders',   roles: ['rider'] },
    { path: '/about',     label: 'About',       roles: ['customer', 'pharmacy', 'rider'] },
    { path: '/help',      label: 'Help',        roles: ['customer', 'pharmacy', 'rider'] },
    { path: '/profile',   label: 'User Profile',roles: ['customer', 'pharmacy', 'rider'] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(role));

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