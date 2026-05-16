import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { X, Trash2 } from 'lucide-react';

export function CheckoutModal() {
  const { cart, isCartOpen, toggleCart, removeFromCart, clearCart } = useCart();
  const { lang, t } = useLanguage();
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

  if (!isCartOpen) return null;

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleOrder = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    let orderDetails = cart.map(item => `- ${item.name[lang]} (${item.quantity}x) = ${item.price * item.quantity} MAD`).join('\n');
    let message = `مرحباً، أود طلب المنتجات التالية:\n\n${orderDetails}\n\nالإجمالي: ${total} MAD\n\nالاسم: ${formData.name}\nالهاتف: ${formData.phone}\nالعنوان: ${formData.address}`;
    
    let whatsappUrl = `https://wa.me/212657494705?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    clearCart();
    toggleCart();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={toggleCart}><X /></button>
        <h2>{lang === 'ar' ? 'سلة المشتريات' : 'Panier'}</h2>
        
        {cart.length === 0 ? (
          <p className="empty-cart">{lang === 'ar' ? 'السلة فارغة' : 'Votre panier est vide'}</p>
        ) : (
          <>
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name[lang]} />
                  <div className="item-info">
                    <h4>{item.name[lang]}</h4>
                    <p>{item.price} MAD x {item.quantity}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="remove-btn"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
            
            <div className="total-section">
              <h3>{lang === 'ar' ? 'الإجمالي' : 'Total'}: {total} MAD</h3>
            </div>

            <form onSubmit={handleOrder} className="checkout-form">
              <input required type="text" placeholder={lang === 'ar' ? 'الاسم الكامل' : 'Nom Complet'} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input required type="tel" placeholder={lang === 'ar' ? 'رقم الهاتف' : 'Téléphone'} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              <textarea required placeholder={lang === 'ar' ? 'العنوان التفصيلي' : 'Adresse'} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
              <button type="submit" className="order-btn">
                {lang === 'ar' ? 'الطلب عبر الواتساب' : 'Commander via WhatsApp'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
