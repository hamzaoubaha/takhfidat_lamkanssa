import { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../supabaseClient';
import { products as mockProducts } from '../data/products';
import { AnnouncementBar } from '../components/AnnouncementBar';
import { Header } from '../components/Header';
import { HeroSection } from '../components/HeroSection';
import { CategoryFilter } from '../components/CategoryFilter';
import { ProductCard } from '../components/ProductCard';
import { CheckoutModal } from '../components/CheckoutModal';
import { ContactButtons } from '../components/ContactButtons';
import { Footer } from '../components/Footer';

export function Store() {
  const { lang, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Sort and Filter States
  const [sortBy, setSortBy] = useState('default');
  const [maxPrice, setMaxPrice] = useState('');

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
        if (isDemoMode) throw new Error('Supabase is not configured');

        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        
        if (!data || data.length === 0) throw new Error('No data');

        const formatted = data.map(p => ({
          id: p.id,
          name: { ar: p.name_ar, fr: p.name_fr },
          description: { ar: p.description_ar, fr: p.description_fr },
          price: p.price,
          rating: p.rating,
          category: p.category,
          image: p.image,
          is_featured: p.is_featured
        }));
        setProducts(formatted);
      } catch (err) {
        console.warn('Fallback to local products:', err.message);
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [isDemoMode]);

  // Combined filters & sorting
  const processedProducts = useMemo(() => {
    let result = [...products];

    // Filter by Category
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Filter by Search Term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name[lang].toLowerCase().includes(term) || 
        p.description[lang].toLowerCase().includes(term)
      );
    }

    // Filter by Price
    if (maxPrice !== '') {
      result = result.filter(p => p.price <= Number(maxPrice));
    }

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, selectedCategory, searchTerm, maxPrice, sortBy, lang]);

  return (
    <div className={`app ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
      <AnnouncementBar />
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      
      {isDemoMode && (
        <div className="demo-banner">
          <span>⚠️</span>
          <span>
            {lang === 'ar' 
              ? 'وضع التجربة نشط: التطبيق يعرض منتجات تجريبية محلية.' 
              : 'Mode Démo actif : Les produits de démonstration sont affichés.'}
          </span>
        </div>
      )}
      
      <HeroSection />
      
      {/* Dynamic filter and sorting bar */}
      <div className="filter-bar">
        <div className="filter-bar-inner">
          <div className="filter-group">
            <span className="filter-label">{t('sortBy')}</span>
            <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="default">{t('sortDefault')}</option>
              <option value="price-asc">{t('sortPriceAsc')}</option>
              <option value="price-desc">{t('sortPriceDesc')}</option>
              <option value="rating">{t('sortRating')}</option>
            </select>
          </div>

          <div className="filter-group price-range-group">
            <span className="filter-label">{t('maxPrice')}</span>
            <input 
              type="number" 
              className="price-input" 
              placeholder="e.g. 500" 
              value={maxPrice} 
              onChange={e => setMaxPrice(e.target.value)} 
            />
            <span className="filter-label">{t('currency')}</span>
          </div>

          <div className="results-count">
            {processedProducts.length} {t('resultsFor')}
          </div>
        </div>
      </div>

      <CheckoutModal />
      <ContactButtons />
      
      <main className="main-content" id="store-products">
        <CategoryFilter 
          selectedCategory={selectedCategory} 
          setSelectedCategory={setSelectedCategory} 
        />
        
        <div className="section-header">
          <h3 className="section-title">
            {selectedCategory === 'all' ? t('all') : t(selectedCategory)}
          </h3>
          <div className="section-divider"></div>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <div>جاري التحميل... / Chargement...</div>
          </div>
        ) : processedProducts.length > 0 ? (
          <div className="product-grid">
            {processedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="no-products">
            <span className="no-products-icon">🥣</span>
            <h3>{t('noProducts')}</h3>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
