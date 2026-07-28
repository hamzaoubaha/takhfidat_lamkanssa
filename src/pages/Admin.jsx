import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../supabaseClient';
import { products as mockProducts } from '../data/products';
import { Trash2, Edit2, LogOut, Package, ShoppingBag, Eye, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Admin() {
  const { lang, t } = useLanguage();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'products'
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('admin_authenticated') === 'true'
  );
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name_ar: '', name_fr: '', description_ar: '', description_fr: '',
    price: '', category: 'kitchen', image: '', is_featured: false
  });
  
  // App States
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageType, setImageType] = useState('upload'); // 'upload' or 'url'
  const [imageError, setImageError] = useState('');
  const [message, setMessage] = useState('');
  
  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editProductId, setEditProductId] = useState(null);

  const isDemoMode = useMemo(() => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    return !url || url.includes('your-project-id') || url === '';
  }, []);

  // Fetch when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      if (isDemoMode) throw new Error('Supabase is not configured');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.warn('Fallback to local mock products in Admin:', err.message);
      setProducts(mockProducts.map(p => ({
        id: p.id,
        name_ar: p.name.ar,
        name_fr: p.name.fr,
        description_ar: p.description.ar,
        description_fr: p.description.fr,
        price: p.price,
        rating: p.rating,
        category: p.category,
        image: p.image,
        is_featured: p.is_featured
      })));
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      if (isDemoMode) throw new Error('Supabase is not configured');
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.warn('Could not fetch orders:', err.message);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      if (isDemoMode) throw new Error('Cannot update order status in Demo Mode');
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      addToast(lang === 'ar' ? 'تم تحديث حالة الطلب!' : 'Statut de commande mis à jour!', 'success');
      fetchOrders();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
    if (password === correctPassword) {
      setIsAuthenticated(true);
      localStorage.setItem('admin_authenticated', 'true');
      setLoginError('');
      addToast(lang === 'ar' ? 'مرحباً بك في لوحة التحكم!' : 'Bienvenue dans le panneau administration!', 'success');
    } else {
      setLoginError(t('wrongPassword'));
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
    addToast(lang === 'ar' ? 'تم تسجيل الخروج بنجاح!' : 'Déconnexion réussie!', 'success');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (isDemoMode) {
      setImageError(lang === 'ar' ? '⚠️ رفع الصور غير متوفر في وضع التجربة.' : '⚠️ Upload désactivé en Mode Démo.');
      return;
    }

    setUploading(true);
    setImageError('');
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image: publicUrl }));
      addToast(lang === 'ar' ? 'تم رفع الصورة بنجاح!' : 'Image uploadée avec succès!', 'success');
    } catch (err) {
      console.error(err);
      setImageError(lang === 'ar' ? 'فشل رفع الصورة. يرجى تهيئة Bucket في Supabase.' : 'Échec du chargement.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (isDemoMode) {
      addToast(lang === 'ar' ? '⚠️ التعديل غير متاح في وضع التجربة' : '⚠️ Modification désactivée en mode Démo', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        const { error } = await supabase
          .from('products')
          .update({
            name_ar: formData.name_ar,
            name_fr: formData.name_fr,
            description_ar: formData.description_ar,
            description_fr: formData.description_fr,
            price: Number(formData.price),
            category: formData.category,
            image: formData.image,
            is_featured: formData.is_featured
          })
          .eq('id', editProductId);

        if (error) throw error;
        addToast(lang === 'ar' ? 'تم تحديث المنتج بنجاح!' : 'Produit mis à jour!', 'success');
        setIsEditing(false);
        setEditProductId(null);
      } else {
        const { error } = await supabase
          .from('products')
          .insert([{
            name_ar: formData.name_ar,
            name_fr: formData.name_fr,
            description_ar: formData.description_ar,
            description_fr: formData.description_fr,
            price: Number(formData.price),
            category: formData.category,
            image: formData.image,
            is_featured: formData.is_featured
          }]);

        if (error) throw error;
        addToast(lang === 'ar' ? 'تم إضافة المنتج بنجاح!' : 'Produit ajouté!', 'success');
      }

      setFormData({ 
        name_ar: '', name_fr: '', description_ar: '', description_fr: '', 
        price: '', category: 'kitchen', image: '', is_featured: false 
      });
      fetchProducts();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (p) => {
    setIsEditing(true);
    setEditProductId(p.id);
    setFormData({
      name_ar: p.name_ar,
      name_fr: p.name_fr,
      description_ar: p.description_ar,
      description_fr: p.description_fr,
      price: p.price,
      category: p.category,
      image: p.image,
      is_featured: p.is_featured || false
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('deleteConfirm'))) {
      if (isDemoMode) {
        addToast(lang === 'ar' ? 'لا يمكن الحذف في وضع التجربة' : 'Impossible de supprimer en Mode Démo', 'error');
        return;
      }
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        addToast(lang === 'ar' ? 'تم حذف المنتج!' : 'Produit supprimé!', 'success');
        fetchProducts();
      } catch (err) {
        addToast(err.message, 'error');
      }
    }
  };

  const pendingOrdersCount = useMemo(() => {
    return orders.filter(o => o.status === 'pending').length;
  }, [orders]);

  if (!isAuthenticated) {
    return (
      <div className="admin-login-wrap">
        <div className="admin-login-card animate-fade-in">
          <h2>{t('adminLogin')}</h2>
          {loginError && <div className="alert error" style={{ margin: '1rem 0' }}>{loginError}</div>}
          <form onSubmit={handleLogin} className="checkout-form" style={{ marginTop: '1.5rem' }}>
            <input 
              required 
              type="password" 
              placeholder={t('adminPassword')}
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
            <button type="submit" className="submit-btn" style={{ width: '100%' }}>
              {lang === 'ar' ? 'دخول' : 'Connexion'}
            </button>
          </form>
          <button onClick={() => navigate('/')} className="back-btn" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
            {t('backToStore')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`admin-page animate-fade-in ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>لوحة إدارة المتجر / Administration</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
              {t('tagline')}
            </p>
          </div>
          <button onClick={handleLogout} className="btn-outline" style={{ color: 'var(--primary)', borderColor: 'var(--primary)', padding: '0.5rem 1.2rem', fontSize: '0.88rem' }}>
            <LogOut size={16} />
            <span>{t('adminLogout')}</span>
          </button>
        </div>

        {isDemoMode && (
          <div className="alert" style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', marginBottom: '2rem' }}>
            <strong>⚠️ {lang === 'ar' ? 'وضع التجربة نشط' : 'Mode Démo Actif'}</strong>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              {lang === 'ar' 
                ? 'التطبيق غير متصل بـ Supabase. لوحة التحكم تعرض المنتجات المحلية والعمليات غير مفعلة.'
                : 'L\'application n\'est pas connectée à Supabase. Le mode démo est actif.'}
            </p>
          </div>
        )}

        <div className="admin-tabs">
          <button 
            className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag size={16} style={{ marginInlineEnd: '0.4rem', verticalAlign: 'middle' }} />
            {t('ordersTab')} ({orders.length})
          </button>
          <button 
            className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={16} style={{ marginInlineEnd: '0.4rem', verticalAlign: 'middle' }} />
            {t('productsTab')} ({products.length})
          </button>
        </div>

        <div className="admin-stats">
          <div className="admin-stat-card">
            <span className="admin-stat-num">{products.length}</span>
            <span className="admin-stat-label">{t('productsTab')}</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-num">{orders.length}</span>
            <span className="admin-stat-label">{t('totalOrders')}</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-num">{pendingOrdersCount}</span>
            <span className="admin-stat-label">{t('pendingOrders')}</span>
          </div>
        </div>

        {activeTab === 'orders' ? (
          <div className="orders-list">
            {loadingOrders ? (
              <div className="loading"><div className="spinner"></div></div>
            ) : orders.length > 0 ? (
              orders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-card-header">
                    <div>
                      <span className="order-id">#{order.id}</span>
                      <h4 className="order-customer" style={{ marginTop: '0.2rem' }}>{order.customer_name}</h4>
                      <p className="order-meta">{order.customer_phone} | {order.customer_address}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                      <span className={`order-status-badge status-${order.status}`}>
                        {t(`orderStatus_${order.status}`)}
                      </span>
                      <select 
                        value={order.status} 
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className="status-select"
                        disabled={isDemoMode}
                      >
                        <option value="pending">⏳ En attente</option>
                        <option value="confirmed">✅ Confirmé</option>
                        <option value="processing">🔄 En traitement</option>
                        <option value="delivered">📦 Livré</option>
                        <option value="cancelled">❌ Annulé</option>
                      </select>
                    </div>
                  </div>

                  <div className="order-items-preview">
                    {order.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', margin: '0.25rem 0' }}>
                        <span>• {item.name[lang]} (x{item.quantity})</span>
                        <span>{item.price * item.quantity} MAD</span>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px dashed var(--border)', marginTop: '0.5rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: '800' }}>
                      <span>{t('cartTotal')}:</span>
                      <span className="order-total">{order.total} MAD</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                لا توجد طلبات حالياً / Aucune commande
              </div>
            )}
          </div>
        ) : (
          <div className="admin-grid">
            <div className="admin-form-section">
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem' }}>
                {isEditing ? t('editProduct') : t('addProduct')}
              </h3>
              
              <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-group">
                  <label>اسم المنتج بالعربية / Nom (Arabe)</label>
                  <input required type="text" value={formData.name_ar} onChange={e => setFormData({...formData, name_ar: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Nom en Français</label>
                  <input required type="text" value={formData.name_fr} onChange={e => setFormData({...formData, name_fr: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>الوصف بالعربية / Description (Arabe)</label>
                  <textarea required rows={3} value={formData.description_ar} onChange={e => setFormData({...formData, description_ar: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Description en Français</label>
                  <textarea required rows={3} value={formData.description_fr} onChange={e => setFormData({...formData, description_fr: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>السعر / Prix (MAD)</label>
                  <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>القسم / Catégorie</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="kitchen">🍲 أواني / Ustensiles</option>
                    <option value="appliances">⚡ أجهزة / Électroménager</option>
                    <option value="decor">🏺 ديكور / Décoration</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'normal', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={formData.is_featured} 
                      onChange={e => setFormData({...formData, is_featured: e.target.checked})} 
                    />
                    <span>منتج مميز (الأكثر مبيعاً) / Produit Vedette</span>
                  </label>
                </div>

                <div className="form-group" style={{ borderTop: '1px dashed var(--border)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label>صورة المنتج / Image</label>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button type="button" className={`tab-btn`} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', border: '1px solid #ddd', background: imageType === 'upload' ? '#111' : '#fff', color: imageType === 'upload' ? '#fff' : '#333' }} onClick={() => setImageType('upload')}>Upload</button>
                      <button type="button" className={`tab-btn`} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', border: '1px solid #ddd', background: imageType === 'url' ? '#111' : '#fff', color: imageType === 'url' ? '#fff' : '#333' }} onClick={() => setImageType('url')}>URL</button>
                    </div>
                  </div>

                  {imageType === 'upload' ? (
                    <div className="upload-container">
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="admin-file-img" />
                      <label htmlFor="admin-file-img">
                        <span>📷</span>
                        <span style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                          {uploading ? 'جاري الرفع...' : 'اضغط لاختيار صورة'}
                        </span>
                      </label>
                      {imageError && <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.5rem' }}>{imageError}</div>}
                    </div>
                  ) : (
                    <input type="url" placeholder="https://example.com/image.jpg" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
                  )}

                  {formData.image && (
                    <img src={formData.image} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', marginTop: '1rem', border: '1px solid var(--border)' }} />
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" disabled={submitting || uploading} className="submit-btn" style={{ flex: 1 }}>
                    {isEditing ? t('saveProduct') : t('addProductBtn')}
                  </button>
                  {isEditing && (
                    <button type="button" onClick={() => { setIsEditing(false); setEditProductId(null); setFormData({ name_ar: '', name_fr: '', description_ar: '', description_fr: '', price: '', category: 'kitchen', image: '', is_featured: false }); }} className="submit-btn" style={{ background: '#666', flex: 0.4 }}>
                      {t('cancelEdit')}
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="admin-list-section">
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem' }}>{t('productsTab')} ({products.length})</h3>
              
              {loadingProducts ? (
                <div className="loading"><div className="spinner"></div></div>
              ) : (
                <div className="admin-products-list">
                  {products.map(p => (
                    <div key={p.id} className="admin-product-item">
                      <img src={p.image} alt={p.name_ar} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '600' }}>{lang === 'ar' ? p.name_ar : p.name_fr}</h4>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)' }}>{p.price} MAD</span>
                        {p.is_featured && <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.3rem', background: 'orange', color: 'white', borderRadius: '4px', marginInlineStart: '0.5rem' }}>Featured</span>}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleEdit(p)} className="remove-btn" style={{ color: 'blue' }}><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(p.id)} className="remove-btn"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
