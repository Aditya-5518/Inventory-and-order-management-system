import React, { useEffect, useState } from 'react';
import { getCustomers, createCustomer, deleteCustomer } from '../utils/api';
import { Plus, Trash2, X, User } from 'lucide-react';

const EMPTY_FORM = { name: '', email: '', phone: '' };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [globalMsg, setGlobalMsg] = useState(null);

  const load = () => getCustomers().then(r => setCustomers(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openModal = () => { setForm(EMPTY_FORM); setFormError(''); setModal(true); };
  const closeModal = () => setModal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(''); setSaving(true);
    try {
      await createCustomer(form);
      setGlobalMsg({ type: 'success', text: 'Customer added successfully' });
      closeModal(); load();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'An error occurred');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    try {
      await deleteCustomer(id);
      setGlobalMsg({ type: 'success', text: 'Customer deleted' });
      load();
    } catch (err) {
      setGlobalMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to delete' });
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p>{customers.length} customer{customers.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button className="btn btn-primary" onClick={openModal}>
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {globalMsg && (
        <div className={`alert alert-${globalMsg.type === 'success' ? 'success' : 'error'}`}>
          {globalMsg.text}
          <button style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }} onClick={() => setGlobalMsg(null)}><X size={14} /></button>
        </div>
      )}

      <div className="card">
        {customers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><User size={40} /></div>
            <h3>No customers yet</h3>
            <p>Add your first customer to get started</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{c.id}</td>
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td style={{ color: 'var(--accent)' }}>{c.email}</td>
                    <td>{c.phone || <span style={{ color: 'var(--text-dim)' }}>—</span>}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(c.id)} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-bg" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Customer</h2>
              <button className="modal-close" onClick={closeModal}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formError && <div className="alert alert-error">{formError}</div>}
                <div className="form-grid">
                  <div className="form-group full">
                    <label>Full Name *</label>
                    <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
                  </div>
                  <div className="form-group full">
                    <label>Email *</label>
                    <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" />
                  </div>
                  <div className="form-group full">
                    <label>Phone</label>
                    <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 000 0000" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Saving...</> : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
