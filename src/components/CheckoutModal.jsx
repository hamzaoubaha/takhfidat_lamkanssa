import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../supabaseClient';
import { X, Trash2, Plus, Minus, MessageSquare } from 'lucide-react';

export function CheckoutModal() {
  const { cart, isCartOpen, toggleCart, removeFromCart, increaseQty, decreaseQty, clearCart, cartTotal } = useCart();
  const { lang, t } = useLanguage();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const [submitting, setSubmitting] = useState(false);

  if (!isCartOpen) return null;

  const isDemoMode = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('your-project-id');

  const freeShippingThreshold = 500;
  const shippingLeft = freeShippingThreshold - cartTotal;
  const isFreeShipping = shippingLeft <= 0;
  const shippingPercent = Math.min((cartTotal / freeShippingThreshold) * 100, 100);

  const handleOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setSubmitting(true);

    const orderItems = cart.map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price
    }));

    try {
      if (!isDemoMode) {
        const { error } = await supabase.from('orders').insert([{
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_address: formData.address,
          items: orderItems,
          total: cartTotal,
          status: 'pending'
        }]);
        if (error) throw error;
        addToast(t('orderSaved'), 'success');
      } else {
        console.warn('Demo Mode: Supabase not configured. Order not saved in DB.');
      }
    } catch (err) {
      console.error('Failed to save order:', err);
      addToast(t('orderError'), 'error');
    } finally {
      setSubmitting(false);
    }

    // Always fallback to opening WhatsApp
    const orderDetails = cart.map(item => 
      `- ${item.name[lang]} (${item.quantity}x) = ${item.price * item.quantity} MAD`
    ).join('\n');

    const message = `مرحباً، أود طلب المنتجات التالية:\n\n${orderDetails}\n\nالإجمالي: ${cartTotal} MAD\n\nالاسم: ${formData.name}\nالهاتف: ${formData.phone}\nالعنوان: ${formData.address}`;
    const whatsappUrl = `https://wa.me/212657494705?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    clearCart();
    toggleCart();
  };

  return (
    <div className="modal-overlay" onClick={toggleCart}>
      <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span>🛒</span>
            <h3>{t('cartTitle')}</h3>
            <span className="modal-count">{cart.length}</span>
          </div>
          <button className="close-btn" onClick={toggleCart}><X size={18} /></button>
        </div>

        {cart.length > 0 && (
          <div className="shipping-bar">
            {isFreeShipping ? (
              <div className="shipping-bar-text done">{t('freeShippingDone')}</div>
            ) : (
              <div className="shipping-bar-text">
                {lang === 'ar' 
                  ? `أضف ${shippingLeft} ${t('freeShippingLeft')}`
                  : `Plus que ${shippingLeft} ${t('freeShippingLeft')}`}
              </div>
            )}
            <div className="shipping-progress">
              <div className="shipping-fill" style={{ width: `${shippingPercent}%` }}></div>
            </div>
          </div>
        )}
        
        {cart.length === 0 ? (
          <div className="cart-empty">
            <span className="cart-empty-icon">🍳</span>
            <h3>{t('cartEmpty')}</h3>
            <p>{t('cartEmptyDesc')}</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name[lang]} />
                  <div className="item-info">
                    <h4>{item.name[lang]}</h4>
                    <p className="item-price">{item.price} MAD</p>
                  </div>
                  <div className="cart-qty">
                    <button className="cart-qty-btn" onClick={() => decreaseQty(item.id)}><Minus size={12} /></button>
                    <span className="cart-qty-num">{item.quantity}</span>
                    <button className="cart-qty-btn" onClick={() => increaseQty(item.id)}><Plus size={12} /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="remove-btn"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
            
            <div className="cart-footer">
              <div className="cart-total-row">
                <span>{t('cartTotal')}:</span>
                <span className="cart-total-amount">{cartTotal} MAD</span>
              </div>

              <form onSubmit={handleOrder} className="checkout-form">
                <input 
                  required 
                  type="text" 
                  placeholder={t('customerName')} 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
                <input 
                  required 
                  type="tel" 
                  placeholder={t('customerPhone')} 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                />
                <textarea 
                  required 
                  placeholder={t('customerAddress')} 
                  value={formData.address} 
                  onChange={e => setFormData({...formData, address: e.target.value})}
                ></textarea>
                <button type="submit" className="order-btn" disabled={submitting}>
                  <MessageSquare size={18} />
                  <span>{t('orderViaWhatsapp')}</span>
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
