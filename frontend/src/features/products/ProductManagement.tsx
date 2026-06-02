import React, { useState, useEffect } from 'react';
import { productsService, Product } from '../../services/products';
import { Plus, Edit2, Trash2, Search, X, Loader, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ProductManagement() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  
  // Form values
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    stock_quantity: ''
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Deletion states
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productsService.getAll();
      setProducts(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch products catalog.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setFormData({ name: '', sku: '', price: '', stock_quantity: '0' });
    setFormError(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price.toString(),
      stock_quantity: product.stock_quantity.toString()
    });
    setFormError(null);
    setSelectedProductId(product.id);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormError(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    // Client-side validations
    if (!formData.name.trim()) return setFormError('Product Name is required.');
    if (!formData.sku.trim()) return setFormError('SKU is required.');
    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) return setFormError('Price must be a number greater than 0.');
    const stockNum = parseInt(formData.stock_quantity);
    if (isNaN(stockNum) || stockNum < 0) return setFormError('Stock Quantity must be 0 or greater.');

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        sku: formData.sku.trim().toUpperCase(),
        price: priceNum,
        stock_quantity: stockNum
      };

      if (modalMode === 'create') {
        await productsService.create(payload);
      } else if (selectedProductId !== null) {
        await productsService.update(selectedProductId, payload);
      }
      
      handleCloseModal();
      fetchProducts();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to save product database record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await productsService.delete(id);
      setDeleteConfirmId(null);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete product. It may be linked to order history records.');
    }
  };

  // Filter products by name or SKU
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animated-fade-in" style={{ width: '100%' }}>
      {/* Page Title & Add Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Product Inventory</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Manage your store catalog and monitor available stock.
          </p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={handleOpenCreateModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--border-radius-sm)',
              padding: '0.75rem 1.25rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'var(--transition-smooth)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
          >
            <Plus size={18} /> Add Product
          </button>
        )}
      </div>

      {/* Search Bar Controls */}
      <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Search size={18} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Filter catalog by product name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: '0.95rem',
            outline: 'none'
          }}
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* API Error Box */}
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

      {/* Table Data View */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <Loader className="spin" size={32} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          {searchTerm ? 'No products match your search filters.' : 'No products found in the catalog. Click Add Product to register one.'}
        </div>
      ) : (
        <div className="glass-card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <th style={{ padding: '1rem' }}>Product Name</th>
                <th style={{ padding: '1rem' }}>SKU</th>
                <th style={{ padding: '1rem' }}>Price</th>
                <th style={{ padding: '1rem' }}>Stock Status</th>
                <th style={{ padding: '1rem' }}>Date Added</th>
                {user?.role === 'admin' && <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => {
                // Stock color tagging
                const isOutOfStock = product.stock_quantity === 0;
                const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 10;
                
                const stockTagStyle = {
                  display: 'inline-block',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: isOutOfStock 
                    ? 'rgba(239, 68, 68, 0.1)' 
                    : isLowStock 
                      ? 'rgba(245, 158, 11, 0.1)' 
                      : 'rgba(16, 185, 129, 0.1)',
                  color: isOutOfStock 
                    ? 'var(--danger)' 
                    : isLowStock 
                      ? 'var(--warning)' 
                      : 'var(--success)',
                  border: `1px solid ${
                    isOutOfStock 
                      ? 'rgba(239, 68, 68, 0.2)' 
                      : isLowStock 
                        ? 'rgba(245, 158, 11, 0.2)' 
                        : 'rgba(16, 185, 129, 0.2)'
                  }`
                };

                return (
                  <tr key={product.id} style={{ borderBottom: '1px solid var(--card-border)', transition: 'var(--transition-smooth)' }} className="table-row-hover">
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{product.name}</td>
                    <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{product.sku}</td>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>${parseFloat(product.price.toString()).toFixed(2)}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={stockTagStyle}>
                        {product.stock_quantity} units ({isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'Healthy'})
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(product.created_at).toLocaleDateString()}
                    </td>
                    {user?.role === 'admin' && (
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid var(--card-border)',
                              borderRadius: '6px',
                              padding: '0.4rem',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
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
                            title="Edit Product"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(product.id)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.05)',
                              border: '1px solid rgba(239, 68, 68, 0.15)',
                              borderRadius: '6px',
                              padding: '0.4rem',
                              color: 'var(--danger)',
                              cursor: 'pointer',
                              transition: 'var(--transition-smooth)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--danger)';
                              e.currentTarget.style.color = '#fff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)';
                              e.currentTarget.style.color = 'var(--danger)';
                            }}
                            title="Delete Product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE & EDIT MODAL */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-card animated-fade-in" style={{
            width: '100%',
            maxWidth: '500px',
            padding: '2rem',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                {modalMode === 'create' ? 'Add New Product' : 'Edit Product'}
              </h3>
              <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--danger)',
                padding: '0.75rem',
                borderRadius: '6px',
                fontSize: '0.875rem',
                marginBottom: '1rem'
              }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="e.g. Wireless Mouse"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--card-border)',
                    borderRadius: 'var(--border-radius-sm)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  SKU Code
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleFormChange}
                  placeholder="e.g. MS-WIRELESS-BLK"
                  required
                  disabled={modalMode === 'edit'}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--card-border)',
                    borderRadius: 'var(--border-radius-sm)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '0.95rem',
                    opacity: modalMode === 'edit' ? 0.5 : 1,
                    textTransform: 'uppercase'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Unit Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleFormChange}
                    placeholder="0.00"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--card-border)',
                      borderRadius: 'var(--border-radius-sm)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    name="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={handleFormChange}
                    placeholder="0"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--card-border)',
                      borderRadius: 'var(--border-radius-sm)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
              </div>

              <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid var(--card-border)',
                    borderRadius: 'var(--border-radius-sm)',
                    padding: '0.65rem 1.25rem',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    backgroundColor: 'var(--primary)',
                    border: 'none',
                    borderRadius: 'var(--border-radius-sm)',
                    padding: '0.65rem 1.25rem',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {submitting && <Loader className="spin" size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                  {modalMode === 'create' ? 'Create Product' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM DIALOG */}
      {deleteConfirmId !== null && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-card animated-fade-in" style={{
            width: '100%',
            maxWidth: '400px',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <Trash2 size={48} color="var(--danger)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Delete Product?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Are you sure you want to remove this product from the inventory? This action cannot be undone.
            </p>
            <div className="form-actions" style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => setDeleteConfirmId(null)}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid var(--card-border)',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '0.65rem 1.25rem',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteConfirmId !== null && handleDeleteProduct(deleteConfirmId)}
                style={{
                  backgroundColor: 'var(--danger)',
                  border: 'none',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '0.65rem 1.25rem',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
