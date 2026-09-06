import { useState } from 'react';
import { Share2, QrCode, Check, Copy, ChevronDown, LogOut, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useProfile } from '../../context/ProfileContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { Modal } from '../ui/Modal.jsx';
import { api } from '../../api/client.js';
import { planLabel } from '../../lib/plans.js';
import { usd } from '../../lib/format.js';
import { LanguageSwitcher } from '../ui/LanguageSwitcher.jsx';

export function Topbar({ onMenu }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { profile, allProfiles, activeId, setActiveId } = useProfile();
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [qr, setQr] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  if (!profile) return <div className="h-16 border-b border-line bg-white" />;

  const publicUrl = `${window.location.origin}/${profile.username}`;

  const copy = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const openQr = async () => {
    setQrOpen(true);
    if (!qr || qr.username !== profile.username) {
      const data = await api.get(`/public/${profile.username}/qr`);
      setQr({ ...data, username: profile.username });
    }
  };

  return (
    <header className="flex h-16 items-center gap-3 border-b border-line bg-white px-4">
      <button onClick={onMenu} className="btn-ghost lg:hidden px-2.5">☰</button>

      {/* Public URL + profil değiştirici */}
      <div className="flex flex-1 items-center gap-2 overflow-hidden">
        {allProfiles.length > 1 ? (
          <select
            value={activeId ?? ''}
            onChange={(e) => setActiveId(Number(e.target.value))}
            className="input max-w-[220px] py-2"
            title={t('topbar.managedProfileTitle')}
          >
            {allProfiles.map((p) => (
              <option key={p.id} value={p.id}>
                /{p.username} {p._self ? t('topbar.selfSuffix') : t('topbar.subSuffix')}
              </option>
            ))}
          </select>
        ) : (
          <a
            href={`/${profile.username}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 truncate rounded-xl border border-line bg-surface px-3 py-2 text-sm font-medium text-ink-soft hover:text-brand-violet"
          >
            <span className="truncate">{window.location.host}/{profile.username}</span>
            <ExternalLink size={13} className="shrink-0" />
          </a>
        )}
      </div>

      <button onClick={copy} className="btn-ghost">
        {copied ? <Check size={15} className="text-success" /> : <Share2 size={15} />}
        <span className="hidden sm:inline">{copied ? t('topbar.copied') : t('topbar.share')}</span>
      </button>
      <button onClick={openQr} className="btn-ghost px-2.5" title={t('topbar.qrTitle')}>
        <QrCode size={16} />
      </button>
      <LanguageSwitcher />

      {/* Kullanıcı menüsü */}
      <div className="relative">
        <button onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-2 rounded-xl border border-line bg-white px-2 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-white">
            {(user?.email || user?.username || '?').charAt(0).toUpperCase()}
          </div>
          <ChevronDown size={14} className="text-muted" />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 z-20 mt-2 w-56 card p-2">
              <div className="px-3 py-2">
                <div className="truncate text-sm font-semibold text-ink">{user?.email || user?.username}</div>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`chip ${user?.plan === 'free' ? 'bg-surface text-muted' : 'bg-brand-gradient text-white'}`}>
                    {planLabel(user?.plan, t)}
                  </span>
                  <span className="chip bg-surface font-mono text-muted">{usd(user?.credits_micro)}</span>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-danger hover:bg-surface"
              >
                <LogOut size={15} /> {t('topbar.logout')}
              </button>
            </div>
          </>
        )}
      </div>

      <Modal open={qrOpen} onClose={() => setQrOpen(false)} title={t('topbar.qrTitle')}>
        <div className="flex flex-col items-center gap-4">
          {qr ? (
            <>
              <img src={qr.dataUrl} alt="QR" className="h-56 w-56 rounded-xl border border-line" />
              <div className="flex items-center gap-2 text-sm text-muted">
                <span className="font-mono">{publicUrl}</span>
                <button onClick={copy} className="text-brand-violet"><Copy size={14} /></button>
              </div>
              <a href={qr.dataUrl} download={`beylink-${profile.username}.png`} className="btn-brand w-full">
                {t('topbar.qrDownload')}
              </a>
            </>
          ) : (
            <div className="py-10 text-muted">{t('common.loading')}</div>
          )}
        </div>
      </Modal>
    </header>
  );
}
