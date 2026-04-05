import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLocation } from 'react-router-dom';

export default function BaseLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const hideNavPaths = ['/login', '/register', '/forgot-password'];
  const showNav = !hideNavPaths.includes(location.pathname);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f0f4f8' }}>
      {showNav && <Navigation />}

      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* Task 8: replaced old plain footer with new Footer component */}
      <Footer />
    </div>
  );
}
