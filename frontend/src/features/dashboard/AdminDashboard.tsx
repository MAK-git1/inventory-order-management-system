import { useState, useEffect } from 'react';
import { dashboardService, AdminDashboardData } from '../../services/dashboard';
import { customersService, Customer } from '../../services/customers';
import { Package, Users, ShoppingCart, DollarSign, AlertTriangle, Loader, RefreshCw, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [metricsRes, customersRes] = await Promise.all([
        dashboardService.getAdminMetrics(),
        customersService.getAll()
      ]);
      setData(metricsRes);
      setCustomers(customersRes);
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

  const getCustomerInfo = (customerId: number) => {
    const cust = customers.find(c => c.id === customerId);
    return cust ? { name: cust.name, email: cust.email } : { name: `Customer #${customerId}`, email: 'Unregistered profile' };
  };

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

  return (
    <div className="animated-fade-in" style={{ width: '100%' }}>
      {/* Title Header */}
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
            Admin Console
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            System activity metrics, cumulative sales totals, and inventory alerts.
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
          <RefreshCw size={14} /> Reload Data
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Total Products */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            backgroundColor: 'rgba(167, 139, 250, 0.12)',
            padding: '0.85rem',
            borderRadius: '12px',
            color: '#c084fc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Package size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.075em', fontWeight: 600 }}>
              Total Products
            </span>
            <h3 style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {data.total_products}
            </h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Items in catalog</span>
          </div>
        </div>

        {/* Total Customers */}
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
            <Users size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.075em', fontWeight: 600 }}>
              Total Customers
            </span>
            <h3 style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {data.total_customers}
            </h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Registered accounts</span>
          </div>
        </div>

        {/* Total Orders */}
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
              Total Orders
            </span>
            <h3 style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {data.total_orders}
            </h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Orders completed</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            backgroundColor: 'rgba(251, 191, 36, 0.12)',
            padding: '0.85rem',
            borderRadius: '12px',
            color: '#fbbf24',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <DollarSign size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.075em', fontWeight: 600 }}>
              Total Revenue
            </span>
            <h3 style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--secondary)', lineHeight: 1.1 }}>
              ${parseFloat(data.total_revenue.toString()).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Gross system earnings</span>
          </div>
        </div>
      </div>

      {/* Tables Section (2-Column Responsive Grid) */}
      <div className="responsive-grid">
        
        {/* Table 1: Recent Orders */}
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <ShoppingCart size={18} color="var(--primary)" /> Recent Orders (Latest 5)
          </h3>

          {data.recent_orders.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem 1rem', fontSize: '0.9rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--card-border)', borderRadius: '8px' }}>
              No purchase orders found in the system log.
            </div>
          ) : (
            <div style={{ overflowX: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Order ID</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Customer</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Items</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_orders.map(order => {
                    const custInfo = getCustomerInfo(order.customer_id);
                    return (
                      <tr key={order.id} style={{ borderBottom: '1px solid var(--card-border)' }} className="table-row-hover">
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{
                            display: 'inline-block',
                            backgroundColor: 'rgba(167, 139, 250, 0.1)',
                            border: '1px solid rgba(167, 139, 250, 0.2)',
                            color: '#c084fc',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '6px'
                          }}>
                            #{order.id}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{custInfo.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{custInfo.email}</div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={formatOrderItems(order.items)}>
                          {formatOrderItems(order.items)}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700, color: 'var(--secondary)' }}>
                          ${parseFloat(order.total_amount.toString()).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--card-border)', display: 'flex', justifyContent: 'flex-end' }}>
            <Link to="/orders" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', transition: 'var(--transition-smooth)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--primary)'}
            >
              Go to Order Desk <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Table 2: Low Stock Products */}
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <AlertTriangle size={18} color="var(--warning)" /> Inventory Alerts (Stock &lt; 10)
          </h3>

          {data.low_stock_products.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem 1rem', fontSize: '0.9rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--card-border)', borderRadius: '8px' }}>
              All product quantities are at healthy catalog levels.
            </div>
          ) : (
            <div style={{ overflowX: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Product Name</th>
                    <th style={{ padding: '0.75rem 1rem' }}>SKU Code</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Price</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Stock Status</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.low_stock_products.map(product => {
                    const isOutOfStock = product.stock_quantity === 0;
                    return (
                      <tr key={product.id} style={{ borderBottom: '1px solid var(--card-border)' }} className="table-row-hover">
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{product.name}</td>
                        <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{product.sku}</td>
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem' }}>${parseFloat(product.price.toString()).toFixed(2)}</td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: isOutOfStock ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                            color: isOutOfStock ? 'var(--danger)' : 'var(--warning)',
                            border: `1px solid ${isOutOfStock ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                          }}>
                            {product.stock_quantity} units {isOutOfStock ? '(Out)' : '(Low)'}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <Link
                            to="/products"
                            style={{
                              display: 'inline-block',
                              backgroundColor: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid var(--card-border)',
                              color: 'var(--text-secondary)',
                              textDecoration: 'none',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              padding: '0.35rem 0.75rem',
                              borderRadius: '6px',
                              transition: 'var(--transition-smooth)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = 'var(--primary)';
                              e.currentTarget.style.color = '#fff';
                              e.currentTarget.style.backgroundColor = 'var(--primary)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = 'var(--card-border)';
                              e.currentTarget.style.color = 'var(--text-secondary)';
                              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
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
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--card-border)', display: 'flex', justifyContent: 'flex-end' }}>
            <Link to="/products" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', transition: 'var(--transition-smooth)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--primary)'}
            >
              Manage Inventory Catalog <ArrowRight size={14} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

