import { useLanguage } from '../context/LanguageContext';

export function CategoryFilter({ selectedCategory, setSelectedCategory }) {
  const { t } = useLanguage();

  const categories = [
    { id: 'all', label: t('all'), icon: '✨' },
    { id: 'kitchen', label: t('kitchen'), icon: '🍲' },
    { id: 'appliances', label: t('appliances'), icon: '⚡' },
    { id: 'decor', label: t('decor'), icon: '🏺' }
  ];

  return (
    <div className="category-filter">
      {categories.map(cat => (
        <button
          key={cat.id}
          className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
          onClick={() => setSelectedCategory(cat.id)}
        >
          <span className="cat-icon">{cat.icon}</span>
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  );
}
