import { useState, useEffect } from 'react';
import { dashboardService, CustomerDashboardData } from '../../services/dashboard';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, Loader, AlertTriangle, RefreshCw, Calendar, Package, ArrowRight, User, ShoppingCart } from 'lucide-react';
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

  const formatOrderItems = (items: any[]) => {
    if (!items || items.length === 0) return 'No items';
    return items.map(item => `${item.quantity}x ${item.product?.name || `Product ID ${item.product_id}`}`).join(', ');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', width: '100%', color: 'var(--text-secondary)' }}>
        <Loader className="spin" size={36} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center', margin: '2rem auto', maxWidth: '500px', width: '100%' }}>
        <AlertTriangle size={48} color="var(--danger)" style={{ marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Error Loading Dashboard</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{error}</p>
        <button
          onClick={fetchMetrics}
          style={{
            backgroundColor: 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.6rem 1.25rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600,
            transition: 'var(--transition-smooth)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
        >
          <RefreshCw size={14} /> Retry Loading
        </button>
      </div>
    );
  }

  // Find latest order for the quick summary card
  const latestOrder = data.recent_orders.length > 0 ? data.recent_orders[0] : null;

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
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, background: 'linear-gradient(90deg, var(--text-primary), var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Welcome back, {data.customer_name}!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Here is a summary of your recent purchases, active orders, and profile details.
          </p>
        </div>
        <button
          onClick={fetchMetrics}
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--card-border)',
            borderRadius: '8px',
            padding: '0.6rem 1.25rem',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600,
            fontSize: '0.875rem',
            transition: 'var(--transition-smooth)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.color = 'var(--text-primary)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--card-border)';
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
          }}
        >
          <RefreshCw size={14} /> Reload Metrics
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Card 1: My Orders Summary */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            backgroundColor: 'rgba(34, 211, 238, 0.12)',
            padding: '0.85rem',
            borderRadius: '12px',
            color: '#22d3ee',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShoppingBag size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.075em', fontWeight: 600 }}>
              My Latest Order
            </span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--text-primary)' }}>
              {latestOrder ? `#${latestOrder.id}` : 'No orders yet'}
            </h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              {latestOrder ? `Placed on ${new Date(latestOrder.created_at).toLocaleDateString()}` : 'Visit the Checkout Desk below'}
            </span>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            padding: '0.85rem',
            borderRadius: '12px',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShoppingCart size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.075em', fontWeight: 600 }}>
              Total Orders Placed
            </span>
            <h3 style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {data.total_orders}
            </h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Lifetime transactions</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column (Recent Orders) & Right Column (Profile Summary & Products) */}
      <div className="responsive-grid">
        
        {/* LEFT COLUMN: Recent Orders History Log */}
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <Calendar size={18} color="var(--primary)" /> Recent Orders History
          </h3>

          {data.recent_orders.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem 1rem', fontSize: '0.9rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--card-border)', borderRadius: '8px' }}>
              No purchase orders found on your account registry.
            </div>
          ) : (
            <div style={{ overflowX: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Order ID</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Order Date</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Items Purchased</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_orders.map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid var(--card-border)' }} className="table-row-hover">
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          display: 'inline-block',
                          backgroundColor: 'rgba(34, 211, 238, 0.1)',
                          border: '1px solid rgba(34, 211, 238, 0.2)',
                          color: '#22d3ee',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px'
                        }}>
                          #{order.id}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={formatOrderItems(order.items)}>
                        {formatOrderItems(order.items)}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700, color: 'var(--secondary)' }}>
                        ${parseFloat(order.total_amount.toString()).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--card-border)', display: 'flex', justifyContent: 'flex-end' }}>
            <Link to="/orders" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', transition: 'var(--transition-smooth)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--primary)'}
            >
              Access Complete Order Desk <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: Profile Summary Card & Recently Ordered Products */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%' }}>
          
          {/* Section 1: Profile Summary Card */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(167, 139, 250, 0.25)',
                color: '#fff'
              }}>
                <User size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>Profile Summary</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Registered customer profile</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Full Name:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Email:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{user?.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Phone:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user?.phone || 'Not provided'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.25rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Member Since:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link
                to="/profile"
                style={{
                  flex: 1,
                  textAlign: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--card-border)',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  padding: '0.6rem 0',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  transition: 'var(--transition-smooth)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--card-border)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                }}
              >
                Edit Profile Details
              </Link>

              <Link
                to="/orders"
                style={{
                  flex: 1,
                  textAlign: 'center',
                  backgroundColor: 'var(--primary)',
                  color: '#fff',
                  textDecoration: 'none',
                  padding: '0.6rem 0',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                  transition: 'var(--transition-smooth)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
              >
                Shop Now <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Section 2: Recently Purchased Products */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <Package size={18} color="var(--primary)" /> Recently Ordered Products
            </h3>

            {data.recent_products.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem 1rem', fontSize: '0.875rem', border: '1px dashed var(--card-border)', borderRadius: '8px' }}>
                No recently ordered products on your purchase record.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {data.recent_products.map(product => (
                  <div key={product.id} className="table-row-hover" style={{
                    padding: '0.85rem 1rem',
                    border: '1px solid var(--card-border)',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.01)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'var(--transition-smooth)'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{product.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem', fontFamily: 'monospace' }}>
                        SKU: {product.sku}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--secondary)' }}>
                      ${parseFloat(product.price.toString()).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

