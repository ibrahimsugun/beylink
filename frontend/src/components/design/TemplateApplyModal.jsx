import { useMemo, useState } from 'react';
import { AlertTriangle, Loader2, GripVertical, Smartphone } from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { Icon } from '../../lib/icons.jsx';
import { ProfileView } from '../profile/ProfileView.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { pageTplName, pageTplDescription, pageTplDisplayName, pageTplBio, pageTplBlockTitle } from '../../lib/pageTemplates.js';

// İletişim kartı düzenlenebilir alanları — label anahtarları contact.* ile paylaşılır (ContactModal).
const CONTACT_FIELDS = [
  { k: 'firstName', labelKey: 'contact.firstName' },
  { k: 'lastName', labelKey: 'contact.lastName' },
  { k: 'role', labelKey: 'contact.role' },
  { k: 'company', labelKey: 'contact.company' },
  { k: 'phone', labelKey: 'contact.phone' },
  { k: 'email', labelKey: 'contact.email' },
  { k: 'website', labelKey: 'contact.website' },
];

/**
 * Hazır sayfa şablonu editörü — seçilen şablonun placeholder içeriğini kullanıcı doldurur,
 * CANLI önizlemede sonucu görür, "Kaydet" ile profiline uygular (mevcut bloklar değişir).
 * Seed metinler (ad/bio/blok başlıkları) AKTİF DİLDE t()'den geçirilerek dolduruluyor.
 */
export function TemplateApplyModal({ template, existingBlockCount = 0, onClose, onApply }) {
  const { t } = useLanguage();
  const TYPE_LABEL = {
    link: t('templateApply.blockType.link'),
    social: t('templateApply.blockType.social'),
    divider: t('templateApply.blockType.divider'),
    contact: t('templateApply.blockType.contact'),
  };
  const [displayName, setDisplayName] = useState(pageTplDisplayName(template, t) || template.profile.display_name || '');
  const [bio, setBio] = useState(pageTplBio(template, t) || template.profile.bio || '');
  const [blocks, setBlocks] = useState(() =>
    template.blocks.map((b, i) => ({ ...b, title: pageTplBlockTitle(template, i, t) ?? b.title, config: b.config ? { ...b.config } : {} })),
  );
  const [stage, setStage] = useState('edit'); // edit | confirm | busy
  const [error, setError] = useState('');

  const setBlockField = (i, key, val) =>
    setBlocks((bs) => bs.map((b, idx) => (idx === i ? { ...b, [key]: val } : b)));
  const setContactField = (i, key, val) =>
    setBlocks((bs) => bs.map((b, idx) => (idx === i ? { ...b, config: { ...b.config, [key]: val } } : b)));
  const removeBlock = (i) => setBlocks((bs) => bs.filter((_, idx) => idx !== i));

  // Canlı önizleme — düzenlenen içerikten sentetik profil + linkler (ProfileView önizleme modu)
  const previewProfile = useMemo(
    () => ({ display_name: displayName, bio, theme_settings: template.theme_settings, avatar_url: null, cover_url: null }),
    [displayName, bio, template],
  );
  const previewLinks = useMemo(
    () => blocks.map((b, i) => ({ id: i, type: b.type, title: b.title, url: b.url, icon_name: b.icon_name, config: b.config || {} })),
    [blocks],
  );

  const doApply = async () => {
    setStage('busy');
    setError('');
    try {
      await onApply({
        theme_settings: template.theme_settings,
        display_name: displayName,
        bio,
        blocks: blocks.map((b) => ({
          type: b.type,
          title: b.title ?? null,
          url: b.url ?? null,
          icon_name: b.icon_name ?? null,
          config: b.config || {},
        })),
      });
      onClose();
    } catch (e) {
      setError(e.message || t('templateApply.genericError'));
      setStage('edit');
    }
  };

  return (
    <Modal
      open
      onClose={stage === 'busy' ? undefined : onClose}
      closeOnBackdrop={stage !== 'busy'}
      title={`${template.emoji} ${pageTplName(template, t)}`}
      maxWidth="max-w-3xl"
    >
      {stage === 'confirm' ? (
        <div>
          <div className="mb-4 flex gap-2 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warning" />
            <div className="text-sm text-ink-soft">
              <p className="font-semibold text-ink">{t('templateApply.confirmTitle')}</p>
              <p className="mt-1">
                {t('templateApply.confirmIntro')}{' '}
                <b>{t('template.applyWarn', { n: existingBlockCount })}</b>{' '}
                {t('templateApply.confirmMiddle', { count: blocks.length })}{' '}
                {t('templateApply.confirmOutro')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStage('edit')} className="btn-ghost flex-1">{t('common.back')}</button>
            <button onClick={doApply} className="btn-brand flex-1">{t('templateApply.confirmApply')}</button>
          </div>
        </div>
      ) : (
        <div>
          <p className="mb-3 text-xs text-muted">{pageTplDescription(template, t)} · {t('templateApply.editHint')}</p>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Sol: düzenleme formu */}
            <div className="order-last max-h-[54vh] space-y-2.5 overflow-y-auto pr-1 lg:order-first">
              <div className="space-y-2 rounded-xl bg-surface p-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted">{t('templateApply.profileNameLabel')}</label>
                  <input className="input" maxLength={60} value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted">{t('templateApply.descriptionLabel')}</label>
                  <textarea className="input min-h-[52px] resize-none" maxLength={160} value={bio} onChange={(e) => setBio(e.target.value)} />
                </div>
              </div>

              {blocks.map((b, i) => (
                <div key={i} className="rounded-xl border border-line p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <GripVertical size={14} className="text-muted" />
                    {b.type !== 'divider' && b.type !== 'contact' && <Icon name={b.icon_name} size={15} className="text-brand-violet" />}
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">{TYPE_LABEL[b.type] || b.type}</span>
                    <button onClick={() => removeBlock(i)} className="ml-auto text-xs text-danger hover:underline">{t('templateApply.removeBtn')}</button>
                  </div>

                  {b.type === 'contact' ? (
                    <div className="grid grid-cols-2 gap-2">
                      {CONTACT_FIELDS.map((f) => (
                        <input
                          key={f.k}
                          className="input text-sm"
                          placeholder={t(f.labelKey)}
                          value={b.config[f.k] || ''}
                          onChange={(e) => setContactField(i, f.k, e.target.value)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <input
                        className="input text-sm"
                        placeholder={b.type === 'divider' ? t('templateApply.blockType.divider') : t('templateApply.titlePlaceholder')}
                        value={b.title || ''}
                        onChange={(e) => setBlockField(i, 'title', e.target.value)}
                      />
                      {(b.type === 'link' || b.type === 'social') && (
                        <input
                          className="input text-sm"
                          placeholder={t('templateApply.urlPlaceholder')}
                          value={b.url || ''}
                          onChange={(e) => setBlockField(i, 'url', e.target.value)}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Sağ: canlı önizleme (telefon çerçevesi) */}
            <div className="order-first lg:order-last">
              <div className="lg:sticky lg:top-0">
                <div className="mb-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-muted">
                  <Smartphone size={13} /> {t('templateApply.previewLabel')}
                </div>
                <div className="mx-auto h-[420px] w-[240px] overflow-hidden rounded-[2rem] border-[8px] border-ink bg-ink shadow-pop">
                  <div className="thin-scroll h-full w-full overflow-y-auto rounded-[1.4rem]">
                    <ProfileView profile={previewProfile} links={previewLinks} showBranding={false} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && <div className="mt-3 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>}

          <div className="mt-4 flex gap-2">
            <button onClick={onClose} disabled={stage === 'busy'} className="btn-ghost flex-1">{t('common.cancel')}</button>
            <button
              onClick={() => (existingBlockCount > 0 ? setStage('confirm') : doApply())}
              disabled={stage === 'busy' || blocks.length === 0}
              className="btn-brand flex-1 disabled:opacity-50"
            >
              {stage === 'busy' ? <Loader2 size={16} className="animate-spin" /> : t('common.save')}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
