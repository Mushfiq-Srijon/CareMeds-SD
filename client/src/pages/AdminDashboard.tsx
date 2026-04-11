import { useState, useEffect } from 'react';
import ApiClient from '../api';
import '../styles/AdminDashboard.css';
import AdminUsers from './admin/AdminUsers';
import AdminPharmacies from './admin/AdminPharmacies';

const apiClient = new ApiClient();

type Section = 'overview' | 'users' | 'pharmacies';

interface Stats {
  total_customers: number;
  total_pharmacies: number;
  total_orders: number;
  pending_orders: number;
  total_medicines: number;
  total_revenue: number;
}

export default function AdminDashboard() {
  const [section, setSection] = useState<Section>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.getAdminStats()
      .then(r => {
        if (r.success) setStats(r.stats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const navItems: { key: Section; label: string; icon: string }[] = [
    { key: 'overview',   label: 'Overview',   icon: '📊' },
    { key: 'users',      label: 'Users',      icon: '👥' },
    { key: 'pharmacies', label: 'Pharmacies', icon: '🏥' },
  ];

  const statCards = [
    { label: 'Total Customers',  value: stats?.total_customers  ?? '—', icon: '👤', color: 'blue'   },
    { label: 'Total Pharmacies', value: stats?.total_pharmacies ?? '—', icon: '🏥', color: 'green'  },
    { label: 'Total Medicines',  value: stats?.total_medicines  ?? '—', icon: '💊', color: 'purple' },
    { label: 'Total Orders',     value: stats?.total_orders     ?? '—', icon: '📦', color: 'orange' },
    { label: 'Pending Orders',   value: stats?.pending_orders   ?? '—', icon: '🕐', color: 'yellow' },
    {
      label: 'Total Revenue',
      value: stats ? `৳${Number(stats.total_revenue).toLocaleString()}` : '—',
      icon: '💰',
      color: 'teal'
    },
  ];

  return (
    <div className="admin-root">

      {/* Hero */}
      <div className="admin-hero">
        <div className="admin-hero-inner">
          <span className="admin-eyebrow">CareMeds Admin</span>
          <h1 className="admin-hero-title">Admin Dashboard</h1>
          <p className="admin-hero-sub">Platform overview and management</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs-bar">
        {navItems.map(item => (
          <button
            key={item.key}
            className={`admin-tab-btn ${section === item.key ? 'active' : ''}`}
            onClick={() => setSection(item.key)}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <main className="admin-main">

        {section === 'overview' && (
          <>
            <div className="admin-page-header">
              <h2 className="admin-page-title">Platform Overview</h2>
              <p className="admin-page-subtitle">Live stats across all users, pharmacies and orders</p>
            </div>

            {loading ? (
              <div className="admin-loading">Loading stats…</div>
            ) : (
              <div className="admin-stats-grid">
                {statCards.map(s => (
                  <div className={`admin-stat-card admin-stat-${s.color}`} key={s.label}>
                    <div className="admin-stat-icon">{s.icon}</div>
                    <div className="admin-stat-value">{s.value}</div>
                    <div className="admin-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {section === 'users'      && <AdminUsers />}
        {section === 'pharmacies' && <AdminPharmacies />}

      </main>
    </div>
  );
}