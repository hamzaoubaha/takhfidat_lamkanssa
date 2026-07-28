import { useLanguage } from '../context/LanguageContext';
import { Sparkles, UtensilsCrossed, Zap, Flower2 } from 'lucide-react';

export function CategoryFilter({ selectedCategory, setSelectedCategory }) {
  const { t } = useLanguage();

  const categories = [
    { id: 'all', label: t('all'), icon: <Sparkles size={18} /> },
    { id: 'kitchen', label: t('kitchen'), icon: <UtensilsCrossed size={18} /> },
    { id: 'appliances', label: t('appliances'), icon: <Zap size={18} /> },
    { id: 'decor', label: t('decor'), icon: <Flower2 size={18} /> }
  ];

  return (
    <div className="category-filter">
      {categories.map(cat => (
        <button
          key={cat.id}
          className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
          onClick={() => setSelectedCategory(cat.id)}
        >
          <span className="cat-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>{cat.icon}</span>
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  );
}
