// İlk-ziyaret çerez/gizlilik bildirimi — alt-sabit ince şerit (modal DEĞİL, sayfa akışını engellemez).
// Kabul/Red YOK: tek "Tamam" butonu. Tamam'a basınca localStorage'a işaretlenir, bir daha çıkmaz.
// Yalnız ana BeyLink host'unda render edilir (App.jsx branded dalında mount EDİLMEZ).
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';

const ACK_KEY = 'beylink_notice_ack';

export function CookieNotice() {
  const { t } = useLanguage();
  // localStorage erişilemezse (gizli mod vb.) akışı bozma → banner'ı bir kez göster, sessiz geç.
  const [visible, setVisible] = useState(() => {
    try {
      return localStorage.getItem(ACK_KEY) !== '1';
    } catch {
      return true;
    }
  });

  if (!visible) return null;

  const accept = () => {
    try {
      localStorage.setItem(ACK_KEY, '1');
    } catch {
      // yerel depolama yoksa yok say — yine de bu oturumda gizle
    }
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label={t('cookieNotice.text')}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 shadow-card backdrop-blur"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-ink-soft sm:text-sm">
          {t('cookieNotice.text')}{' '}
          <Link to="/privacy" className="font-semibold text-brand-violet underline hover:no-underline">
            {t('cookieNotice.details')}
          </Link>
        </p>
        <button onClick={accept} className="btn-brand shrink-0 self-start sm:self-auto">
          {t('cookieNotice.accept')}
        </button>
      </div>
    </div>
  );
}
