import { useState, useEffect } from 'react';
import { dashboardService, AdminDashboardData } from '../../services/dashboard';
import { Package, Users, ShoppingCart, DollarSign, AlertTriangle, Loader, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardService.getAdminMetrics();
      setData(res);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch admin dashboard statistics.');
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
      {/* Title */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Admin Console</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            System activity metrics, cumulative sales totals, and stock status alerts.
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

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Total Products */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            backgroundColor: 'rgba(167, 139, 250, 0.1)',
            padding: '0.75rem',
            borderRadius: '10px',
            color: '#c084fc'
          }}>
            <Package size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Products
            </span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem' }}>{data.total_products}</h3>
          </div>
        </div>

        {/* Total Customers */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            backgroundColor: 'rgba(34, 211, 238, 0.1)',
            padding: '0.75rem',
            borderRadius: '10px',
            color: '#22d3ee'
          }}>
            <Users size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Customers
            </span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem' }}>{data.total_customers}</h3>
          </div>
        </div>

        {/* Total Orders */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            padding: '0.75rem',
            borderRadius: '10px',
            color: '#10b981'
          }}>
            <ShoppingCart size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Orders
            </span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem' }}>{data.total_orders}</h3>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            backgroundColor: 'rgba(251, 191, 36, 0.1)',
            padding: '0.75rem',
            borderRadius: '10px',
            color: '#fbbf24'
          }}>
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Revenue
            </span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--secondary)' }}>
              ${parseFloat(data.total_revenue.toString()).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </div>
      </div>

      {/* Low Stock alert section */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={18} color="var(--warning)" /> Inventory Low Stock Alerts (Stock &lt; 10)
        </h3>

        {data.low_stock_products.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem 1rem', fontSize: '0.9rem' }}>
            All product quantities are at healthy catalog levels.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Product Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>SKU Code</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Price</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Available Stock</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.low_stock_products.map(product => {
                  const isOutOfStock = product.stock_quantity === 0;
                  return (
                    <tr key={product.id} style={{ borderBottom: '1px solid var(--card-border)' }} className="table-row-hover">
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 500 }}>{product.name}</td>
                      <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{product.sku}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>${parseFloat(product.price.toString()).toFixed(2)}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: isOutOfStock ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: isOutOfStock ? 'var(--danger)' : 'var(--warning)',
                          border: `1px solid ${isOutOfStock ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                        }}>
                          {product.stock_quantity} units {isOutOfStock ? '(Out of Stock)' : '(Reorder soon)'}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <Link
                          to="/products"
                          style={{
                            display: 'inline-block',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--card-border)',
                            color: 'var(--text-secondary)',
                            textDecoration: 'none',
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            padding: '0.35rem 0.75rem',
                            borderRadius: '6px',
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
                          Restock
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
