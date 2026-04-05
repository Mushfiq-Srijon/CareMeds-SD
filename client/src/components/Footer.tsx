import { Link } from 'react-router-dom';
import '../styles/Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">

      {/* ── Three columns ── */}
      <div className="footer-main">

        {/* Column 1: About */}
        <div className="footer-col">
          <h3 className="footer-logo">Care<span>Meds</span></h3>
          <p className="footer-about">
            Your trusted platform for finding and ordering medicines from
            verified pharmacies near you. Fast, safe, and reliable.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div className="footer-col">
          <h4 className="footer-col-title">Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/home">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/help">Help</Link></li>
          </ul>
        </div>

        {/* Column 3: Contact */}
        <div className="footer-col">
          <h4 className="footer-col-title">Contact</h4>
          <p className="footer-contact-item">📧 support@caremeds.app</p>
          <p className="footer-contact-item">📞 +880 1700-000000</p>
          <p className="footer-contact-item">📍 Dhaka, Bangladesh</p>
        </div>

      </div>

      {/* ── Bottom bar ── */}
      <div className="footer-bottom">
        <p>© 2026 CareMeds | AUST CSE — All rights reserved.</p>
      </div>

    </footer>
  );
}