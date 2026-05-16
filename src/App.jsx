import { useState, useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductCard } from './components/ProductCard';
import { CheckoutModal } from './components/CheckoutModal';
import { Admin } from './pages/Admin';

function Store() {
  const { lang, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    fetch('http://localhost:3000/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch products', err);
        setLoading(false);
      });
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchSearch = product.name[lang].toLowerCase().includes(searchTerm.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [searchTerm, selectedCategory, lang, products]);

  return (
    <div className={`app ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <CheckoutModal />
      
      <main className="main-content">
        <CategoryFilter 
          selectedCategory={selectedCategory} 
          setSelectedCategory={setSelectedCategory} 
        />
        
        {loading ? (
          <div className="loading">جاري التحميل... / Chargement...</div>
        ) : filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="no-products">
            <h2>{t('noProducts')}</h2>
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<Store />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </CartProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
