import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { Star, ShoppingCart } from 'lucide-react';

export function ProductCard({ product }) {
  const { lang, t } = useLanguage();
  const { addToCart, toggleCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
    toggleCart(); // Open cart to show they added it
  };

  return (
    <div className="product-card">
      <div className="image-container">
        <img src={product.image} alt={product.name[lang]} loading="lazy" />
      </div>
      <div className="product-info">
        <h3>{product.name[lang]}</h3>
        <p className="description">{product.description[lang]}</p>
        <div className="rating">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={16} 
              className={i < Math.floor(product.rating) ? 'star-filled' : 'star-empty'} 
            />
          ))}
          <span className="rating-value">{product.rating}</span>
        </div>
        <div className="card-footer">
          <span className="price">{product.price} <small>{t('currency')}</small></span>
          <button className="add-to-cart" onClick={handleAddToCart}>
            <ShoppingCart size={18} />
            <span>{t('addToCart')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
