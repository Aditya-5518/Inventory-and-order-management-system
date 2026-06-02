import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import { LayoutDashboard, Package, Users, ShoppingCart, Menu, X } from 'lucide-react';
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/products', icon: Package, label: 'Products' },
    { to: '/customers', icon: Users, label: 'Customers' },
    { to: '/orders', icon: ShoppingCart, label: 'Orders' },
  ];

  return (
    <Router>
      <div className="app">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div className="logo">
              <span className="logo-icon">⬡</span>
              <span className="logo-text">StockFlow</span>
            </div>
            <button className="close-btn" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>
          <nav className="sidebar-nav">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-footer">
            <p className="version">v1.0.0</p>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)} />}

        {/* Main content */}
        <main className="main">
          <header className="topbar">
            <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="topbar-title">
              <span className="logo-icon">⬡</span>
              <span className="logo-text">StockFlow</span>
            </div>
          </header>
          <div className="content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/orders" element={<Orders />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
