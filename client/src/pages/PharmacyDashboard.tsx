import { useEffect, useState } from 'react';
import ApiClient from '../api';
import { toast } from 'react-hot-toast';
import '../styles/PharmacyDashboard.css';

const apiClient = new ApiClient();

// ── Types ──────────────────────────────────────────────
interface Pharmacy {
  id: number;
  pharmacy_name: string;
  location: string;
  phone: string;
}

interface Medicine {
  id: number;
  name: string;
  generic_name: string;
  company: string;
  category: string;
  stock: number;
  price: number;
}

interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  total_price: number;
  delivery_type: string;
  status: string;
  created_at: string;
}

const emptyProfile = { pharmacy_name: '', location: '', phone: '' };
const emptyMedicine = {
  name: '', generic_name: '', company: '',
  category: '', stock: '', price: ''
};

const isValidPhone = (phone: string) => /^01[0-9]{9}$/.test(phone);

// ══════════════════════════════════════════════════════
export default function PharmacyDashboard() {

  const [tab, setTab]                       = useState<'medicines' | 'orders'>('medicines');

  // profile
  const [pharmacy, setPharmacy]             = useState<Pharmacy | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm]       = useState(emptyProfile);
  const [profileSaving, setProfileSaving]   = useState(false);
  const [phoneTouched, setPhoneTouched]     = useState(false);

  // medicines
  const [medicines, setMedicines]           = useState<Medicine[]>([]);
  const [medLoading, setMedLoading]         = useState(false);
  const [showAddModal, setShowAddModal]     = useState(false);
  const [addForm, setAddForm]               = useState(emptyMedicine);
  const [addSaving, setAddSaving]           = useState(false);

  // edit medicine
  const [editMed, setEditMed]               = useState<Medicine | null>(null);
  const [editForm, setEditForm]             = useState({ stock: '', price: '' });
  const [editSaving, setEditSaving]         = useState(false);

  // orders
  const [orders, setOrders]                 = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading]   = useState(false);

  // ── on mount: load profile ──
  useEffect(() => {
    fetchProfile();
  }, []);

  // ── when tab changes, load data ──
  useEffect(() => {
    if (!pharmacy) return;
    if (tab === 'medicines') fetchMedicines();
    if (tab === 'orders') fetchOrders();
  }, [tab, pharmacy]);

  // ── API calls ──────────────────────────────────────
  async function fetchProfile() {
    setProfileLoading(true);
    try {
      const res = await apiClient.get('/api/pharmacy/profile');
      if (res.success) {
        setPharmacy(res.pharmacy);
        fetchMedicines();
      }
    } catch {
      // 404 = no profile yet, that is fine
    } finally {
      setProfileLoading(false);
    }
  }

  async function fetchMedicines() {
    setMedLoading(true);
    try {
      const res = await apiClient.get('/api/pharmacy/medicines');
      if (res.success) setMedicines(res.medicines);
    } catch {
      toast.error('Could not load medicines.');
    } finally {
      setMedLoading(false);
    }
  }

  async function fetchOrders() {
    setOrdersLoading(true);
    try {
      const res = await apiClient.get('/api/pharmacy/orders');
      if (res.success) setOrders(res.orders);
    } catch {
      toast.error('Could not load orders.');
    } finally {
      setOrdersLoading(false);
    }
  }

  // ── profile submit ──
  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPhoneTouched(true);

    // block submit if phone invalid
    if (!isValidPhone(profileForm.phone)) {
      toast.error('Phone must start with 01 and be exactly 11 digits.');
      return;
    }

    setProfileSaving(true);
    try {
      const res = await apiClient.post('/api/pharmacy/setup', profileForm);
      if (res.success) {
        setPharmacy(res.pharmacy);
        setEditingProfile(false);
        setPhoneTouched(false);
        toast.success('Profile saved!');
        fetchMedicines();
      }
    } catch {
      toast.error('Could not save profile.');
    } finally {
      setProfileSaving(false);
    }
  }

  // ── add medicine ──
  async function handleAddMedicine(e: React.FormEvent) {
    e.preventDefault();
    setAddSaving(true);
    try {
      const res = await apiClient.post('/api/medicines', {
        ...addForm,
        stock: Number(addForm.stock),
        price: Number(addForm.price),
      });
      if (res.success) {
        toast.success('Medicine added!');
        setShowAddModal(false);
        setAddForm(emptyMedicine);
        fetchMedicines();
      }
    } catch {
      toast.error('Could not add medicine.');
    } finally {
      setAddSaving(false);
    }
  }

  // ── edit medicine ──
  async function handleEditMedicine(e: React.FormEvent) {
    e.preventDefault();
    if (!editMed) return;
    setEditSaving(true);
    try {
      const res = await apiClient.put(`/api/medicines/${editMed.id}`, {
        stock: Number(editForm.stock),
        price: Number(editForm.price),
      });
      if (res.success) {
        toast.success('Medicine updated!');
        setEditMed(null);
        fetchMedicines();
      }
    } catch {
      toast.error('Could not update medicine.');
    } finally {
      setEditSaving(false);
    }
  }

  // ── delete medicine ──
  async function handleDeleteMedicine(id: number) {
    if (!window.confirm('Delete this medicine?')) return;
    try {
      const res = await apiClient.delete(`/api/medicines/${id}`);
      if (res.success) {
        toast.success('Medicine deleted!');
        fetchMedicines();
      }
    } catch {
      toast.error('Could not delete medicine.');
    }
  }

  // ── phone input change handler ──
  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    // only allow numbers
    const val = e.target.value.replace(/[^0-9]/g, '');
    // max 11 digits
    if (val.length <= 11) {
      setProfileForm({ ...profileForm, phone: val });
    }
  }

  // phone validation state for showing error
  const phoneError = phoneTouched && !isValidPhone(profileForm.phone);

  // ══════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════
  return (
    <>
      {/* Hero */}
      <div className="pd-hero">
        <h1>Pharmacy Dashboard</h1>
        <p>Manage your profile, medicines and incoming orders</p>
      </div>

      <div className="pd-container">

        {/* ── Profile Section ── */}
        {profileLoading ? (
          <div className="pd-card">
            <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#7f8c9a' }}>
              Loading profile...
            </p>
          </div>

        ) : !pharmacy || editingProfile ? (
          <div className="pd-card">
            <h2>{pharmacy ? 'Edit Profile' : '📋 Set Up Your Pharmacy Profile'}</h2>
            <form className="pd-form single-col" onSubmit={handleProfileSubmit}>

              <div className="pd-form-group">
                <label>Pharmacy Name</label>
                <input
                  type="text"
                  placeholder="e.g. Green Cross Pharmacy"
                  value={profileForm.pharmacy_name}
                  onChange={e => setProfileForm({ ...profileForm, pharmacy_name: e.target.value })}
                  required
                />
              </div>

              <div className="pd-form-group">
                <label>Location / Address</label>
                <input
                  type="text"
                  placeholder="e.g. 45 Main Road, Dhaka"
                  value={profileForm.location}
                  onChange={e => setProfileForm({ ...profileForm, location: e.target.value })}
                  required
                />
              </div>

              <div className="pd-form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. 01712345678"
                  value={profileForm.phone}
                  onChange={handlePhoneChange}
                  onBlur={() => setPhoneTouched(true)}
                  maxLength={11}
                  className={phoneError ? 'input-error' : ''}
                  required
                />
                {/* live error hint */}
                {phoneError && (
                  <span className="pd-field-error">
                    Must start with 01 and be exactly 11 digits
                  </span>
                )}
                {/* live success hint */}
                {phoneTouched && isValidPhone(profileForm.phone) && (
                  <span className="pd-field-success">
                    ✓ Valid phone number
                  </span>
                )}
                {/* character counter */}
                <span className="pd-field-hint">
                  {profileForm.phone.length}/11 digits
                </span>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  className="pd-btn-primary"
                  type="submit"
                  disabled={profileSaving}
                >
                  {profileSaving ? 'Saving...' : 'Save Profile'}
                </button>
                {editingProfile && (
                  <button
                    type="button"
                    className="pd-btn-cancel"
                    onClick={() => {
                      setEditingProfile(false);
                      setPhoneTouched(false);
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

        ) : (
          <div className="pd-card">
            <div className="pd-section-header">
              <h2>🏥 {pharmacy.pharmacy_name}</h2>
              <button
                className="pd-edit-btn"
                onClick={() => {
                  setProfileForm({
                    pharmacy_name: pharmacy.pharmacy_name,
                    location: pharmacy.location,
                    phone: pharmacy.phone,
                  });
                  setPhoneTouched(false);
                  setEditingProfile(true);
                }}
              >
                Edit Profile
              </button>
            </div>
            <div className="pd-profile-grid">
              <div className="pd-profile-item">
                <label>Location</label>
                <span>{pharmacy.location}</span>
              </div>
              <div className="pd-profile-item">
                <label>Phone</label>
                <span>{pharmacy.phone}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Tabs + Content (only when profile exists) ── */}
        {pharmacy && !editingProfile && (
          <>
            <div className="pd-tabs">
              <button
                className={`pd-tab ${tab === 'medicines' ? 'active' : ''}`}
                onClick={() => setTab('medicines')}
              >
                💊 Medicines
              </button>
              <button
                className={`pd-tab ${tab === 'orders' ? 'active' : ''}`}
                onClick={() => setTab('orders')}
              >
                📦 Orders
              </button>
            </div>

            {/* ══ MEDICINES TAB ══ */}
            {tab === 'medicines' && (
              <div className="pd-card">
                <div className="pd-section-header">
                  <h2>Medicine Inventory</h2>
                  <button className="pd-btn-primary" onClick={() => setShowAddModal(true)}>
                    + Add Medicine
                  </button>
                </div>

                {medLoading ? (
                  <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#7f8c9a' }}>
                    Loading medicines...
                  </p>
                ) : medicines.length === 0 ? (
                  <div className="pd-empty">
                    <div className="pd-empty-icon">💊</div>
                    <p>No medicines yet. Click Add Medicine to get started!</p>
                  </div>
                ) : (
                  <div className="pd-table-wrap">
                    <table className="pd-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Generic Name</th>
                          <th>Category</th>
                          <th>Stock</th>
                          <th>Price (৳)</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {medicines.map(med => (
                          <tr key={med.id}>
                            <td><strong>{med.name}</strong></td>
                            <td style={{ color: '#5f7a8a' }}>{med.generic_name}</td>
                            <td>{med.category}</td>
                            <td>{med.stock}</td>
                            <td>৳{Number(med.price).toFixed(2)}</td>
                            <td>
                              <button
                                className="pd-btn-edit"
                                onClick={() => {
                                  setEditMed(med);
                                  setEditForm({
                                    stock: String(med.stock),
                                    price: String(med.price),
                                  });
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="pd-btn-danger"
                                onClick={() => handleDeleteMedicine(med.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ══ ORDERS TAB ══ */}
            {tab === 'orders' && (
              <div className="pd-card">
                <h2>Incoming Orders</h2>
                {ordersLoading ? (
                  <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#7f8c9a' }}>
                    Loading orders...
                  </p>
                ) : orders.length === 0 ? (
                  <div className="pd-empty">
                    <div className="pd-empty-icon">📦</div>
                    <p>No orders yet.</p>
                  </div>
                ) : (
                  <div className="pd-table-wrap">
                    <table className="pd-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Customer</th>
                          <th>Total</th>
                          <th>Delivery</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => (
                          <tr key={order.id}>
                            <td>#{order.id}</td>
                            <td>
                              <strong>{order.customer_name}</strong>
                              <br />
                              <span style={{ fontSize: '0.8rem', color: '#7f8c9a' }}>
                                {order.customer_email}
                              </span>
                            </td>
                            <td>৳{Number(order.total_price).toFixed(2)}</td>
                            <td style={{ textTransform: 'capitalize' }}>{order.delivery_type}</td>
                            <td>
                              <span className={`pd-badge ${order.status}`}>
                                {order.status}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.85rem', color: '#7f8c9a' }}>
                              {new Date(order.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ══ ADD MEDICINE MODAL ══ */}
      {showAddModal && (
        <div className="pd-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="pd-modal" onClick={e => e.stopPropagation()}>
            <h3>Add New Medicine</h3>
            <form className="pd-form" onSubmit={handleAddMedicine}>
              <div className="pd-form-group">
                <label>Medicine Name</label>
                <input
                  type="text" placeholder="e.g. Napa"
                  value={addForm.name}
                  onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="pd-form-group">
                <label>Generic Name</label>
                <input
                  type="text" placeholder="e.g. Paracetamol"
                  value={addForm.generic_name}
                  onChange={e => setAddForm({ ...addForm, generic_name: e.target.value })}
                  required
                />
              </div>
              <div className="pd-form-group">
                <label>Company</label>
                <input
                  type="text" placeholder="e.g. Beximco"
                  value={addForm.company}
                  onChange={e => setAddForm({ ...addForm, company: e.target.value })}
                  required
                />
              </div>
              <div className="pd-form-group">
                <label>Category</label>
                <input
                  type="text" placeholder="e.g. Analgesic"
                  value={addForm.category}
                  onChange={e => setAddForm({ ...addForm, category: e.target.value })}
                  required
                />
              </div>
              <div className="pd-form-group">
                <label>Stock</label>
                <input
                  type="number" min="0" placeholder="e.g. 100"
                  value={addForm.stock}
                  onChange={e => setAddForm({ ...addForm, stock: e.target.value })}
                  required
                />
              </div>
              <div className="pd-form-group">
                <label>Price (৳)</label>
                <input
                  type="number" min="0" step="0.01" placeholder="e.g. 12.50"
                  value={addForm.price}
                  onChange={e => setAddForm({ ...addForm, price: e.target.value })}
                  required
                />
              </div>
              <div className="pd-modal-actions pd-form-group full-width">
                <button type="button" className="pd-btn-cancel" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="pd-btn-primary" disabled={addSaving}>
                  {addSaving ? 'Adding...' : 'Add Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ EDIT MEDICINE MODAL ══ */}
      {editMed && (
        <div className="pd-modal-overlay" onClick={() => setEditMed(null)}>
          <div className="pd-modal" onClick={e => e.stopPropagation()}>
            <h3>Edit — {editMed.name}</h3>
            <form className="pd-form" onSubmit={handleEditMedicine}>
              <div className="pd-form-group">
                <label>Stock</label>
                <input
                  type="number" min="0"
                  value={editForm.stock}
                  onChange={e => setEditForm({ ...editForm, stock: e.target.value })}
                  required
                />
              </div>
              <div className="pd-form-group">
                <label>Price (৳)</label>
                <input
                  type="number" min="0" step="0.01"
                  value={editForm.price}
                  onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                  required
                />
              </div>
              <div className="pd-modal-actions pd-form-group full-width">
                <button type="button" className="pd-btn-cancel" onClick={() => setEditMed(null)}>
                  Cancel
                </button>
                <button type="submit" className="pd-btn-primary" disabled={editSaving}>
                  {editSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}