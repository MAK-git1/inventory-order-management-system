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
import { Package, Users, ShoppingCart, Database, Sun, Moon, LogOut, Loader2, Home, User, Menu, X } from 'lucide-react';

function NavigationMenu() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

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
    <header className="glass-card app-header">
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
            letterSpacing: '-0.025em',
            margin: 0,
            lineHeight: 1.2
          }}>
            Tirupati Inventory
          </h1>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Order Management Console</span>
        </div>
      </div>

      {/* DESKTOP NAV LINKS */}
      <nav className="app-nav desktop-nav" style={{ gap: '0.5rem', display: 'flex', alignItems: 'center' }}>
        <Link to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} style={navButtonStyle(user.role === 'admin' ? '/admin/dashboard' : '/dashboard')}>
          <Home size={16} /> Dashboard
        </Link>
        
        {user.role === 'admin' && (
          <Link to="/products" style={navButtonStyle('/products')}>
            <Package size={16} /> Products
          </Link>
        )}
        
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

      {/* MOBILE CONTROLS */}
      <div className="mobile-nav-controls" style={{ display: 'none', alignItems: 'center', gap: '0.75rem' }}>
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
        <button
          onClick={() => setIsMobileMenuOpen(prev => !prev)}
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
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* MOBILE SIDEBAR DRAWER OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-drawer-overlay open" 
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'flex-end',
            transition: 'opacity 0.3s ease'
          }}
        >
          <div 
            className="mobile-drawer" 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '280px',
              height: '100%',
              backgroundColor: 'var(--background-dark)',
              borderLeft: '1px solid var(--card-border)',
              display: 'flex',
              flexDirection: 'column',
              padding: '1.5rem',
              boxSizing: 'border-box',
              position: 'relative',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  padding: '0.4rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Database size={16} color="#fff" />
                </div>
                <span style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  background: 'linear-gradient(90deg, #a78bfa, #22d3ee)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.025em'
                }}>
                  Tirupati Console
                </span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '50%',
                  padding: '0.4rem',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer User Info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--card-border)',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #c084fc, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                color: '#fff',
                fontSize: '1rem'
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user.name}
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: user.role === 'admin' ? '#f43f5e' : '#10b981',
                  letterSpacing: '0.05em'
                }}>
                  {user.role}
                </span>
              </div>
            </div>

            {/* Drawer Navigation Links */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <Link 
                to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.8rem 1rem',
                  borderRadius: '8px',
                  color: isActive(user.role === 'admin' ? '/admin/dashboard' : '/dashboard') ? '#fff' : 'var(--text-secondary)',
                  backgroundColor: isActive(user.role === 'admin' ? '/admin/dashboard' : '/dashboard') ? 'var(--primary)' : 'transparent',
                  fontWeight: 600,
                  textDecoration: 'none',
                  fontSize: '0.925rem',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <Home size={18} /> Dashboard
              </Link>
              {user.role === 'admin' && (
                <Link 
                  to="/products" 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.8rem 1rem',
                    borderRadius: '8px',
                    color: isActive('/products') ? '#fff' : 'var(--text-secondary)',
                    backgroundColor: isActive('/products') ? 'var(--primary)' : 'transparent',
                    fontWeight: 600,
                    textDecoration: 'none',
                    fontSize: '0.925rem',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <Package size={18} /> Products
                </Link>
              )}
              {user.role === 'admin' && (
                <Link 
                  to="/customers" 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.8rem 1rem',
                    borderRadius: '8px',
                    color: isActive('/customers') ? '#fff' : 'var(--text-secondary)',
                    backgroundColor: isActive('/customers') ? 'var(--primary)' : 'transparent',
                    fontWeight: 600,
                    textDecoration: 'none',
                    fontSize: '0.925rem',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <Users size={18} /> Customers
                </Link>
              )}
              <Link 
                to="/orders" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.8rem 1rem',
                  borderRadius: '8px',
                  color: isActive('/orders') ? '#fff' : 'var(--text-secondary)',
                  backgroundColor: isActive('/orders') ? 'var(--primary)' : 'transparent',
                  fontWeight: 600,
                  textDecoration: 'none',
                  fontSize: '0.925rem',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <ShoppingCart size={18} /> Orders
              </Link>
              <Link 
                to="/profile" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.8rem 1rem',
                  borderRadius: '8px',
                  color: isActive('/profile') ? '#fff' : 'var(--text-secondary)',
                  backgroundColor: isActive('/profile') ? 'var(--primary)' : 'transparent',
                  fontWeight: 600,
                  textDecoration: 'none',
                  fontSize: '0.925rem',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <User size={18} /> Profile
              </Link>
            </nav>

            {/* Drawer Logout Action */}
            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--card-border)' }}>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                  navigate('/login');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '8px',
                  padding: '0.85rem',
                  color: '#f87171',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <LogOut size={16} /> Logout Session
              </button>
            </div>
          </div>
        </div>
      )}
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
          <Route path="/" element={<Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/products" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ProductManagement />
              </ProtectedRoute>
            } 
          />
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
          <Route path="*" element={<Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />} />
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
        element={user ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace /> : <Login />} 
      />
      <Route 
        path="/signup" 
        element={user ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace /> : <Signup />} 
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
