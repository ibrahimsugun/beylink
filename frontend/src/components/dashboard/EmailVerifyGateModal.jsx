import { useEffect, useState } from 'react';
import { MailWarning } from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { EMAIL_UNVERIFIED_EVENT } from '../../lib/emailGate.js';

// E-postası onaylanmamış hesap kritik bir işlem (profil yayınlama / satın alım) deneyince açılan bildirim.
// promptEmailVerify() ya da api client'ın (code: 'email_unverified') dispatch'iyle tetiklenir.
// Gerçek doğrulama sayfanın üstündeki EmailVerifyBanner'da yapılır → buradaki buton oraya kaydırır.
export function EmailVerifyGateModal() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onEvt = () => setOpen(true);
    window.addEventListener(EMAIL_UNVERIFIED_EVENT, onEvt);
    return () => window.removeEventListener(EMAIL_UNVERIFIED_EVENT, onEvt);
  }, []);

  const goVerify = () => {
    setOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // üstteki doğrulama bildirimini göster
  };

  return (
    <Modal open={open} onClose={() => setOpen(false)} title={t('emailVerify.gateTitle')} maxWidth="max-w-md">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/10 text-warning">
          <MailWarning size={20} />
        </span>
        <p className="text-sm text-ink-soft">
          {t('emailVerify.gateBodyIntro')}{' '}
          <b>{t('emailVerify.gateCodeBold')}</b> {t('emailVerify.gateBodyOutro')}
        </p>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={() => setOpen(false)} className="btn-ghost">{t('common.close')}</button>
        <button onClick={goVerify} className="btn-brand">{t('emailVerify.gateCta')}</button>
      </div>
    </Modal>
  );
}
