import { ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';

// Ek alt hesap haklarının "kalıcı" doğasını anlatan bilgilendirme (Planlar + Alt Hesaplar sayfaları).
export function PermanentRightsNote({ className = '' }) {
  const { t } = useLanguage();
  return (
    <div className={`flex items-start gap-2 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-ink-soft ${className}`}>
      <ShieldCheck size={18} className="mt-0.5 shrink-0 text-success" />
      <p>{t('permRights.note')}</p>
    </div>
  );
}
