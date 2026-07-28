import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { Search, ShoppingCart, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Header({ searchTerm, setSearchTerm }) {
  const { lang, toggleLanguage, t } = useLanguage();
  const { cartCount, toggleCart } = useCart();

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/" className="logo-link">
            <h1>{t('title')}</h1>
            <span className="logo-tagline">{t('tagline')}</span>
          </Link>
        </div>
        
        <div className="search-bar">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder={t('searchPlaceholder')} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="actions">
          <button className="icon-btn lang-toggle" onClick={toggleLanguage} aria-label="Toggle Language">
            <Globe size={18} />
            <span>{lang === 'ar' ? 'FR' : 'عربي'}</span>
          </button>
          <button className="icon-btn cart-btn" aria-label="Cart" onClick={toggleCart} style={{position: 'relative'}}>
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}
