import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../supabaseClient'; // Import Supabase

export function Admin() {
  const { lang } = useLanguage();
  const [formData, setFormData] = useState({
    name_ar: '', name_fr: '', description_ar: '', description_fr: '',
    price: '', category: 'kitchen', image: ''
  });
  const [message, setMessage] = useState('');

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

  return (
    <div className="admin-page">
      <div className="admin-container">
        <h2>لوحة التحكم / Panneau d'administration</h2>
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
