import React, { useEffect, useState } from 'react';
import { getOrders, getOrder, createOrder, deleteOrder, getProducts, getCustomers } from '../utils/api';
import { Plus, Trash2, X, Eye, ChevronDown, ChevronUp } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'create' | 'detail'
  const [detailOrder, setDetailOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [globalMsg, setGlobalMsg] = useState(null);

  // Create order form state
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);

  const load = () => getOrders().then(r => setOrders(r.data)).finally(() => setLoading(false));

  useEffect(() => {
    load();
    getProducts().then(r => setProducts(r.data));
    getCustomers().then(r => setCustomers(r.data));
  }, []);

  const openCreate = () => {
    setCustomerId('');
    setItems([{ product_id: '', quantity: 1 }]);
    setFormError('');
    setModal('create');
  };

  const openDetail = async (id) => {
    const r = await getOrder(id);
    setDetailOrder(r.data);
    setModal('detail');
  };

  const closeModal = () => { setModal(null); setDetailOrder(null); };

  const addItem = () => setItems([...items, { product_id: '', quantity: 1 }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, field, val) => {
    const next = [...items];
    next[i] = { ...next[i], [field]: val };
    setItems(next);
  };

  const computePreviewTotal = () => {
    return items.reduce((sum, item) => {
      const p = products.find(p => p.id === parseInt(item.product_id));
      return sum + (p ? p.price * (parseInt(item.quantity) || 0) : 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(''); setSaving(true);
    if (!customerId) { setFormError('Please select a customer'); setSaving(false); return; }
    if (items.some(i => !i.product_id)) { setFormError('Please select a product for each item'); setSaving(false); return; }
    try {
      await createOrder({
        customer_id: parseInt(customerId),
        items: items.map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) }))
      });
      setGlobalMsg({ type: 'success', text: 'Order created successfully' });
      closeModal(); load();
      getProducts().then(r => setProducts(r.data));
    } catch (err) {
      setFormError(err.response?.data?.detail || 'An error occurred');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel and delete this order? Stock will be restored.')) return;
    try {
      await deleteOrder(id);
      setGlobalMsg({ type: 'success', text: 'Order cancelled and stock restored' });
      load();
      getProducts().then(r => setProducts(r.data));
    } catch (err) {
      setGlobalMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to delete' });
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Orders</h1>
          <p>{orders.length} order{orders.length !== 1 ? 's' : ''} total</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Create Order
        </button>
      </div>

      {globalMsg && (
        <div className={`alert alert-${globalMsg.type === 'success' ? 'success' : 'error'}`}>
          {globalMsg.text}
          <button style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }} onClick={() => setGlobalMsg(null)}><X size={14} /></button>
        </div>
      )}

      <div className="card">
        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🛒</div>
            <h3>No orders yet</h3>
            <p>Create your first order to get started</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td><span className="mono">#{String(o.id).padStart(4, '0')}</span></td>
                    <td style={{ fontWeight: 500 }}>{o.customer?.name || `Customer #${o.customer_id}`}</td>
                    <td>{o.items?.length || 0} item{(o.items?.length || 0) !== 1 ? 's' : ''}</td>
                    <td style={{ fontWeight: 600 }}>${o.total_amount.toFixed(2)}</td>
                    <td><span className="badge badge-blue">{o.status}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      {o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openDetail(o.id)} title="View"><Eye size={14} /></button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(o.id)} title="Cancel"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      {modal === 'create' && (
        <div className="modal-bg" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Order</h2>
              <button className="modal-close" onClick={closeModal}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formError && <div className="alert alert-error">{formError}</div>}
                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label>Customer *</label>
                  <select required value={customerId} onChange={e => setCustomerId(e.target.value)}>
                    <option value="">Select a customer</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.7px', color: 'var(--text-muted)' }}>Order Items *</label>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}><Plus size={13} /> Add Item</button>
                  </div>
                  {items.map((item, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 36px', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                      <select value={item.product_id} onChange={e => updateItem(i, 'product_id', e.target.value)}>
                        <option value="">Select product</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} (${p.price.toFixed(2)}) — {p.quantity} in stock
                          </option>
                        ))}
                      </select>
                      <input type="number" min="1" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} placeholder="Qty" />
                      {items.length > 1 && (
                        <button type="button" className="btn btn-danger btn-icon" style={{ padding: '8px' }} onClick={() => removeItem(i)}><X size={14} /></button>
                      )}
                    </div>
                  ))}
                </div>

                {items.some(i => i.product_id) && (
                  <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px', fontSize: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                      <span>Estimated Total</span>
                      <span style={{ fontWeight: 600, color: 'var(--text)' }}>${computePreviewTotal().toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Placing...</> : 'Place Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {modal === 'detail' && detailOrder && (
        <div className="modal-bg" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order #{String(detailOrder.id).padStart(4, '0')}</h2>
              <button className="modal-close" onClick={closeModal}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.7px', color: 'var(--text-muted)', marginBottom: 4 }}>Customer</div>
                  <div style={{ fontWeight: 500 }}>{detailOrder.customer?.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--accent)' }}>{detailOrder.customer?.email}</div>
                </div>
                <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.7px', color: 'var(--text-muted)', marginBottom: 4 }}>Details</div>
                  <div style={{ fontSize: 13 }}><span className="badge badge-blue">{detailOrder.status}</span></div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{detailOrder.created_at ? new Date(detailOrder.created_at).toLocaleString() : '—'}</div>
                </div>
              </div>
              <table style={{ width: '100%', marginBottom: 12 }}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style={{ textAlign: 'right' }}>Unit Price</th>
                    <th style={{ textAlign: 'right' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {detailOrder.items?.map(item => (
                    <tr key={item.id}>
                      <td>{item.product?.name || `Product #${item.product_id}`}</td>
                      <td style={{ textAlign: 'right' }}>${item.unit_price.toFixed(2)}</td>
                      <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>${(item.unit_price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 0 0', borderTop: '1px solid var(--border)', fontWeight: 700, fontSize: 16 }}>
                Total: ${detailOrder.total_amount.toFixed(2)}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
