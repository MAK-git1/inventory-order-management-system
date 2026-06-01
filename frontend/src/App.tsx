import { useState, useEffect } from 'react';
import ProductManagement from './features/products/ProductManagement';
import CustomerManagement from './features/customers/CustomerManagement';
import OrderManagement from './features/orders/OrderManagement';
import { Package, Users, ShoppingCart, Database, Sun, Moon } from 'lucide-react';

type Tab = 'dashboard' | 'products' | 'customers' | 'orders';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Simple responsive layout styling classes
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: 'var(--background-dark)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-family)',
      transition: 'background-color 0.3s ease, color 0.3s ease'
    }}>
      {/* GLOBAL NAVBAR */}
      <header className="glass-card" style={{
        margin: '1.5rem',
        marginBottom: '0',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem',
        borderRadius: 'var(--border-radius-md)'
      }}>
        {/* LOGO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            padding: '0.5rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Database size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              background: 'linear-gradient(90deg, #a78bfa, #22d3ee)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.025em'
            }}>
              Tirupati Inventory
            </h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Order Management Console</span>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={() => setActiveTab('products')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: activeTab === 'products' ? 'var(--primary)' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              padding: '0.6rem 1rem',
              color: activeTab === 'products' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'var(--transition-smooth)'
            }}
          >
            <Package size={16} /> Products
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: activeTab === 'customers' ? 'var(--primary)' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              padding: '0.6rem 1rem',
              color: activeTab === 'customers' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'var(--transition-smooth)'
            }}
          >
            <Users size={16} /> Customers
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: activeTab === 'orders' ? 'var(--primary)' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              padding: '0.6rem 1rem',
              color: activeTab === 'orders' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'var(--transition-smooth)'
            }}
          >
            <ShoppingCart size={16} /> Orders
          </button>

          {/* DAY / NIGHT MODE ICON */}
          <button
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--card-border)',
              borderRadius: '8px',
              padding: '0.6rem',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'var(--transition-smooth)',
              marginLeft: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--card-border)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
            title={theme === 'dark' ? 'Toggle Day Mode' : 'Toggle Night Mode'}
          >
            {theme === 'dark' ? <Sun size={16} color="#fbbf24" /> : <Moon size={16} color="#a78bfa" />}
          </button>
        </nav>
      </header>

      {/* MAIN VIEW AREA */}
      <main style={{
        flex: 1,
        padding: '1.5rem',
        maxWidth: '1280px',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        boxSizing: 'border-box'
      }}>
        {activeTab === 'products' && <ProductManagement />}
        
        {activeTab === 'customers' && <CustomerManagement />}

        {activeTab === 'orders' && <OrderManagement />}
      </main>

      {/* FOOTER */}
      <footer style={{
        textAlign: 'center',
        padding: '1.5rem',
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
        borderTop: '1px solid var(--card-border)',
        margin: '0 1.5rem'
      }}>
        &copy; 2026 Antigravity Inventory System. Created for technical assessment.
      </footer>
    </div>
  );
}
