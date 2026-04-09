import { useEffect, useState } from 'react';
import ApiClient from '../api';
import '../styles/MyOrders.css';

const apiClient = new ApiClient();

interface Order {
  id: number;
  medicine_names: string;
  total_price: number;
  delivery_charge: number;
  delivery_type: string;
  status: string;
  name: string;
  phone: string;
  address: string;
  created_at: string;
  consignment_id: string | null;
}

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'previous'>('pending');

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      const data = await apiClient.getMyOrders();
      setOrders(Array.isArray(data) ? data : data.data ?? []);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  }

  const pendingOrders = orders.filter((o) => o.status === 'pending');

  const previousOrders = orders.filter(
    (o) =>
      o.status === 'confirmed' ||
      o.status === 'assigned' ||
      o.status === 'delivered' ||
      o.status === 'completed'
  );

  const displayed = activeTab === 'pending' ? pendingOrders : previousOrders;

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  function getStatusClass(status: string) {
    switch (status) {
      case 'pending':   return 'badge badge-pending';
      case 'confirmed': return 'badge badge-confirmed';
      case 'assigned':  return 'badge badge-assigned';
      case 'delivered': return 'badge badge-delivered';
      case 'completed': return 'badge badge-completed';
      default:          return 'badge';
    }
  }

  return (
    <div className="myorders-page">

      <div className="myorders-hero">
        <div className="myorders-hero-overlay" />
        <div className="myorders-hero-content">
          <h1>My Orders</h1>
          <p>Track your current and past medicine orders</p>
        </div>
      </div>

      <div className="myorders-body">

        <div className="myorders-tabs">
          <button
            className={`tab-btn ${activeTab === 'pending' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            🕐 Pending Orders
            {pendingOrders.length > 0 && (
              <span className="tab-count">{pendingOrders.length}</span>
            )}
          </button>
          <button
            className={`tab-btn ${activeTab === 'previous' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('previous')}
          >
            ✅ Previous Orders
            {previousOrders.length > 0 && (
              <span className="tab-count">{previousOrders.length}</span>
            )}
          </button>
        </div>

        {loading ? (
          <div className="myorders-loading">
            <div className="spinner" />
            <p>Loading your orders…</p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="myorders-empty">
            <span className="empty-icon">
              {activeTab === 'pending' ? '📭' : '🗂️'}
            </span>
            <p>
              {activeTab === 'pending'
                ? 'No pending orders right now.'
                : 'No previous orders yet.'}
            </p>
          </div>
        ) : (
          <div className="orders-grid">
            {displayed.map((order) => (
              <div key={order.id} className="order-card">

                <div className="order-card-header">
                  <span className="order-id">Order #{order.id}</span>
                  <span className={getStatusClass(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>

                <div className="order-medicines">
                  <span className="label">💊 Medicines</span>
                  <span className="value">{order.medicine_names}</span>
                </div>

                <div className="order-meta-row">
                  <div className="order-meta-item">
                    <span className="label">🚚 Delivery</span>
                    <span className="value capitalize">{order.delivery_type}</span>
                  </div>
                  <div className="order-meta-item">
                    <span className="label">📅 Date</span>
                    <span className="value">{formatDate(order.created_at)}</span>
                  </div>
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    <span className="label">Total</span>
                    <span className="total-price">
                      ৳{Number(order.total_price).toFixed(2)}
                    </span>
                  </div>
                  {order.address && (
                    <div className="order-address">
                      📍 {order.address}
                    </div>
                  )}
                  {order.consignment_id && (
                    <div className="order-tracking">
                      <span className="label">🚚 Tracking ID</span>
                      <a
                        className="tracking-link"
                        href={`https://steadfast.com.bd/t/${order.consignment_id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {order.consignment_id}
                      </a>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}