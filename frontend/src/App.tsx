import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProductManagement from './features/products/ProductManagement';
import CustomerManagement from './features/customers/CustomerManagement';
import OrderManagement from './features/orders/OrderManagement';
import AdminDashboard from './features/dashboard/AdminDashboard';
import CustomerDashboard from './features/dashboard/CustomerDashboard';
import Profile from './features/profile/Profile';
import Login from './features/auth/Login';
import Signup from './features/auth/Signup';
import ProtectedRoute from './routes/ProtectedRoute';
import { Package, Users, ShoppingCart, Database, Sun, Moon, LogOut, Loader2, Home, User } from 'lucide-react';

function NavigationMenu() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
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

  const isActive = (path: string) => location.pathname === path;

  const navButtonStyle = (path: string) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: isActive(path) ? 'var(--primary)' : 'transparent',
    border: 'none',
    borderRadius: '8px',
    padding: '0.6rem 1rem',
    color: isActive(path) ? '#fff' : 'var(--text-secondary)',
    cursor: 'pointer',
    fontWeight: 600,
    textDecoration: 'none',
    transition: 'var(--transition-smooth)'
  });

  if (!user) return null;

  return (
    <header className="glass-card app-header" style={{ justifyContent: 'space-between' }}>
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

      {/* NAV LINKS */}
      <nav className="app-nav" style={{ gap: '0.5rem', display: 'flex', alignItems: 'center' }}>
        <Link to="/dashboard" style={navButtonStyle('/dashboard')}>
          <Home size={16} /> Dashboard
        </Link>
        <Link to="/products" style={navButtonStyle('/products')}>
          <Package size={16} /> Products
        </Link>
        
        {user.role === 'admin' && (
          <Link to="/customers" style={navButtonStyle('/customers')}>
            <Users size={16} /> Customers
          </Link>
        )}
        
        <Link to="/orders" style={navButtonStyle('/orders')}>
          <ShoppingCart size={16} /> Orders
        </Link>
        <Link to="/profile" style={navButtonStyle('/profile')}>
          <User size={16} /> Profile
        </Link>

        <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--card-border)', margin: '0 0.5rem' }}></div>

        {/* LOGGED IN USER WIDGET */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--card-border)',
          borderRadius: '8px',
          padding: '0.4rem 0.75rem'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #c084fc, #6366f1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            color: '#fff',
            fontSize: '0.85rem'
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: '1.2' }}>
              {user.name}
            </span>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: user.role === 'admin' ? '#f43f5e' : '#10b981',
              letterSpacing: '0.05em'
            }}>
              {user.role}
            </span>
          </div>
        </div>

        {/* THEME TOGGLE */}
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
            transition: 'var(--transition-smooth)'
          }}
          title={theme === 'dark' ? 'Toggle Day Mode' : 'Toggle Night Mode'}
        >
          {theme === 'dark' ? <Sun size={16} color="#fbbf24" /> : <Moon size={16} color="#a78bfa" />}
        </button>

        {/* LOGOUT BUTTON */}
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            padding: '0.6rem',
            color: '#f87171',
            cursor: 'pointer',
            transition: 'var(--transition-smooth)'
          }}
          title="Logout Session"
        >
          <LogOut size={16} />
        </button>
      </nav>
    </header>
  );
}

function MainLayout() {
  const { user } = useAuth();
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
      <NavigationMenu />
      
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={user?.role === 'admin' ? <AdminDashboard /> : <CustomerDashboard />} />
          <Route path="/products" element={<ProductManagement />} />
          <Route path="/orders" element={<OrderManagement />} />
          
          <Route 
            path="/customers" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CustomerManagement />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      <footer className="app-footer">
        &copy; 2026 Tirupati Inventory System. Created for technical assessment.
      </footer>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#0f0c1b',
        color: '#fff',
        gap: '1rem'
      }}>
        <Loader2 size={40} className="spinner" color="#a78bfa" />
        <span style={{ fontSize: '0.9rem', color: '#a78bfa', letterSpacing: '0.05em' }}>
          Restoring Session...
        </span>
      </div>
    );
  }

  return (
    <Routes>
      {/* PUBLIC PATHS (Redirect if already logged in) */}
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      <Route 
        path="/signup" 
        element={user ? <Navigate to="/dashboard" replace /> : <Signup />} 
      />

      {/* PROTECTED ROUTE SHELL */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
