import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiClient from '../api';
import toast from 'react-hot-toast';
import '../styles/MedicineDetail.css';

const apiClient = new ApiClient();

interface MedicineDetail {
  id: number;
  name: string;
  generic_name: string;
  company: string;
  category: string;
  stock: number;
  price: number;
  pharmacy_name: string;
  location: string;
  phone: string;
}

export default function MedicineDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [medicine, setMedicine] = useState<MedicineDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMedicine();
  }, [id]);

  async function fetchMedicine() {
    try {
      setLoading(true);
      const data = await apiClient.getMedicineById(Number(id));
      setMedicine(data);
    } catch {
      toast.error('Medicine not found');
      navigate('/home');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToCart() {
    try {
      await apiClient.addToCart(Number(id), 1);
      toast.success('Added to cart!');
    } catch {
      toast.error('Failed to add to cart');
    }
  }

  if (loading) {
    return (
      <div className="md-loading">
        <div className="md-spinner" />
        <p>Loading medicine details…</p>
      </div>
    );
  }

  if (!medicine) return null;

  return (
    <div className="md-page">

      {/* Hero */}
      <div className="md-hero">
        <div className="md-hero-overlay" />
        <div className="md-hero-content">
          <button className="md-back-btn" onClick={() => navigate('/home')}>
            ← Back
          </button>
          <div className="md-category-badge">{medicine.category}</div>
          <h1>{medicine.name}</h1>
          <p className="md-generic">{medicine.generic_name}</p>
        </div>
      </div>

      {/* Body */}
      <div className="md-body">
        <div className="md-grid">

          {/* Left — Medicine Info */}
          <div className="md-card">
            <h2>💊 Medicine Details</h2>

            <div className="md-info-grid">
              <div className="md-info-item">
                <span className="md-label">Medicine Name</span>
                <span className="md-value">{medicine.name}</span>
              </div>
              <div className="md-info-item">
                <span className="md-label">Generic Name</span>
                <span className="md-value">{medicine.generic_name}</span>
              </div>
              <div className="md-info-item">
                <span className="md-label">Company</span>
                <span className="md-value">{medicine.company}</span>
              </div>
              <div className="md-info-item">
                <span className="md-label">Category</span>
                <span className="md-value">{medicine.category}</span>
              </div>
              <div className="md-info-item">
                <span className="md-label">Stock</span>
                <span className={`md-value ${medicine.stock === 0 ? 'out-of-stock' : 'in-stock'}`}>
                  {medicine.stock === 0 ? 'Out of Stock' : `${medicine.stock} units available`}
                </span>
              </div>
              <div className="md-info-item">
                <span className="md-label">Price</span>
                <span className="md-value md-price">৳{Number(medicine.price).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Right — Pharmacy Info + Add to Cart */}
          <div>
            <div className="md-card">
              <h2>🏥 Pharmacy Info</h2>
              <div className="md-info-grid">
                <div className="md-info-item full">
                  <span className="md-label">Pharmacy Name</span>
                  <span className="md-value">{medicine.pharmacy_name}</span>
                </div>
                <div className="md-info-item full">
                  <span className="md-label">📍 Location</span>
                  <span className="md-value">{medicine.location}</span>
                </div>
                <div className="md-info-item full">
                  <span className="md-label">📞 Phone</span>
                  <span className="md-value">{medicine.phone}</span>
                </div>
              </div>
            </div>

            <div className="md-card md-action-card">
              <div className="md-price-display">
                <span className="md-price-label">Price per unit</span>
                <span className="md-price-big">৳{Number(medicine.price).toFixed(2)}</span>
              </div>
              <button
                className={`md-cart-btn ${medicine.stock === 0 ? 'disabled' : ''}`}
                disabled={medicine.stock === 0}
                onClick={handleAddToCart}
              >
                {medicine.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
