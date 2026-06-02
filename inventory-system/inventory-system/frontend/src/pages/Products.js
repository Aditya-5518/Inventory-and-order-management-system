import React, { useEffect, useState } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../utils/api';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

const EMPTY_FORM = { name: '', sku: '', price: '', quantity: '', description: '' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'create' | 'edit'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [globalMsg, setGlobalMsg] = useState(null);

  const load = () => getProducts().then(r => setProducts(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setFormError(''); setSelected(null); setModal('create'); };
  const openEdit = (p) => {
    setForm({ name: p.name, sku: p.sku, price: p.price, quantity: p.quantity, description: p.description || '' });
    setSelected(p); setFormError(''); setModal('edit');
  };
  const closeModal = () => setModal(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    const payload = { ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity) };
    try {
      if (modal === 'create') {
        await createProduct(payload);
        setGlobalMsg({ type: 'success', text: 'Product created successfully' });
      } else {
        await updateProduct(selected.id, payload);
        setGlobalMsg({ type: 'success', text: 'Product updated successfully' });
      }
      closeModal(); load();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      setGlobalMsg({ type: 'success', text: 'Product deleted' });
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
          <h1>Products</h1>
          <p>{products.length} product{products.length !== 1 ? 's' : ''} in inventory</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {globalMsg && (
        <div className={`alert alert-${globalMsg.type === 'success' ? 'success' : 'error'}`}>
          {globalMsg.text}
          <button style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }} onClick={() => setGlobalMsg(null)}><X size={14} /></button>
        </div>
      )}

      <div className="card">
        {products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>No products yet</h3>
            <p>Add your first product to get started</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td><span className="mono">{p.sku}</span></td>
                    <td>${p.price.toFixed(2)}</td>
                    <td>{p.quantity}</td>
                    <td>
                      {p.quantity === 0
                        ? <span className="badge badge-red">Out of Stock</span>
                        : p.quantity <= 5
                          ? <span className="badge badge-amber">Low Stock</span>
                          : <span className="badge badge-green">In Stock</span>
                      }
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(p)} title="Edit"><Pencil size={14} /></button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(p.id)} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-bg" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal === 'create' ? 'Add Product' : 'Edit Product'}</h2>
              <button className="modal-close" onClick={closeModal}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formError && <div className="alert alert-error">{formError}</div>}
                <div className="form-grid">
                  <div className="form-group">
                    <label>Name *</label>
                    <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Product name" />
                  </div>
                  <div className="form-group">
                    <label>SKU *</label>
                    <input required value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="PROD-001" />
                  </div>
                  <div className="form-group">
                    <label>Price *</label>
                    <input required type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
                  </div>
                  <div className="form-group">
                    <label>Quantity *</label>
                    <input required type="number" min="0" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="0" />
                  </div>
                  <div className="form-group full">
                    <label>Description</label>
                    <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional description" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Saving...</> : (modal === 'create' ? 'Create Product' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
