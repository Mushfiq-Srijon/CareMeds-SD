import { useEffect, useState } from 'react';
import ApiClient from '../api';
import { toast } from 'react-hot-toast';
import '../styles/PharmacyDashboard.css';
import { BD_DIVISIONS } from '../data/divisions';

const apiClient = new ApiClient();

interface Pharmacy {
  id: number;
  pharmacy_name: string;
  division: string;
  city: string;
  area: string;
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
  medicine_names: string;
  total_price: number;
  delivery_charge: number;
  delivery_type: string;
  status: string;
  payment_type: string;
  payment_status: string;
  consignment_id: string | null;
  address: string;
  phone: string;
  created_at: string;
}

const emptyProfile = { pharmacy_name: '', division: '', city: '', area: '', phone: '' };
const emptyMedicine = {
  name: '', generic_name: '', company: '',
  category: '', stock: '', price: ''
};

const isValidPhone = (phone: string) => /^01[0-9]{9}$/.test(phone);

export default function PharmacyDashboard() {

  const [tab, setTab] = useState<'medicines' | 'orders'>('medicines');

  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(emptyProfile);
  const [profileSaving, setProfileSaving] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [medLoading, setMedLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState(emptyMedicine);
  const [addSaving, setAddSaving] = useState(false);
  const [editMed, setEditMed] = useState<Medicine | null>(null);
  const [editForm, setEditForm] = useState({ stock: '', price: '' });
  const [editSaving, setEditSaving] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => { fetchProfile(); }, []);

  useEffect(() => {
    if (!pharmacy) return;
    if (tab === 'medicines') fetchMedicines();
    if (tab === 'orders') fetchOrders();
  }, [tab, pharmacy]);

  async function fetchProfile() {
    setProfileLoading(true);
    try {
      const res = await apiClient.get('/api/pharmacy/profile');
      if (res.success) {
        setPharmacy(res.pharmacy);
        fetchMedicines();
      }
    } catch {
      // no profile yet
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
      else if (Array.isArray(res)) setOrders(res);
      else if (res.orders) setOrders(res.orders);
    } catch {
      toast.error('Could not load orders.');
    } finally {
      setOrdersLoading(false);
    }
  }

  async function handleUpdateStatus(orderId: number, newStatus: string) {
    setUpdatingOrderId(orderId);
    try {
      const res = await apiClient.put(
        `/api/pharmacy/orders/${orderId}/status`,
        { status: newStatus }
      );
      if (res.success) {
        toast.success(`Order #${orderId} marked as ${newStatus}!`);
        setOrders(prev =>
          prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } catch {
      toast.error('Could not update order status.');
    } finally {
      setUpdatingOrderId(null);
    }
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPhoneTouched(true);
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

  async function handleDispatch(orderId: number) {
    setUpdatingOrderId(orderId);
    try {
      const res = await apiClient.post(`/api/pharmacy/orders/${orderId}/dispatch`, {});
      if (res.success) {
        toast.success(`Dispatched! Tracking ID: ${res.consignment_id}`);
        setOrders(prev =>
          prev.map(o => o.id === orderId
            ? { ...o, status: 'confirmed', consignment_id: res.consignment_id }
            : o
          )
        );
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => prev
            ? { ...prev, status: 'confirmed', consignment_id: res.consignment_id }
            : prev
          );
        }
      }
    } catch {
      toast.error('Failed to dispatch order.');
    } finally {
      setUpdatingOrderId(null);
    }
  }

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

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= 11) {
      setProfileForm({ ...profileForm, phone: val });
    }
  }

  const phoneError = phoneTouched && !isValidPhone(profileForm.phone);

  function getStatusClass(status: string) {
    switch (status) {
      case 'pending': return 'pd-badge pending';
      case 'confirmed': return 'pd-badge confirmed';
      case 'assigned': return 'pd-badge assigned';
      case 'delivered': return 'pd-badge delivered';
      case 'completed': return 'pd-badge completed';
      default: return 'pd-badge';
    }
  }

  function getPaymentBadge(paymentType: string, paymentStatus: string) {
    if (paymentType === 'cod') {
      return (
        <span style={{
          background: '#fff8e1', color: '#b8860b',
          border: '1.5px solid #f0c040',
          borderRadius: 6, padding: '2px 10px',
          fontSize: '0.78rem', fontWeight: 700,
        }}>
          💵 COD
        </span>
      );
    }
    if (paymentType === 'stripe') {
      if (paymentStatus === 'paid') {
        return (
          <span style={{
            background: '#e8f8f0', color: '#1a7f64',
            border: '1.5px solid #27ae60',
            borderRadius: 6, padding: '2px 10px',
            fontSize: '0.78rem', fontWeight: 700,
          }}>
            ✅ Paid Online
          </span>
        );
      }
      return (
        <span style={{
          background: '#fdecea', color: '#c0392b',
          border: '1.5px solid #e74c3c',
          borderRadius: 6, padding: '2px 10px',
          fontSize: '0.78rem', fontWeight: 700,
        }}>
          ❌ Payment Pending
        </span>
      );
    }
    return null;
  }

  // ── Order Detail View ──
  function OrderDetail({ order }: { order: Order }) {
    return (
      <div>
        <div className="pd-order-header" style={{ marginBottom: 16 }}>
          <span className="pd-order-id" style={{ fontSize: '1.2rem' }}>
            Order #{order.id}
          </span>
          <span className={getStatusClass(order.status)}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
          {getPaymentBadge(order.payment_type, order.payment_status)}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div className="pd-order-row">
            <span className="pd-order-label">💊 Medicines</span>
            <span className="pd-order-value" style={{ color: '#1a6fa8', fontWeight: 600 }}>
              {order.medicine_names
                ? order.medicine_names.split(',').map((name, i) => (
                  <span key={i} style={{
                    display: 'inline-block',
                    background: '#eaf4fb',
                    color: '#0d3b6e',
                    borderRadius: 6,
                    padding: '2px 10px',
                    margin: '2px 4px 2px 0',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}>
                    {name.trim()}
                  </span>
                ))
                : '—'}
            </span>
          </div>
          <div className="pd-order-row">
            <span className="pd-order-label">👤 Customer</span>
            <span className="pd-order-value">{order.customer_name}</span>
          </div>
          <div className="pd-order-row">
            <span className="pd-order-label">✉️ Email</span>
            <span className="pd-order-value">{order.customer_email}</span>
          </div>
          <div className="pd-order-row">
            <span className="pd-order-label">📞 Phone</span>
            <span className="pd-order-value">{order.phone || '—'}</span>
          </div>
          <div className="pd-order-row">
            <span className="pd-order-label">📍 Address</span>
            <span className="pd-order-value">{order.address || '—'}</span>
          </div>
          <div className="pd-order-row">
            <span className="pd-order-label">🚚 Delivery</span>
            <span className="pd-order-value" style={{ textTransform: 'capitalize' }}>
              {order.delivery_type === 'home_delivery' ? 'Home Delivery' : 'Pickup'}
            </span>
          </div>
          <div className="pd-order-row">
            <span className="pd-order-label">📦 Del. Charge</span>
            <span className="pd-order-value">৳{Number(order.delivery_charge).toFixed(2)}</span>
          </div>
          <div className="pd-order-row">
            <span className="pd-order-label">💰 Total</span>
            <span className="pd-order-value"
              style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0a2342' }}>
              ৳{Number(order.total_price).toFixed(2)}
            </span>
          </div>
          <div className="pd-order-row">
            <span className="pd-order-label">💳 Payment</span>
            <span className="pd-order-value">
              {getPaymentBadge(order.payment_type, order.payment_status)}
            </span>
          </div>
          <div className="pd-order-row">
            <span className="pd-order-label">📅 Date</span>
            <span className="pd-order-value">
              {new Date(new Date(order.created_at).getTime() + 6 * 60 * 60 * 1000).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="pd-order-actions" style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {order.status === 'pending' && order.delivery_type === 'home_delivery' && (
            <button
              className="pd-btn-confirm"
              disabled={updatingOrderId === order.id}
              onClick={() => handleDispatch(order.id)}
            >
              {updatingOrderId === order.id ? 'Dispatching...' : '🚚 Confirm & Dispatch via Steadfast'}
            </button>
          )}
          {order.status === 'pending' && order.delivery_type === 'pickup' && (
            <button
              className="pd-btn-confirm"
              disabled={updatingOrderId === order.id}
              onClick={() => handleUpdateStatus(order.id, 'confirmed')}
            >
              {updatingOrderId === order.id ? 'Updating...' : '✅ Confirm Order'}
            </button>
          )}
          {order.status === 'confirmed' && (
            <button
              className="pd-btn-confirm"
              disabled={updatingOrderId === order.id}
              onClick={() => handleUpdateStatus(order.id, 'delivered')}
            >
              {updatingOrderId === order.id ? 'Updating...' : '📦 Mark as Delivered'}
            </button>
          )}
          {order.status === 'delivered' && (
            <button
              className="pd-btn-confirm"
              disabled={updatingOrderId === order.id}
              onClick={() => handleUpdateStatus(order.id, 'completed')}
            >
              {updatingOrderId === order.id ? 'Updating...' : '✅ Mark as Completed'}
            </button>
          )}
          {order.consignment_id && (
            <div style={{
              background: '#e8f8f5', border: '1.5px solid #27ae60',
              borderRadius: 10, padding: '10px 16px', fontSize: 13
            }}>
              <span style={{ color: '#1a7f64', fontWeight: 600 }}>📦 Tracking ID: </span>
              <span style={{ color: '#0a2342', fontWeight: 700 }}>{order.consignment_id}</span>
            </div>
          )}
          {order.status === 'completed' && (
            <span className="pd-delivered-text">✅ Order Completed</span>
          )}
        </div>
      </div>
    );
  }

  // ── Order List View ──
  function OrderList({ orders: orderList }: { orders: Order[] }) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8 }}>
        {orderList.map((order, index) => (
          <div
            key={order.id}
            onClick={() => setSelectedOrder(order)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              background: '#f8fbff',
              border: '1.5px solid #d0dce8',
              borderRadius: 12,
              cursor: 'pointer',
              transition: 'box-shadow 0.2s, border-color 0.2s',
              fontFamily: "'DM Sans', sans-serif",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(10,35,66,0.12)';
              (e.currentTarget as HTMLDivElement).style.borderColor = '#5dade2';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
              (e.currentTarget as HTMLDivElement).style.borderColor = '#d0dce8';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{
                width: 32, height: 32, flexShrink: 0,
                background: '#0d3b6e', color: '#fff',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.85rem',
              }}>
                {index + 1}
              </span>
              <div>
                <div style={{ fontWeight: 700, color: '#0a2342', fontSize: '0.95rem' }}>
                  Order #{order.id}
                  <span style={{ fontWeight: 400, color: '#7f8c9a', fontSize: '0.82rem', marginLeft: 8 }}>
                    {order.customer_name}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#1a6fa8', marginTop: 3 }}>
                  💊 {order.medicine_names || '—'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0a2342' }}>
                ৳{Number(order.total_price).toFixed(2)}
              </span>
              <span className={getStatusClass(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
              <span style={{ color: '#7f8c9a', fontSize: '1.2rem' }}>›</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
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
                  type="text" placeholder="e.g. Green Cross Pharmacy"
                  value={profileForm.pharmacy_name}
                  onChange={e => setProfileForm({ ...profileForm, pharmacy_name: e.target.value })}
                  required
                />
              </div>

              <div className="pd-form-group">
                <label>Division</label>
                <select
                  value={profileForm.division}
                  onChange={e => setProfileForm({ ...profileForm, division: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #d5dde6', fontSize: '14px', color: '#0a2342', outline: 'none' }}
                >
                  <option value="">Select Division</option>
                  {BD_DIVISIONS.map(div => (
                    <option key={div} value={div}>{div}</option>
                  ))}
                </select>
              </div>

              <div className="pd-form-group">
                <label>City / District</label>
                <input
                  type="text" placeholder="e.g. Mirpur, Dhaka"
                  value={profileForm.city}
                  onChange={e => setProfileForm({ ...profileForm, city: e.target.value })}
                  required
                />
              </div>

              <div className="pd-form-group">
                <label>Area & Address</label>
                <input
                  type="text" placeholder="e.g. House 12, Road 4, Mirpur-10"
                  value={profileForm.area}
                  onChange={e => setProfileForm({ ...profileForm, area: e.target.value })}
                  required
                />
              </div>

              <div className="pd-form-group">
                <label>Phone Number</label>
                <input
                  type="text" placeholder="e.g. 01712345678"
                  value={profileForm.phone}
                  onChange={handlePhoneChange}
                  onBlur={() => setPhoneTouched(true)}
                  maxLength={11}
                  className={phoneError ? 'input-error' : ''}
                  required
                />
                {phoneError && <span className="pd-field-error">Must start with 01 and be exactly 11 digits</span>}
                {phoneTouched && isValidPhone(profileForm.phone) && <span className="pd-field-success">✓ Valid</span>}
                <span className="pd-field-hint">{profileForm.phone.length}/11 digits</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button className="pd-btn-primary" type="submit" disabled={profileSaving}>
                  {profileSaving ? 'Saving...' : 'Save Profile'}
                </button>
                {editingProfile && (
                  <button type="button" className="pd-btn-cancel"
                    onClick={() => { setEditingProfile(false); setPhoneTouched(false); }}>
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
              <button className="pd-edit-btn" onClick={() => {
                setProfileForm({
                  pharmacy_name: pharmacy.pharmacy_name,
                  division: pharmacy.division,
                  city: pharmacy.city,
                  area: pharmacy.area,
                  phone: pharmacy.phone,
                });
                setPhoneTouched(false);
                setEditingProfile(true);
              }}>
                Edit Profile
              </button>
            </div>
            <div className="pd-profile-grid">
              <div className="pd-profile-item">
                <label>Division</label>
                <span>{pharmacy.division}</span>
              </div>
              <div className="pd-profile-item">
                <label>City</label>
                <span>{pharmacy.city}</span>
              </div>
              <div className="pd-profile-item">
                <label>Area & Address</label>
                <span>{pharmacy.area}</span>
              </div>
              <div className="pd-profile-item">
                <label>Phone</label>
                <span>{pharmacy.phone}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Tabs ── */}
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
                onClick={() => { setTab('orders'); setSelectedOrder(null); }}
              >
                📦 Orders
                {orders.filter(o => o.status === 'pending').length > 0 && (
                  <span className="pd-tab-count">
                    {orders.filter(o => o.status === 'pending').length}
                  </span>
                )}
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
                              <button className="pd-btn-edit" onClick={() => {
                                setEditMed(med);
                                setEditForm({ stock: String(med.stock), price: String(med.price) });
                              }}>
                                Edit
                              </button>
                              <button className="pd-btn-danger"
                                onClick={() => handleDeleteMedicine(med.id)}>
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
                <div className="pd-section-header" style={{ marginBottom: 20 }}>
                  <h2>
                    {selectedOrder
                      ? `Order #${selectedOrder.id} — Details`
                      : 'Incoming Orders'}
                  </h2>
                  {selectedOrder && (
                    <button className="pd-btn-cancel" onClick={() => setSelectedOrder(null)}>
                      ← All Orders
                    </button>
                  )}
                </div>

                {ordersLoading ? (
                  <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#7f8c9a' }}>
                    Loading orders...
                  </p>
                ) : orders.length === 0 ? (
                  <div className="pd-empty">
                    <div className="pd-empty-icon">📦</div>
                    <p>No orders yet.</p>
                  </div>
                ) : selectedOrder ? (
                  <OrderDetail order={selectedOrder} />
                ) : (
                  <>
                    {orders.filter(o => o.status === 'pending').length > 0 && (
                      <div className="pd-orders-section">
                        <div className="pd-orders-section-title pending-title">
                          🕐 Pending
                          <span className="pd-orders-section-count">
                            {orders.filter(o => o.status === 'pending').length}
                          </span>
                        </div>
                        <OrderList orders={orders.filter(o => o.status === 'pending')} />
                      </div>
                    )}
                    {orders.filter(o => o.status === 'confirmed' || o.status === 'assigned').length > 0 && (
                      <div className="pd-orders-section">
                        <div className="pd-orders-section-title ongoing-title">
                          🚴 Ongoing
                          <span className="pd-orders-section-count">
                            {orders.filter(o => o.status === 'confirmed' || o.status === 'assigned').length}
                          </span>
                        </div>
                        <OrderList orders={orders.filter(o => o.status === 'confirmed' || o.status === 'assigned')} />
                      </div>
                    )}
                    {orders.filter(o => o.status === 'delivered' || o.status === 'completed').length > 0 && (
                      <div className="pd-orders-section">
                        <div className="pd-orders-section-title completed-title">
                          ✅ Completed
                          <span className="pd-orders-section-count">
                            {orders.filter(o => o.status === 'delivered' || o.status === 'completed').length}
                          </span>
                        </div>
                        <OrderList orders={orders.filter(o => o.status === 'delivered' || o.status === 'completed')} />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}

      </div>{/* end pd-container */}

      {/* ══ ADD MEDICINE MODAL ══ */}
      {showAddModal && (
        <div className="pd-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="pd-modal" onClick={e => e.stopPropagation()}>
            <h3>Add New Medicine</h3>
            <form className="pd-form" onSubmit={handleAddMedicine}>
              <div className="pd-form-group">
                <label>Medicine Name</label>
                <input type="text" placeholder="e.g. Napa"
                  value={addForm.name}
                  onChange={e => setAddForm({ ...addForm, name: e.target.value })} required />
              </div>
              <div className="pd-form-group">
                <label>Generic Name</label>
                <input type="text" placeholder="e.g. Paracetamol"
                  value={addForm.generic_name}
                  onChange={e => setAddForm({ ...addForm, generic_name: e.target.value })} required />
              </div>
              <div className="pd-form-group">
                <label>Company</label>
                <input type="text" placeholder="e.g. Beximco"
                  value={addForm.company}
                  onChange={e => setAddForm({ ...addForm, company: e.target.value })} required />
              </div>
              <div className="pd-form-group">
                <label>Category</label>
                <input type="text" placeholder="e.g. Analgesic"
                  value={addForm.category}
                  onChange={e => setAddForm({ ...addForm, category: e.target.value })} required />
              </div>
              <div className="pd-form-group">
                <label>Stock</label>
                <input type="number" min="0" placeholder="e.g. 100"
                  value={addForm.stock}
                  onChange={e => setAddForm({ ...addForm, stock: e.target.value })} required />
              </div>
              <div className="pd-form-group">
                <label>Price (৳)</label>
                <input type="number" min="0" step="0.01" placeholder="e.g. 12.50"
                  value={addForm.price}
                  onChange={e => setAddForm({ ...addForm, price: e.target.value })} required />
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
                <input type="number" min="0"
                  value={editForm.stock}
                  onChange={e => setEditForm({ ...editForm, stock: e.target.value })} required />
              </div>
              <div className="pd-form-group">
                <label>Price (৳)</label>
                <input type="number" min="0" step="0.01"
                  value={editForm.price}
                  onChange={e => setEditForm({ ...editForm, price: e.target.value })} required />
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