import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { Search, ShoppingCart, Globe, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Header({ searchTerm, setSearchTerm }) {
  const { lang, toggleLanguage, t } = useLanguage();
  const { cart, toggleCart } = useCart();

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/" style={{textDecoration: 'none'}}><h1>{t('title')}</h1></Link>
        </div>
        
        <div className="search-bar">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder={t('searchPlaceholder')} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="actions">
          <Link to="/admin" className="icon-btn" aria-label="Admin">
            <Shield size={20} />
          </Link>
          <button className="icon-btn lang-toggle" onClick={toggleLanguage} aria-label="Toggle Language">
            <Globe size={20} />
            <span>{lang === 'ar' ? 'FR' : 'عربي'}</span>
          </button>
          <button className="icon-btn cart-btn" aria-label="Cart" onClick={toggleCart} style={{position: 'relative'}}>
            <ShoppingCart size={24} />
            {cartItemsCount > 0 && <span className="cart-badge">{cartItemsCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}
