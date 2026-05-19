import { useState, useMemo, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductCard } from './components/ProductCard';
import { CheckoutModal } from './components/CheckoutModal';
import { Admin } from './pages/Admin';
import { supabase } from './supabaseClient'; // Import Supabase
import { products as mockProducts } from './data/products'; // Import local mock products

function Store() {
  const { lang, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const isDemoMode = useMemo(() => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    return !url || url.includes('your-project-id') || url === '';
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        if (isDemoMode) {
          throw new Error('Supabase is not configured (Demo Mode)');
        }

        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        
        if (!data || data.length === 0) {
          throw new Error('No data returned from Supabase');
        }

        // Format for frontend based on database columns
        const formatted = data.map(p => ({
          id: p.id,
          name: { ar: p.name_ar, fr: p.name_fr },
          description: { ar: p.description_ar, fr: p.description_fr },
          price: p.price,
          rating: p.rating,
          category: p.category,
          image: p.image
        }));
        setProducts(formatted);
      } catch (err) {
        console.warn('Using local mock products fallback:', err.message);
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [isDemoMode]);

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
      {isDemoMode && (
        <div className="demo-banner" style={{
          background: 'linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%)',
          color: '#856404',
          padding: '0.75rem 1.5rem',
          textAlign: 'center',
          fontSize: '0.9rem',
          borderBottom: '1px solid #ffeeba',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: '500'
        }}>
          <span>⚠️</span>
          <span>
            {lang === 'ar' 
              ? 'وضع التجربة نشط: التطبيق غير متصل بـ Supabase. يتم عرض المنتجات التجريبية المحلية.' 
              : 'Mode Démo actif : L\'application n\'est pas connectée à Supabase. Les produits de démonstration locaux sont affichés.'}
          </span>
        </div>
      )}
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
    <HashRouter>
      <LanguageProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<Store />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </CartProvider>
      </LanguageProvider>
    </HashRouter>
  );
}

export default App;
