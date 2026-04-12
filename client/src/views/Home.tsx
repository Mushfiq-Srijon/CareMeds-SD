import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  pharmacy_name: string;
  pharmacy_location: string;
}

export default function Home() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch]       = useState('');
  const [location, setLocation]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [page, setPage]           = useState(1);
  const [total, setTotal]         = useState(0);
  const perPage                   = 12;
  const navigate                  = useNavigate();

  const fetchMedicines = useCallback(async (searchVal: string, pageVal: number, locationVal: string) => {
    setLoading(true);
    try {
      const res = await apiClient.getMedicines(searchVal, pageVal, perPage, locationVal);
      setMedicines(res.data ?? []);
      setTotal(res.total ?? 0);
    } catch {
      toast.error('Failed to fetch medicines');
    }
    setLoading(false);
  }, []);

  // Debounce search + location — waits 400ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchMedicines(search, 1, location);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, location]);

  // Fetch on page change
  useEffect(() => {
    fetchMedicines(search, page, location);
  }, [page]);

  const totalPages = Math.ceil(total / perPage);

  const handleAddToCart = async (e: React.MouseEvent, medicineId: number) => {
    e.stopPropagation();
    try {
      await apiClient.addToCart(medicineId, 1);
      toast.success('Added to cart!');
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  return (
    <div className="home-root">

      {/* HEADER */}
      <div className="home-header">
        <div className="home-header-inner">
          <div className="home-title-group">
            <span className="home-eyebrow">CareMeds Catalogue</span>
            <h1 className="home-title">Find Your Medicine</h1>
            <p className="home-subtitle">Search across pharmacies near you — instantly.</p>
          </div>

          <div className="home-controls">
            {/* Medicine search */}
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

            {/* Location filter */}
            <div className="home-search-wrap">
              <span className="search-icon-svg">
                <svg fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  <circle cx="12" cy="9" r="2.5"/>
                </svg>
              </span>
              <input
                className="home-search"
                placeholder="Filter by location (division, city, area...)"
                value={location}
                onChange={(e) => { setLocation(e.target.value); setPage(1); }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="home-body">

        {loading && (
          <div className="home-loading">
            <Spinner animation="border" />
            <span>Fetching medicines…</span>
          </div>
        )}

        {!loading && medicines.length === 0 && (
          <div className="home-empty">
            <span className="empty-icon">💊</span>
            <p>No medicines found</p>
          </div>
        )}

        <div className="med-grid">
          {medicines.map((m, i) => (
            <div
              className="med-card"
              key={m.id}
              style={{ animationDelay: `${i * 0.06}s`, cursor: 'pointer' }}
              onClick={() => navigate(`/medicine/${m.id}`)}
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
                  {m.pharmacy_name && (
                    <div className="med-meta-row">
                      <span className="meta-label">Pharmacy</span>
                      <span className="meta-value">{m.pharmacy_name}</span>
                    </div>
                  )}
                  {m.pharmacy_location && (
                    <div className="med-meta-row">
                      <span className="meta-label">📍</span>
                      <span className="meta-value">{m.pharmacy_location}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="med-card-footer">
                <button
                  className={`add-cart-btn ${m.stock === 0 ? 'disabled' : ''}`}
                  disabled={m.stock === 0}
                  onClick={(e) => handleAddToCart(e, m.id)}
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

        {totalPages > 1 && (
          <div className="pagination-row">
            <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span className="page-info">
              Page {page} of {totalPages}
              <span className="page-total"> ({total} results)</span>
            </span>
            <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}