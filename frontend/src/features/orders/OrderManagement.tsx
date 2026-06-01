import React, { useState, useEffect } from 'react';
import { ordersService, OrderResponse, OrderItemCreate } from '../../services/orders';
import { productsService, Product } from '../../services/products';
import { customersService, Customer } from '../../services/customers';
import { ShoppingBag, Loader, AlertTriangle, CheckCircle, Plus, Trash2, ArrowRight, Calendar } from 'lucide-react';

interface CartItem extends OrderItemCreate {
  name: string;
  price: number;
  max_stock: number;
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Placement Desk States
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Feedback states
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [placementError, setPlacementError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersData, productsData, customersData] = await Promise.all([
        ordersService.getAll(),
        productsService.getAll(),
        customersService.getAll()
      ]);
      setOrders(ordersData);
      setProducts(productsData);
      setCustomers(customersData);
    } catch (err: any) {
      setError('Failed to fetch data required for order desk operations.');
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find(p => p.id === parseInt(selectedProductId));

  const handleAddItemToCart = () => {
    setPlacementError(null);
    setSuccessMessage(null);
    
    if (!selectedProductId) return;
    
    const prodId = parseInt(selectedProductId);
    const product = products.find(p => p.id === prodId);
    if (!product) return;

    // Check if item already exists in cart to aggregate quantity
    const existingIndex = cart.findIndex(item => item.product_id === prodId);
    const currentQtyInCart = existingIndex > -1 ? cart[existingIndex].quantity : 0;
    const newQty = currentQtyInCart + quantity;

    // Verify stock availability
    if (product.stock_quantity < newQty) {
      setPlacementError(
        `Insufficient stock for '${product.name}'. Available: ${product.stock_quantity}, Requested in Cart: ${newQty}`
      );
      return;
    }

    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity = newQty;
      setCart(updatedCart);
    } else {
      setCart([
        ...cart,
        {
          product_id: prodId,
          name: product.name,
          price: parseFloat(product.price.toString()),
          quantity: quantity,
          max_stock: product.stock_quantity
        }
      ]);
    }

    // Reset single selection variables
    setSelectedProductId('');
    setQuantity(1);
  };

  const handleRemoveFromCart = (index: number) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlacementError(null);
    setSuccessMessage(null);

    if (!selectedCustomerId) {
      setPlacementError('Please select a customer profile.');
      return;
    }

    if (cart.length === 0) {
      setPlacementError('Please add at least one product item to place an order.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customer_id: parseInt(selectedCustomerId),
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        }))
      };

      await ordersService.create(payload);
      
      setSuccessMessage('Order placed successfully! Stock levels have been adjusted.');
      setCart([]);
      setSelectedCustomerId('');
      
      // Refresh current states
      const [updatedOrders, updatedProducts] = await Promise.all([
        ordersService.getAll(),
        productsService.getAll()
      ]);
      setOrders(updatedOrders);
      setProducts(updatedProducts);
      
    } catch (err: any) {
      setPlacementError(err.response?.data?.detail || 'An error occurred while submitting the order transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate cart total
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="animated-fade-in" style={{ width: '100%' }}>
      {/* Page Title */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Order Management Desk</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Place customer purchase orders and view active order histories.
        </p>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: 'var(--danger)',
          padding: '1rem',
          borderRadius: 'var(--border-radius-sm)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <Loader className="spin" size={32} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          alignItems: 'start'
        }} className="responsive-grid">
          {/* LEFT PANEL: PLACE ORDER */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag size={18} color="var(--primary)" /> Checkout Desk
            </h3>

            {/* Notification blocks */}
            {successMessage && (
              <div style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                color: 'var(--success)',
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                fontSize: '0.875rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <CheckCircle size={16} />
                <span>{successMessage}</span>
              </div>
            )}

            {placementError && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: 'var(--danger)',
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                fontSize: '0.875rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertTriangle size={16} />
                <span>{placementError}</span>
              </div>
            )}

            <form onSubmit={handlePlaceOrder}>
              {/* Customer Selector */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Select Customer
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(22, 28, 45, 0.8)',
                    border: '1px solid var(--card-border)',
                    borderRadius: 'var(--border-radius-sm)',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '0.95rem'
                  }}
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              {/* Product selector & quantity section */}
              <div style={{
                border: '1px solid var(--card-border)',
                borderRadius: 'var(--border-radius-sm)',
                padding: '1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                marginBottom: '1.5rem'
              }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>Add Products</h4>
                
                <div style={{ marginBottom: '0.75rem' }}>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(22, 28, 45, 0.8)',
                      border: '1px solid var(--card-border)',
                      borderRadius: 'var(--border-radius-sm)',
                      color: '#fff',
                      outline: 'none',
                      fontSize: '0.95rem'
                    }}
                  >
                    <option value="">-- Choose Product --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - ${parseFloat(p.price.toString()).toFixed(2)}</option>
                    ))}
                  </select>
                </div>

                {/* Stock Indicator */}
                {selectedProduct && (
                  <div style={{
                    fontSize: '0.8rem',
                    color: selectedProduct.stock_quantity === 0 ? 'var(--danger)' : 'var(--text-secondary)',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>Stock Keeping Unit: <strong>{selectedProduct.sku}</strong></span>
                    <span>Available Stock: <strong>{selectedProduct.stock_quantity} units</strong></span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      placeholder="Qty"
                      disabled={!selectedProductId || selectedProduct?.stock_quantity === 0}
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--card-border)',
                        borderRadius: 'var(--border-radius-sm)',
                        color: '#fff',
                        outline: 'none',
                        textAlign: 'center'
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItemToCart}
                    disabled={!selectedProductId || selectedProduct?.stock_quantity === 0}
                    style={{
                      backgroundColor: selectedProductId && selectedProduct?.stock_quantity !== 0 ? 'var(--secondary)' : 'rgba(255, 255, 255, 0.05)',
                      color: selectedProductId && selectedProduct?.stock_quantity !== 0 ? '#fff' : 'var(--text-muted)',
                      border: 'none',
                      borderRadius: 'var(--border-radius-sm)',
                      padding: '0.65rem 1.25rem',
                      cursor: selectedProductId && selectedProduct?.stock_quantity !== 0 ? 'pointer' : 'default',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>
              </div>

              {/* Cart contents listing */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Pending Order List ({cart.length} items)
                </label>
                
                {cart.length === 0 ? (
                  <div style={{
                    padding: '1.5rem',
                    textAlign: 'center',
                    border: '1px dashed var(--card-border)',
                    borderRadius: 'var(--border-radius-sm)',
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem'
                  }}>
                    Cart is empty. Add products above.
                  </div>
                ) : (
                  <div style={{
                    border: '1px solid var(--card-border)',
                    borderRadius: 'var(--border-radius-sm)',
                    overflow: 'hidden'
                  }}>
                    {cart.map((item, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        borderBottom: idx < cart.length - 1 ? '1px solid var(--card-border)' : 'none'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {item.quantity} x ${item.price.toFixed(2)}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCart(idx)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--danger)',
                              cursor: 'pointer',
                              padding: '0.2rem'
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {/* Cart Total Bar */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      backgroundColor: 'rgba(167, 139, 250, 0.05)',
                      borderTop: '1px solid var(--card-border)',
                      fontWeight: 600
                    }}>
                      <span>Order Total:</span>
                      <span style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || cart.length === 0}
                style={{
                  width: '100%',
                  backgroundColor: cart.length > 0 ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                  color: cart.length > 0 ? '#fff' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '0.85rem',
                  fontWeight: 600,
                  cursor: cart.length > 0 ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'var(--transition-smooth)'
                }}
                onMouseEnter={(e) => {
                  if (cart.length > 0) e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
                }}
                onMouseLeave={(e) => {
                  if (cart.length > 0) e.currentTarget.style.backgroundColor = 'var(--primary)';
                }}
              >
                {submitting ? (
                  <Loader className="spin" size={18} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <>Submit Order <ArrowRight size={16} /></>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT PANEL: ORDER HISTORY */}
          <div className="glass-card" style={{ padding: '2rem', height: '100%', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} color="var(--primary)" /> Order History Log
            </h3>
            
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem 1rem' }}>
                No orders have been submitted yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {orders.map(order => {
                  const cust = customers.find(c => c.id === order.customer_id);
                  return (
                    <div key={order.id} className="glass-card" style={{
                      padding: '1rem',
                      border: '1px solid var(--card-border)',
                      borderRadius: 'var(--border-radius-sm)',
                      backgroundColor: 'rgba(255,255,255,0.01)',
                      transition: 'var(--transition-smooth)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--card-border)'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Order ID: #{order.id}</div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '0.2rem' }}>
                            {cust ? cust.name : `Customer ID: ${order.customer_id}`}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--secondary)' }}>
                            ${parseFloat(order.total_amount.toString()).toFixed(2)}
                          </span>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {/* Items details breakdown */}
                      <div style={{
                        marginTop: '0.75rem',
                        paddingTop: '0.5rem',
                        borderTop: '1px dashed var(--card-border)'
                      }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.25rem' }}>Items Ordered:</div>
                        {order.items && order.items.map((item, idx) => (
                          <div key={idx} style={{
                            fontSize: '0.8rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            color: 'var(--text-secondary)',
                            marginTop: '0.15rem'
                          }}>
                            <span>• Product ID {item.product_id} (x{item.quantity})</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
