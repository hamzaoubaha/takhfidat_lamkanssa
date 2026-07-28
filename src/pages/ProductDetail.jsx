import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../supabaseClient';
import { products as mockProducts } from '../data/products';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ContactButtons } from '../components/ContactButtons';
import { CheckoutModal } from '../components/CheckoutModal';
import { ArrowLeft, ArrowRight, Star, ShoppingCart, MessageSquare, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const { addToCart, openCart } = useCart();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const isDemoMode = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('your-project-id');

  useEffect(() => {
    async function fetchProduct() {
      try {
        if (isDemoMode) {
          throw new Error('Supabase is not configured (Demo Mode)');
        }

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        setProduct({
          id: data.id,
          name: { ar: data.name_ar, fr: data.name_fr },
          description: { ar: data.description_ar, fr: data.description_fr },
          price: data.price,
          rating: data.rating,
          category: data.category,
          image: data.image,
          is_featured: data.is_featured
        });
      } catch (err) {
        console.warn('Using local mock products fallback for details:', err.message);
        const local = mockProducts.find(p => p.id === Number(id));
        setProduct(local || null);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id, isDemoMode]);

  const handleAddToCart = () => {
    if (!product) return;
    // Add multiple quantities
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    addToast(t('addedToCartMsg'), 'cart');
    openCart();
  };

  const handleOrderNow = () => {
    if (!product) return;
    const orderDetails = `- ${product.name[lang]} (${quantity}x) = ${product.price * quantity} MAD`;
    const message = `مرحباً، أود طلب المنتج التالي مباشرة:\n\n${orderDetails}\n\nالإجمالي: ${product.price * quantity} MAD`;
    const whatsappUrl = `https://wa.me/212657494705?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="app">
        <Header searchTerm="" setSearchTerm={() => {}} />
        <main className="main-content">
          <div className="loading">
            <div className="spinner"></div>
            <div>جاري التحميل... / Chargement...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="app">
        <Header searchTerm="" setSearchTerm={() => {}} />
        <main className="main-content" style={{ textAlign: 'center', padding: '5rem 0' }}>
          <h2>المنتج غير موجود / Produit non trouvé</h2>
          <button className="btn-primary" style={{ marginTop: '2rem' }} onClick={() => navigate('/')}>
            {t('backToStore')}
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`app ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
      <Header searchTerm="" setSearchTerm={() => {}} />
      <CheckoutModal />
      <ContactButtons />

      <main className="main-content">
        <div className="product-detail-page">
          <button className="back-btn" onClick={() => navigate('/')}>
            {lang === 'ar' ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
            <span>{t('backToStore')}</span>
          </button>

          <div className="product-detail-grid">
            <div className="detail-image-wrap">
              <img src={product.image} alt={product.name[lang]} />
            </div>

            <div className="detail-info">
              <span className="detail-category">{t(product.category)}</span>
              <h2 className="detail-name">{product.name[lang]}</h2>
              
              <div className="detail-rating">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    className={i < Math.floor(product.rating) ? 'star-filled' : 'star-empty'} 
                  />
                ))}
                <span className="detail-rating-count">({product.rating})</span>
              </div>

              <div className="detail-price-wrap">
                <span className="detail-price">{product.price}</span>
                <span className="detail-price-currency">{t('currency')}</span>
              </div>

              <p className="detail-desc">{product.description[lang]}</p>

              <div className="qty-section">
                <span className="qty-label">{t('quantity')}</span>
                <div className="qty-control">
                  <button 
                    className="qty-btn" 
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button 
                    className="qty-btn" 
                    onClick={() => setQuantity(prev => prev + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="detail-actions">
                <button className="btn-add-cart" onClick={handleAddToCart}>
                  <ShoppingCart size={18} />
                  <span>{t('addToCart')}</span>
                </button>
                <button className="btn-whatsapp" onClick={handleOrderNow}>
                  <MessageSquare size={18} />
                  <span>{t('orderViaWhatsapp')}</span>
                </button>
              </div>

              <div className="detail-badges">
                <div className="detail-badge">
                  <ShieldCheck size={16} className="detail-badge-icon" />
                  <span>ضمان الجودة / Garantie Qualité</span>
                </div>
                <div className="detail-badge">
                  <Truck size={16} className="detail-badge-icon" />
                  <span>توصيل سريع / Livraison Rapide</span>
                </div>
                <div className="detail-badge">
                  <RefreshCw size={16} className="detail-badge-icon" />
                  <span>استرجاع سهل / Retour Facile</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
