import { useEffect, useState } from 'react';
import ApiClient from '../../api';
import toast from 'react-hot-toast';

const apiClient = new ApiClient();

interface Pharmacy {
  id: number;
  pharmacy_name: string;
  owner_name: string;
  owner_email: string;
  location: string;
  phone: string;
  medicine_count: number;
  created_at: string;
}

export default function AdminPharmacies() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [search, setSearch]         = useState('');
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(true);
  const perPage = 15;

  const fetchPharmacies = (s: string, p: number) => {
    setLoading(true);
    apiClient.getAdminPharmacies(s, p)
      .then(res => {
        if (res.success) {
          setPharmacies(res.pharmacies);
          setTotal(res.total);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPharmacies('', 1); }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
    fetchPharmacies(e.target.value, 1);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this pharmacy and all its medicines?')) return;
    try {
      await apiClient.deleteAdminPharmacy(id);
      toast.success('Pharmacy deleted');
      fetchPharmacies(search, page);
    } catch {
      toast.error('Could not delete pharmacy');
    }
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <>
      <div className="admin-page-header">
        <h2 className="admin-page-title">Pharmacies</h2>
        <p className="admin-page-subtitle">All registered pharmacies · {total} total</p>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">All Pharmacies</h3>
          <input
            className="admin-search-input"
            placeholder="Search name, location, owner…"
            value={search}
            onChange={handleSearch}
          />
        </div>

        <div className="admin-table-wrap">
          {loading ? (
            <div className="admin-loading">Loading…</div>
          ) : pharmacies.length === 0 ? (
            <div className="admin-empty">No pharmacies found.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Pharmacy</th>
                  <th>Owner</th>
                  <th>Location</th>
                  <th>Phone</th>
                  <th>Medicines</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pharmacies.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td className="admin-td-name">{p.pharmacy_name}</td>
                    <td>
                      <div>{p.owner_name}</div>
                      <div className="admin-td-sub">{p.owner_email}</div>
                    </td>
                    <td>{p.location || '—'}</td>
                    <td>{p.phone || '—'}</td>
                    <td>
                      <span className="admin-badge badge-blue">{p.medicine_count}</span>
                    </td>
                    <td>{new Date(p.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="admin-btn admin-btn-danger"
                        onClick={() => handleDelete(p.id)}
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
              onClick={() => { setPage(p => p - 1); fetchPharmacies(search, page - 1); }}
            >← Prev</button>
            <span>Page {page} of {totalPages}</span>
            <button
              className="admin-btn admin-btn-ghost"
              disabled={page === totalPages}
              onClick={() => { setPage(p => p + 1); fetchPharmacies(search, page + 1); }}
            >Next →</button>
          </div>
        )}
      </div>
    </>
  );
}