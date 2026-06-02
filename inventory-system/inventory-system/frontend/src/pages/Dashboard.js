import React, { useEffect, useState } from 'react';
import { getDashboard } from '../utils/api';
import { Package, Users, ShoppingCart, DollarSign, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDashboard()
      .then(r => setStats(r.data))
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your inventory and business</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><Package size={22} color="var(--accent)" /></div>
          <div className="stat-label">Total Products</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{stats.total_products}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Users size={22} color="var(--green)" /></div>
          <div className="stat-label">Customers</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{stats.total_customers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><ShoppingCart size={22} color="var(--amber)" /></div>
          <div className="stat-label">Total Orders</div>
          <div className="stat-value" style={{ color: 'var(--amber)' }}>{stats.total_orders}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><DollarSign size={22} color="#b98ef7" /></div>
          <div className="stat-label">Revenue</div>
          <div className="stat-value" style={{ color: '#b98ef7' }}>${stats.total_revenue.toFixed(2)}</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <AlertTriangle size={16} color="var(--amber)" />
          <h2 style={{ fontSize: '15px', fontWeight: 600 }}>Low Stock Products</h2>
          <span className="badge badge-amber">{stats.low_stock_products.length}</span>
        </div>

        {stats.low_stock_products.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', padding: '20px 0' }}>
            ✓ All products have sufficient stock (more than 5 units)
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {stats.low_stock_products.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td><span className="mono">{p.sku}</span></td>
                    <td>
                      <span className={`badge ${p.quantity === 0 ? 'badge-red' : 'badge-amber'}`}>
                        {p.quantity === 0 ? 'Out of stock' : `${p.quantity} left`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
