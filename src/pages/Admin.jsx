import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../supabaseClient'; // Import Supabase

export function Admin() {
  const { lang } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('admin_authenticated') === 'true'
  );
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [formData, setFormData] = useState({
    name_ar: '', name_fr: '', description_ar: '', description_fr: '',
    price: '', category: 'kitchen', image: ''
  });
  const [message, setMessage] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([formData]);

      if (error) {
        setMessage('خطأ في إضافة المنتج / Erreur: ' + error.message);
      } else {
        setMessage('تم إضافة المنتج بنجاح! / Produit ajouté avec succès!');
        setFormData({ name_ar: '', name_fr: '', description_ar: '', description_fr: '', price: '', category: 'kitchen', image: '' });
      }
    } catch (err) {
      setMessage('تعذر الاتصال بالخادم / Erreur de serveur');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="admin-container" style={{ maxWidth: '400px', width: '100%', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-color)' }}>
            {lang === 'ar' ? 'الدخول للوحة التحكم' : 'Accès Administration'}
          </h2>
          {loginError && <div className="alert" style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', textAlign: 'center' }}>{loginError}</div>}
          <form onSubmit={handleLogin} className="admin-form">
            <div className="form-group">
              <label>{lang === 'ar' ? 'كلمة المرور' : 'Mot de passe'}</label>
              <input 
                required 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd', marginTop: '0.5rem' }}
              />
            </div>
            <button type="submit" className="submit-btn" style={{ width: '100%', padding: '0.75rem', marginTop: '1rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              {lang === 'ar' ? 'دخول' : 'Connexion'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>لوحة التحكم / Panneau d'administration</h2>
          <button onClick={handleLogout} className="submit-btn" style={{ background: '#ef4444', padding: '0.5rem 1rem', width: 'auto', margin: 0 }}>
            {lang === 'ar' ? 'تسجيل الخروج' : 'Déconnexion'}
          </button>
        </div>
        {message && <div className="alert">{message}</div>}
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label>اسم المنتج (عربي)</label>
            <input required type="text" value={formData.name_ar} onChange={e => setFormData({...formData, name_ar: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Nom du produit (Français)</label>
            <input required type="text" value={formData.name_fr} onChange={e => setFormData({...formData, name_fr: e.target.value})} />
          </div>
          <div className="form-group">
            <label>الوصف (عربي)</label>
            <textarea required value={formData.description_ar} onChange={e => setFormData({...formData, description_ar: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Description (Français)</label>
            <textarea required value={formData.description_fr} onChange={e => setFormData({...formData, description_fr: e.target.value})} />
          </div>
          <div className="form-group">
            <label>السعر / Prix (MAD)</label>
            <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
          </div>
          <div className="form-group">
            <label>القسم / Catégorie</label>
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              <option value="kitchen">أواني / Ustensiles</option>
              <option value="decor">ديكورات / Décoration</option>
              <option value="appliances">أجهزة / Électroménager</option>
            </select>
          </div>
          <div className="form-group">
            <label>رابط الصورة / Lien d'image</label>
            <input required type="url" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
          </div>
          <button type="submit" className="submit-btn">إضافة المنتج / Ajouter</button>
        </form>
      </div>
    </div>
  );
}
