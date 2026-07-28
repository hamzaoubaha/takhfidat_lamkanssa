import { useLanguage } from '../context/LanguageContext';

export function AnnouncementBar() {
  const { t } = useLanguage();

  return (
    <div className="announcement-bar">
      <div className="announcement-track">
        <span>{t('announcement1')}</span>
        <span>•</span>
        <span>{t('announcement2')}</span>
        <span>•</span>
        <span>{t('announcement3')}</span>
        <span>•</span>
        <span>{t('announcement1')}</span>
        <span>•</span>
        <span>{t('announcement2')}</span>
        <span>•</span>
        <span>{t('announcement3')}</span>
      </div>
    </div>
  );
}
