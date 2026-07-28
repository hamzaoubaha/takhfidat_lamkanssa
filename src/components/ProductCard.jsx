import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Star, ShoppingCart, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ProductCard({ product }) {
  const { lang, t } = useLanguage();
  const { addToCart, openCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.stopPropagation(); // Avoid navigating to details
    addToCart(product);
    addToast(t('addedToCartMsg'), 'cart');
    openCart();
  };

  const handleQuickView = (e) => {
    e.stopPropagation();
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="product-card" onClick={() => navigate(`/product/${product.id}`)}>
      {product.is_featured && (
        <span className="product-badge">{t('featured')}</span>
      )}
      <div className="image-container">
        <img src={product.image} alt={product.name[lang]} loading="lazy" />
        <div className="card-overlay">
          <button className="overlay-btn add" onClick={handleAddToCart}>
            <ShoppingCart size={16} />
            <span>{t('addToCart')}</span>
          </button>
          <button className="overlay-btn view" onClick={handleQuickView}>
            <Eye size={16} />
            <span>{t('quickView')}</span>
          </button>
        </div>
      </div>
      <div className="product-info">
        <span className="product-category-tag">{t(product.category)}</span>
        <h3>{product.name[lang]}</h3>
        <p className="description">{product.description[lang]}</p>
        <div className="rating">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={14} 
              className={i < Math.floor(product.rating) ? 'star-filled' : 'star-empty'} 
            />
          ))}
          <span className="rating-value">{product.rating}</span>
        </div>
        <div className="card-footer">
          <span className="price">{product.price} <small>{t('currency')}</small></span>
          <button className="add-to-cart" onClick={handleAddToCart}>
            <ShoppingCart size={16} />
            <span>{t('addToCart')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
