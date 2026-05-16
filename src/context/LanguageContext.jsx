import { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

const translations = {
  ar: {
    title: 'تخفيضات لمكانسة',
    searchPlaceholder: 'ابحث عن منتج...',
    all: 'الكل',
    kitchen: 'أواني',
    decor: 'ديكورات',
    appliances: 'أجهزة كهربائية',
    addToCart: 'أضف إلى السلة',
    currency: 'درهم',
    noProducts: 'لا توجد منتجات مطابقة'
  },
  fr: {
    title: 'Takhfidat Lamkanssa',
    searchPlaceholder: 'Rechercher un produit...',
    all: 'Tous',
    kitchen: 'Ustensiles',
    decor: 'Décoration',
    appliances: 'Électroménager',
    addToCart: 'Ajouter au panier',
    currency: 'MAD',
    noProducts: 'Aucun produit trouvé'
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('fr'); // Default French

  const toggleLanguage = () => {
    setLang(prev => prev === 'ar' ? 'fr' : 'ar');
  };

  const t = (key) => translations[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
