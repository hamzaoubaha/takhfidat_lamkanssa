import { Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function ContactButtons() {
  const { t } = useLanguage();

  return (
    <div className="contact-fab-container">
      {/* Phone Call Button */}
      <a 
        href="tel:+212657494705" 
        className="contact-fab-btn phone-btn"
        aria-label={t('phoneCall')}
        title={t('phoneCall')}
      >
        <Phone size={24} />
        <span className="tooltip-text">{t('phoneCall')}</span>
      </a>

      {/* WhatsApp Button */}
      <a 
        href="https://wa.me/212657494705" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="contact-fab-btn whatsapp-btn"
        aria-label={t('whatsappContact')}
        title={t('whatsappContact')}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.982L2 22l5.233-1.371a9.936 9.936 0 0 0 4.779 1.218h.004c5.505 0 9.989-4.478 9.99-9.986A9.998 9.998 0 0 0 12.012 2zm5.735 14.13c-.315.888-1.54 1.634-2.126 1.717-.577.081-1.314.148-3.923-1.002-3.333-1.47-5.467-5.01-5.633-5.244-.167-.234-1.33-1.87-1.33-3.567 0-1.696.84-2.53 1.139-2.822.298-.292.648-.365.865-.365.216 0 .432.002.618.01.196.008.459-.077.717.575.266.673.91 2.378.988 2.545.08.167.133.363.023.593-.11.23-.166.365-.333.573-.167.208-.349.467-.499.626-.167.177-.341.37-.147.72.193.349.859 1.492 1.84 2.41 1.266 1.185 2.327 1.554 2.659 1.725.333.172.53.148.729-.081.2-.23.856-.995 1.085-1.334.23-.339.46-.282.775-.157.316.126 2.003 1.002 2.345 1.182.343.18.572.27.655.421.083.15.083.87-.232 1.758z"/>
        </svg>
        <span className="tooltip-text">{t('whatsappContact')}</span>
      </a>
    </div>
  );
}
