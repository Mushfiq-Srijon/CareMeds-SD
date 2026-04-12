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

type TabType = 'pending' | 'ongoing' | 'completed';

export default function MyOrders() {
  const [orders, setOrders]       = useState<Order[]>([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('pending');

  useEffect(() => { fetchOrders(); }, []);

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

  const pendingOrders   = orders.filter(o => o.status === 'pending');
  const ongoingOrders   = orders.filter(o => o.status === 'confirmed' || o.status === 'assigned');
  const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'completed');

  const displayed =
    activeTab === 'pending'   ? pendingOrders   :
    activeTab === 'ongoing'   ? ongoingOrders   :
    completedOrders;

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
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

  function getStatusLabel(status: string) {
    switch (status) {
      case 'pending':   return '🕐 Pending';
      case 'confirmed': return '✅ Confirmed';
      case 'assigned':  return '🚴 On the Way';
      case 'delivered': return '📦 Delivered';
      case 'completed': return '✅ Completed';
      default:          return status;
    }
  }

  const emptyMessages = {
    pending:   { icon: '📭', text: 'No pending orders right now.' },
    ongoing:   { icon: '🚴', text: 'No ongoing orders right now.' },
    completed: { icon: '🗂️', text: 'No completed orders yet.' },
  };

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
            🕐 Pending
            {pendingOrders.length > 0 && (
              <span className="tab-count">{pendingOrders.length}</span>
            )}
          </button>
          <button
            className={`tab-btn ${activeTab === 'ongoing' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('ongoing')}
          >
            🚴 Ongoing
            {ongoingOrders.length > 0 && (
              <span className="tab-count">{ongoingOrders.length}</span>
            )}
          </button>
          <button
            className={`tab-btn ${activeTab === 'completed' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            ✅ Completed
            {completedOrders.length > 0 && (
              <span className="tab-count">{completedOrders.length}</span>
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
            <span className="empty-icon">{emptyMessages[activeTab].icon}</span>
            <p>{emptyMessages[activeTab].text}</p>
          </div>
        ) : (
          <div className="orders-grid">
            {displayed.map((order) => (
              <div key={order.id} className="order-card">

                <div className="order-card-header">
                  <span className="order-id">Order #{order.id}</span>
                  <span className={getStatusClass(order.status)}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                <div className="order-medicines">
                  <span className="label">💊 Medicines</span>
                  <div className="medicine-pills">
                    {order.medicine_names
                      ? order.medicine_names.split(',').map((name, i) => (
                          <span key={i} className="medicine-pill">
                            {name.trim()}
                          </span>
                        ))
                      : <span className="value">—</span>
                    }
                  </div>
                </div>

                <div className="order-meta-row">
                  <div className="order-meta-item">
                    <span className="label">🚚 Delivery</span>
                    <span className="value capitalize">
                      {order.delivery_type === 'home_delivery' ? 'Home Delivery' : 'Pickup'}
                    </span>
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
                    <div className="order-address">📍 {order.address}</div>
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