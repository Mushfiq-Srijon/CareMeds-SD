import { useEffect, useState } from 'react';
import ApiClient from '../api';
import { Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';
import '../styles/Home.css';

const apiClient = new ApiClient();

interface Medicine {
  id: number;
  name: string;
  generic_name: string;
  company: string;
  category: string;
  stock: number;
  price: number;
}

export default function Home() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Add to cart
  const handleAddToCart = async (medicineId: number) => {
    try {
      await apiClient.addToCart(medicineId, 1);
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  // Fetch medicines
  useEffect(() => {
    const fetchMedicines = async () => {
      setLoading(true);
      const res = await apiClient.getMedicines();
      if (Array.isArray(res)) setMedicines(res);
      else console.error('Unexpected API response:', res);
      setLoading(false);
    };
    fetchMedicines();
  }, []);

  const filtered = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.generic_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="home-root">

      {/* ── HEADER ── */}
      <div className="home-header">
        <div className="home-header-inner">
          <div className="home-title-group">
            <span className="home-eyebrow">CareMeds Catalogue</span>
            <h1 className="home-title">Find Your Medicine</h1>
            <p className="home-subtitle">Search across pharmacies near you — instantly.</p>
          </div>
          <div className="home-search-wrap">
            <span className="search-icon-svg">
              <svg fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input
              className="home-search"
              placeholder="Search by medicine or generic name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="home-body">

        {loading && (
          <div className="home-loading">
            <Spinner animation="border" />
            <span>Fetching medicines…</span>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="home-empty">
            <span className="empty-icon">💊</span>
            <p>No medicines found</p>
          </div>
        )}

        <div className="med-grid">
          {filtered.map((m, i) => (
            <div
              className="med-card"
              key={m.id}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="med-card-top">
                <div className="med-category-badge">{m.category}</div>
                {m.stock === 0
                  ? <div className="med-stock-badge out">Out of stock</div>
                  : <div className="med-stock-badge in">{m.stock} left</div>
                }
              </div>

              <div className="med-card-body">
                <h3 className="med-name">{m.name}</h3>
                <p className="med-generic">{m.generic_name}</p>

                <div className="med-meta">
                  <div className="med-meta-row">
                    <span className="meta-label">Company</span>
                    <span className="meta-value">{m.company}</span>
                  </div>
                  <div className="med-meta-row">
                    <span className="meta-label">Price</span>
                    <span className="meta-value price">{m.price} BDT</span>
                  </div>
                </div>
              </div>

              <div className="med-card-footer">
                <button
                  className={`add-cart-btn ${m.stock === 0 ? 'disabled' : ''}`}
                  disabled={m.stock === 0}
                  onClick={() => handleAddToCart(m.id)}
                >
                  {m.stock === 0 ? 'Out of Stock' : (
                    <>
                      <svg fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="16" height="16">
                        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                      </svg>
                      Add to Cart
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}