import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../supabaseClient'; // Import Supabase

export function Admin() {
  const { lang } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('admin_authenticated') === 'true'
  );
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name_ar: '', name_fr: '', description_ar: '', description_fr: '',
    price: '', category: 'kitchen', image: ''
  });
  
  // App States
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageType, setImageType] = useState('upload'); // 'upload' or 'url'
  const [imageError, setImageError] = useState('');
  const [message, setMessage] = useState('');
  
  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editProductId, setEditProductId] = useState(null);

  // Check and Fetch products when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
    }
  }, [isAuthenticated]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
    if (password === correctPassword) {
      setIsAuthenticated(true);
      localStorage.setItem('admin_authenticated', 'true');
      setLoginError('');
    } else {
      setLoginError(lang === 'ar' ? 'كلمة المرور غير صحيحة!' : 'Mot de passe incorrect!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setImageError('');
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image: publicUrl }));
      setMessage(lang === 'ar' ? 'تم رفع الصورة بنجاح!' : 'Image téléchargée avec succès!');
    } catch (err) {
      console.error(err);
      setImageError(
        lang === 'ar' 
          ? 'فشل رفع الصورة. يرجى التأكد من إنشاء Bucket باسم "product-images" وجعله Public في Supabase.' 
          : 'Échec du chargement de l\'image. Assurez-vous d\'avoir créé un bucket "product-images" et de l\'avoir rendu Public sur Supabase.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      if (isEditing) {
        // Update product
        const { error } = await supabase
          .from('products')
          .update({
            name_ar: formData.name_ar,
            name_fr: formData.name_fr,
            description_ar: formData.description_ar,
            description_fr: formData.description_fr,
            price: Number(formData.price),
            category: formData.category,
            image: formData.image
          })
          .eq('id', editProductId);

        if (error) throw error;
        setMessage(lang === 'ar' ? 'تم تحديث المنتج بنجاح!' : 'Produit mis à jour avec succès!');
        setIsEditing(false);
        setEditProductId(null);
      } else {
        // Insert new product
        const { error } = await supabase
          .from('products')
          .insert([{
            name_ar: formData.name_ar,
            name_fr: formData.name_fr,
            description_ar: formData.description_ar,
            description_fr: formData.description_fr,
            price: Number(formData.price),
            category: formData.category,
            image: formData.image
          }]);

        if (error) throw error;
        setMessage(lang === 'ar' ? 'تم إضافة المنتج بنجاح!' : 'Produit ajouté avec succès!');
      }

      setFormData({ 
        name_ar: '', name_fr: '', description_ar: '', description_fr: '', 
        price: '', category: 'kitchen', image: '' 
      });
      fetchProducts();
    } catch (err) {
      setMessage('خطأ / Erreur: ' + err.message);
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
      image: p.image
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const confirmMsg = lang === 'ar' 
      ? 'هل أنت متأكد من رغبتك في حذف هذا المنتج نهائياً؟' 
      : 'Êtes-vous sûr de vouloir supprimer ce produit définitivement ?';
      
    if (window.confirm(confirmMsg)) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);

        if (error) throw error;
        setMessage(lang === 'ar' ? 'تم حذف المنتج بنجاح!' : 'Produit supprimé avec succès!');
        
        // If we were editing the deleted product, reset editing mode
        if (isEditing && editProductId === id) {
          setIsEditing(false);
          setEditProductId(null);
          setFormData({ 
            name_ar: '', name_fr: '', description_ar: '', description_fr: '', 
            price: '', category: 'kitchen', image: '' 
          });
        }
        
        fetchProducts();
      } catch (err) {
        setMessage('خطأ أثناء الحذف / Erreur: ' + err.message);
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditProductId(null);
    setFormData({ 
      name_ar: '', name_fr: '', description_ar: '', description_fr: '', 
      price: '', category: 'kitchen', image: '' 
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-page animate-fade-in" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="admin-container" style={{ maxWidth: '400px', width: '100%', padding: '2.5rem 2rem', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontWeight: '700', color: 'var(--text-main)' }}>
            {lang === 'ar' ? 'الدخول للوحة التحكم' : 'Accès Administration'}
          </h2>
          {loginError && <div className="alert" style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>{loginError}</div>}
          <form onSubmit={handleLogin} className="admin-form" style={{ marginTop: 0 }}>
            <div className="form-group">
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{lang === 'ar' ? 'كلمة المرور' : 'Mot de passe'}</label>
              <input 
                required 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '0.5rem', outline: 'none' }}
              />
            </div>
            <button type="submit" className="submit-btn" style={{ width: '100%', padding: '0.9rem', marginTop: '1.5rem', background: '#111', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'var(--transition)' }}>
              {lang === 'ar' ? 'دخول' : 'Connexion'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page animate-fade-in">
      <div className="admin-container" style={{ maxWidth: '1200px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '700' }}>لوحة التحكم / Panneau d'administration</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
              {lang === 'ar' ? 'إدارة المنتجات، الإضافة، التعديل والحذف' : 'Gérer les produits, ajouter, modifier et supprimer'}
            </p>
          </div>
          <button onClick={handleLogout} className="submit-btn" style={{ background: '#ef4444', padding: '0.6rem 1.2rem', width: 'auto', margin: 0, borderRadius: '50px', fontSize: '0.9rem' }}>
            {lang === 'ar' ? 'تسجيل الخروج' : 'Déconnexion'}
          </button>
        </div>

        {message && <div className="alert animate-fade-in" style={{ marginBottom: '2rem' }}>{message}</div>}

        <div className="admin-grid">
          {/* Form Side */}
          <div className="admin-form-section">
            <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
              {isEditing 
                ? (lang === 'ar' ? '📝 تعديل المنتج الحالي' : '📝 Modifier le produit')
                : (lang === 'ar' ? '➕ إضافة منتج جديد' : '➕ Ajouter un nouveau produit')
              }
            </h3>
            
            <form onSubmit={handleSubmit} className="admin-form" style={{ marginTop: 0, padding: '1.5rem', background: '#fcfcfc', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              <div className="form-group">
                <label>اسم المنتج (عربي)</label>
                <input required type="text" placeholder="مثال: طقم طناجر فاخر" value={formData.name_ar} onChange={e => setFormData({...formData, name_ar: e.target.value})} />
              </div>
              
              <div className="form-group">
                <label>Nom du produit (Français)</label>
                <input required type="text" placeholder="Ex: Batterie de cuisine Luxe" value={formData.name_fr} onChange={e => setFormData({...formData, name_fr: e.target.value})} />
              </div>
              
              <div className="form-group">
                <label>الوصف (عربي)</label>
                <textarea required rows="3" placeholder="اكتب وصفاً جذاباً للمنتج..." value={formData.description_ar} onChange={e => setFormData({...formData, description_ar: e.target.value})} />
              </div>
              
              <div className="form-group">
                <label>Description (Français)</label>
                <textarea required rows="3" placeholder="Description attrayante..." value={formData.description_fr} onChange={e => setFormData({...formData, description_fr: e.target.value})} />
              </div>
              
              <div className="form-group">
                <label>السعر / Prix (MAD)</label>
                <input required type="number" placeholder="0.00" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
              
              <div className="form-group">
                <label>القسم / Catégorie</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="kitchen">أواني / Ustensiles</option>
                  <option value="decor">ديكورات / Décoration</option>
                  <option value="appliances">أجهزة / Électroménager</option>
                </select>
              </div>

              {/* Image Input Options */}
              <div className="form-group" style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>صورة المنتج / Image</span>
                  <div className="image-tabs" style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      type="button" 
                      onClick={() => setImageType('upload')}
                      className={`tab-btn ${imageType === 'upload' ? 'active' : ''}`}
                      style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #ddd', background: imageType === 'upload' ? '#111' : '#fff', color: imageType === 'upload' ? '#fff' : '#333', cursor: 'pointer' }}
                    >
                      {lang === 'ar' ? 'رفع ملف' : 'Uploader file'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setImageType('url')}
                      className={`tab-btn ${imageType === 'url' ? 'active' : ''}`}
                      style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #ddd', background: imageType === 'url' ? '#111' : '#fff', color: imageType === 'url' ? '#fff' : '#333', cursor: 'pointer' }}
                    >
                      {lang === 'ar' ? 'رابط خارجي' : 'Lien URL'}
                    </button>
                  </div>
                </label>

                {imageType === 'upload' ? (
                  <div className="upload-container" style={{ marginTop: '0.5rem' }}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      id="image-file-input"
                    />
                    <label 
                      htmlFor="image-file-input"
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', border: '2px dashed var(--primary-color)', borderRadius: '8px', background: '#fdfbf7', cursor: 'pointer', textAlign: 'center', transition: 'var(--transition)' }}
                    >
                      <span style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📷</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                        {uploading 
                          ? (lang === 'ar' ? 'جاري الرفع...' : 'Téléchargement...') 
                          : (lang === 'ar' ? 'اضغط لاختيار صورة من جهازك' : 'Cliquez pour choisir une image')
                        }
                      </span>
                    </label>
                    {imageError && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem', lineHeight: '1.4' }}>{imageError}</div>}
                  </div>
                ) : (
                  <input 
                    type="url" 
                    placeholder="https://example.com/image.jpg" 
                    value={formData.image} 
                    onChange={e => setFormData({...formData, image: e.target.value})} 
                    style={{ marginTop: '0.5rem' }}
                  />
                )}

                {formData.image && (
                  <div className="image-preview" style={{ marginTop: '1rem', position: 'relative', display: 'inline-block' }}>
                    <img 
                      src={formData.image} 
                      alt="Preview" 
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, image: ''})}
                      style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" disabled={submitting || uploading} className="submit-btn" style={{ flex: 1 }}>
                  {submitting 
                    ? (lang === 'ar' ? 'جاري الحفظ...' : 'Enregistrement...') 
                    : isEditing 
                      ? (lang === 'ar' ? 'حفظ التعديلات' : 'Enregistrer')
                      : (lang === 'ar' ? 'إضافة المنتج' : 'Ajouter')
                  }
                </button>
                {isEditing && (
                  <button 
                    type="button" 
                    onClick={handleCancelEdit} 
                    className="submit-btn" 
                    style={{ background: '#666', flex: 0.5 }}
                  >
                    {lang === 'ar' ? 'إلغاء' : 'Annuler'}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List Side */}
          <div className="admin-list-section">
            <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
              📦 {lang === 'ar' ? `المنتجات الحالية (${products.length})` : `Produits existants (${products.length})`}
            </h3>

            {loadingProducts ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                {lang === 'ar' ? 'جاري تحميل المنتجات...' : 'Chargement des produits...'}
              </div>
            ) : products.length > 0 ? (
              <div className="admin-products-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '700px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {products.map(p => (
                  <div key={p.id} className="admin-product-item" style={{ display: 'flex', gap: '1rem', background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', transition: 'var(--transition)' }}>
                    <img 
                      src={p.image} 
                      alt={p.name_ar} 
                      style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px', background: '#f5f5f5' }}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100'; }}
                    />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '600', margin: 0 }}>
                          {lang === 'ar' ? p.name_ar : p.name_fr}
                        </h4>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', background: '#f0f0f0', padding: '0.1rem 0.4rem', borderRadius: '4px', color: 'var(--text-muted)' }}>
                            {p.category === 'kitchen' ? (lang === 'ar' ? 'أواني' : 'Ustensiles') : p.category === 'decor' ? (lang === 'ar' ? 'ديكور' : 'Décor') : (lang === 'ar' ? 'أجهزة' : 'Électro')}
                          </span>
                          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary-color)' }}>
                            {p.price} MAD
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                        <button 
                          onClick={() => handleEdit(p)} 
                          style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', padding: 0 }}
                        >
                          {lang === 'ar' ? '✏️ تعديل' : '✏️ Modifier'}
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)} 
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', padding: 0 }}
                        >
                          {lang === 'ar' ? '🗑️ حذف' : '🗑️ Supprimer'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed var(--border-color)', borderRadius: '12px', color: 'var(--text-muted)' }}>
                {lang === 'ar' ? 'لا يوجد أي منتجات حالياً.' : 'Aucun produit disponible.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

