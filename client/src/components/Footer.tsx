import { Link } from 'react-router-dom';
import '../styles/Footer.css';

// scroll to top helper
function ScrollLink({ to, children }: { to: string; children: string }) {
  return (
    <Link
      to={to}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      {children}
    </Link>
  );
}

export default function Footer() {
  return (
    <footer className="site-footer">

      <div className="footer-main">

        {/* Column 1: About */}
        <div className="footer-col">
          <h3 className="footer-logo">Care<span>Meds</span></h3>
          <p className="footer-about">
            Your trusted platform for finding and ordering medicines from
            verified pharmacies near you. Fast, safe, and reliable.
          </p>
        </div>

        {/* Column 2: Quick Links — scroll to top on click */}
        <div className="footer-col">
          <h4 className="footer-col-title">Quick Links</h4>
          <ul className="footer-links">
            <li><ScrollLink to="/home">Home</ScrollLink></li>
            <li><ScrollLink to="/about">About</ScrollLink></li>
            <li><ScrollLink to="/help">Help</ScrollLink></li>
          </ul>
        </div>

        {/* Column 3: Contact — email fixed */}
        <div className="footer-col">
          <h4 className="footer-col-title">Contact</h4>
          <p className="footer-contact-item">📧 caremeds65@gmail.com</p>
          <p className="footer-contact-item">📞 +880 1700-000000</p>
          <p className="footer-contact-item">📍 Dhaka, Bangladesh</p>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© 2026 CareMeds | AUST CSE — All rights reserved.</p>
      </div>

    </footer>
  );
}