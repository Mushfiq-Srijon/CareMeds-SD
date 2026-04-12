import { useEffect, useState } from 'react';
import ApiClient from '../../api';
import toast from 'react-hot-toast';

const apiClient = new ApiClient();

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  email_verified_at: string | null;
  created_at: string;
}

export default function AdminUsers() {
  const [users, setUsers]     = useState<User[]>([]);
  const [search, setSearch]   = useState('');
  const [role, setRole]       = useState('');
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const perPage = 15;

  const fetchUsers = (s: string, r: string, p: number) => {
    setLoading(true);
    apiClient.getAdminUsers(s, r, p)
      .then(res => {
        if (res.success) {
          setUsers(res.users);
          setTotal(res.total);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers('', '', 1); }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
    fetchUsers(e.target.value, role, 1);
  };

  const handleRole = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value);
    setPage(1);
    fetchUsers(search, e.target.value, 1);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this user?')) return;
    try {
      await apiClient.deleteAdminUser(id);
      toast.success('User deleted');
      fetchUsers(search, role, page);
    } catch {
      toast.error('Could not delete user');
    }
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <>
      <div className="admin-page-header">
        <h2 className="admin-page-title">Users</h2>
        <p className="admin-page-subtitle">Manage all registered accounts · {total} total</p>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">All Users</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <select className="admin-select" value={role} onChange={handleRole}>
              <option value="">All Roles</option>
              <option value="customer">Customer</option>
              <option value="pharmacy">Pharmacy</option>
              <option value="admin">Admin</option>
            </select>
            <input
              className="admin-search-input"
              placeholder="Search name or email…"
              value={search}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="admin-table-wrap">
          {loading ? (
            <div className="admin-loading">Loading…</div>
          ) : users.length === 0 ? (
            <div className="admin-empty">No users found.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Verified</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td className="admin-td-name">{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`admin-badge ${
                        u.role === 'admin'    ? 'badge-red'    :
                        u.role === 'pharmacy' ? 'badge-blue'   : 'badge-green'
                      }`}>{u.role}</span>
                    </td>
                    <td>
                      <span className={`admin-badge ${u.email_verified_at ? 'badge-green' : 'badge-yellow'}`}>
                        {u.email_verified_at ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="admin-btn admin-btn-danger"
                        onClick={() => handleDelete(u.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="admin-pagination">
            <button
              className="admin-btn admin-btn-ghost"
              disabled={page === 1}
              onClick={() => { setPage(p => p - 1); fetchUsers(search, role, page - 1); }}
            >← Prev</button>
            <span>Page {page} of {totalPages}</span>
            <button
              className="admin-btn admin-btn-ghost"
              disabled={page === totalPages}
              onClick={() => { setPage(p => p + 1); fetchUsers(search, role, page + 1); }}
            >Next →</button>
          </div>
        )}
      </div>
    </>
  );
}