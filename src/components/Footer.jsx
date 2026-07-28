import { useLanguage } from '../context/LanguageContext';
import { Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <h3 className="footer-logo">{t('title')}</h3>
          <p className="footer-tagline">{t('footerTagline')}</p>
          <div className="footer-social">
            <a href="https://wa.me/212657494705" target="_blank" rel="noreferrer" className="social-btn">WA</a>
            <a href="tel:+212657494705" className="social-btn">Call</a>
          </div>
        </div>
        
        <div className="footer-section">
          <h4>{t('footerQuickLinks')}</h4>
          <ul className="footer-links">
            <li><Link to="/">{t('footerStore')}</Link></li>
            <li><Link to="/admin">{t('footerAdmin')}</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>{t('footerContact')}</h4>
          <div className="footer-contact-item">
            <Phone size={16} className="footer-contact-icon" />
            <span>+212 657-494705</span>
          </div>
          <div className="footer-contact-item">
            <MapPin size={16} className="footer-contact-icon" />
            <span>حي لمكانسة، الدار البيضاء، المغرب</span>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p className="footer-rights">{t('footerRights')}</p>
        <p className="footer-made">Made with <span>♥</span> in Morocco</p>
      </div>
    </footer>
  );
}
