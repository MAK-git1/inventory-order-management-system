import { useState, useEffect } from 'react';
import { dashboardService, CustomerDashboardData } from '../../services/dashboard';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, Loader, AlertTriangle, RefreshCw, Calendar, Package, ArrowRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<CustomerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardService.getCustomerMetrics();
      setData(res);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch customer dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem', color: 'var(--text-secondary)' }}>
        <Loader className="spin" size={32} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', margin: '2rem 0' }}>
        <AlertTriangle size={36} color="var(--danger)" style={{ marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>Error Loading Dashboard</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{error}</p>
        <button
          onClick={fetchMetrics}
          style={{
            backgroundColor: 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="animated-fade-in" style={{ width: '100%' }}>
      {/* Welcome Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Welcome back, {data.customer_name}!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Here is a summary of your recent purchases and profile information.
          </p>
        </div>
        <button
          onClick={fetchMetrics}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--card-border)',
            borderRadius: '6px',
            padding: '0.5rem 1rem',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'var(--transition-smooth)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--card-border)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <RefreshCw size={14} /> Reload
        </button>
      </div>

      {/* Grid: Profile summary & order count */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Profile Card */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} color="var(--primary)" /> Profile Summary
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Full Name:</span>
              <span style={{ fontWeight: 500 }}>{user?.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Email:</span>
              <span style={{ fontWeight: 500 }}>{user?.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Phone:</span>
              <span style={{ fontWeight: 500 }}>{user?.phone || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Member Since:</span>
              <span style={{ fontWeight: 500 }}>{user ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
          <Link
            to="/profile"
            style={{
              display: 'block',
              textAlign: 'center',
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--card-border)',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              padding: '0.5rem 0',
              borderRadius: '6px',
              marginTop: '1rem',
              fontSize: '0.85rem',
              fontWeight: 500,
              transition: 'var(--transition-smooth)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--card-border)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            Edit Profile Details
          </Link>
        </div>

        {/* Aggregate statistics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Total orders placed card */}
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1 }}>
            <div style={{
              backgroundColor: 'rgba(167, 139, 250, 0.1)',
              padding: '0.75rem',
              borderRadius: '10px',
              color: '#c084fc'
            }}>
              <ShoppingBag size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Orders Placed
              </span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem' }}>{data.total_orders}</h3>
            </div>
          </div>

          {/* Quick shop card */}
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Need to place an order?</span>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.75rem' }}>Place a New Order</h4>
            <Link
              to="/orders"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                textDecoration: 'none',
                padding: '0.65rem 1rem',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.9rem',
                transition: 'var(--transition-smooth)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
            >
              Go to Checkout Desk <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Recent Orders & Recently Purchased Products */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Recent Orders List */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="var(--primary)" /> My Recent Orders
          </h3>

          {data.recent_orders.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 1rem', fontSize: '0.875rem' }}>
              You haven't placed any orders yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {data.recent_orders.map(order => (
                <div key={order.id} style={{
                  padding: '1rem',
                  border: '1px solid var(--card-border)',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.01)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Order #{order.id}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--secondary)' }}>
                      ${parseFloat(order.total_amount.toString()).toFixed(2)}
                    </div>
                    <Link
                      to="/orders"
                      style={{
                        display: 'inline-block',
                        fontSize: '0.75rem',
                        color: '#c084fc',
                        textDecoration: 'none',
                        marginTop: '0.2rem',
                        fontWeight: 500
                      }}
                    >
                      View Log
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Ordered Products Grid */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={18} color="var(--primary)" /> Recently Ordered Products
          </h3>

          {data.recent_products.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 1rem', fontSize: '0.875rem' }}>
              No purchased products on record.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {data.recent_products.map(product => (
                <div key={product.id} style={{
                  padding: '1rem',
                  border: '1px solid var(--card-border)',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.01)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{product.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem', fontFamily: 'monospace' }}>
                      {product.sku}
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    ${parseFloat(product.price.toString()).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
