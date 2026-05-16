import { useLanguage } from '../context/LanguageContext';

export function CategoryFilter({ selectedCategory, setSelectedCategory }) {
  const { t } = useLanguage();
  
  const categories = [
    { id: 'all', label: t('all') },
    { id: 'kitchen', label: t('kitchen') },
    { id: 'decor', label: t('decor') },
    { id: 'appliances', label: t('appliances') },
  ];

  return (
    <div className="category-filter">
      {categories.map(cat => (
        <button
          key={cat.id}
          className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
          onClick={() => setSelectedCategory(cat.id)}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
