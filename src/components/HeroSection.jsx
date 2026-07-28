import { useLanguage } from '../context/LanguageContext';

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <div className="hero">
      <div className="hero-bg"></div>
      <div className="hero-overlay"></div>
      <div className="hero-pattern"></div>
      <div className="hero-content">
        <span className="hero-badge">
          <span>✨</span> {t('bestOffer')}
        </span>
        <h2 className="hero-title">
          {t('heroTitle')}
          <span className="hero-title-accent">{t('heroSubtitle')}</span>
        </h2>
        <p className="hero-desc">
          {t('heroDesc')}
        </p>
        <div className="hero-actions">
          <a href="#store-products" className="btn-primary">
            {t('heroCTA')}
          </a>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-num">100%</span>
            <span className="hero-stat-label">أصلي / Authentique</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-num">+5000</span>
            <span className="hero-stat-label">عميل سعيد / Clients</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-num">24h/7</span>
            <span className="hero-stat-label">دعم مستمر / Support</span>
          </div>
        </div>
      </div>
    </div>
  );
}
