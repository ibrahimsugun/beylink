import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlignLeft, AlignCenter, AlignRight, Upload, Image as ImageIcon, User, Columns2, Square, Crown, Lock, Check, LayoutTemplate, Sparkles } from 'lucide-react';
import { useProfile } from '../context/ProfileContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { capsFor } from '../lib/plans.js';
import { RichTextEditor } from '../components/ui/RichTextEditor.jsx';
import { THEMES, PRESET_THEMES, TEMPLATES, getTheme, resolveButton, templateSettings, themeName, themeSector, templateName, templateCat } from '../lib/themes.js';
import { PAGE_TEMPLATES, pageTplName, pageTplCategory, pageTplDescription } from '../lib/pageTemplates.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { TemplateApplyModal } from '../components/design/TemplateApplyModal.jsx';
import { MyTemplatesSection } from '../components/design/MyTemplatesSection.jsx';

function Section({ title, children }) {
  return (
    <div className="card p-5">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted">{title}</h2>
      {children}
    </div>
  );
}

function ChoiceButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
        active ? 'border-brand-violet bg-brand-violet/10 text-brand-violet' : 'border-line bg-white text-ink-soft hover:bg-surface'
      }`}
    >
      {children}
    </button>
  );
}

export default function DesignPage() {
  const { profile, links, patchLocal, saveProfile, uploadImage, applyTemplate } = useProfile();
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const avatarRef = useRef();
  const coverRef = useRef();
  const [pickedTemplate, setPickedTemplate] = useState(null);

  // Linkler sayfasındaki "Şablonlarım" butonundan (#my-templates) gelindiyse bölüme kaydır
  useEffect(() => {
    if (location.hash === '#my-templates') {
      const el = document.getElementById('sablonlarim');
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [location.hash]);

  if (!profile) return null;

  const ts = profile.theme_settings || {};
  const rich = capsFor(user).richText; // zengin metin bio yalnız Pro
  const canPreset = capsFor(user).presetThemes; // hazır (iş-koluna özel) temalar yalnız Pro
  const canHideBranding = capsFor(user).hideBranding; // BeyLink reklamını kapatma yalnız Pro/Pro Plus
  const hideBranding = !!ts.hide_branding;

  const setTheme = (partial) => {
    const merged = { ...ts, ...partial };
    patchLocal({ theme_settings: merged });
    saveProfile({ theme_settings: merged });
  };

  const onUpload = (kind) => (e) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(kind, file);
  };

  const BUTTON_SHAPES = [
    { k: 'rounded', l: t('design.buttonShape.rounded') },
    { k: 'pill', l: t('design.buttonShape.pill') },
    { k: 'sharp', l: t('design.buttonShape.sharp') },
    { k: 'soft', l: t('design.buttonShape.soft') },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-extrabold text-ink">{t('design.title')}</h1>

      {/* Header tipi + görseller */}
      <Section title={t('design.section.pageHeader')}>
        <label className="label">{t('design.headerType.label')}</label>
        <div className="mb-4 flex gap-2">
          <ChoiceButton active={(ts.header_type || 'avatar') === 'avatar'} onClick={() => setTheme({ header_type: 'avatar' })}><User size={15} /> {t('design.headerType.avatar')}</ChoiceButton>
          <ChoiceButton active={ts.header_type === 'cover'} onClick={() => setTheme({ header_type: 'cover' })}><ImageIcon size={15} /> {t('design.headerType.cover')}</ChoiceButton>
          <ChoiceButton active={ts.header_type === 'both'} onClick={() => setTheme({ header_type: 'both' })}>{t('design.headerType.both')}</ChoiceButton>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 overflow-hidden rounded-full border border-line bg-surface">
              {profile.avatar_url ? <img src={profile.avatar_url} className="h-full w-full object-cover" alt="" /> : <div className="flex h-full w-full items-center justify-center text-muted"><User size={22} /></div>}
            </div>
            <div>
              <button onClick={() => avatarRef.current.click()} className="btn-ghost"><Upload size={14} /> {t('design.avatarUploadBtn')}</button>
              <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={onUpload('avatar')} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-16 w-24 overflow-hidden rounded-xl border border-line bg-surface">
              {profile.cover_url ? <img src={profile.cover_url} className="h-full w-full object-cover" alt="" /> : <div className="flex h-full w-full items-center justify-center text-muted"><ImageIcon size={22} /></div>}
            </div>
            <div>
              <button onClick={() => coverRef.current.click()} className="btn-ghost"><Upload size={14} /> {t('design.coverUploadBtn')}</button>
              <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={onUpload('cover')} />
            </div>
          </div>
        </div>
      </Section>

      {/* BeyLink Reklamını Kapat — Pro/Pro Plus premium özelliği */}
      <div className={`relative overflow-hidden rounded-2xl border p-5 shadow-card ${
        canHideBranding
          ? 'border-brand-violet/40 bg-gradient-to-br from-brand-teal/10 via-white to-brand-violet/10'
          : 'border-line bg-white'
      }`}>
        {/* Parıldayan premium halkası (Pro ise animasyonlu) */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-brand-teal/30 to-brand-violet/30 blur-2xl" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-teal to-brand-violet text-white">
                <Sparkles size={16} className={canHideBranding ? 'animate-pulse' : ''} />
              </div>
              <h2 className="text-base font-extrabold text-ink">{t('design.hideBranding.title')}</h2>
              <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-teal to-brand-violet px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                <Crown size={10} /> Pro
              </span>
            </div>
            <p className="mt-1.5 text-sm text-muted">
              {t('design.hideBranding.desc')}
              {!canHideBranding && ' ' + t('design.hideBranding.capNote')}
            </p>
          </div>

          {/* Toggle */}
          {canHideBranding ? (
            <button
              type="button"
              role="switch"
              aria-checked={hideBranding}
              aria-label={t('design.hideBranding.ariaLabel')}
              onClick={() => setTheme({ hide_branding: !hideBranding })}
              className={`relative mt-1 h-7 w-12 shrink-0 rounded-full transition ${
                hideBranding ? 'bg-brand-violet' : 'bg-line'
              }`}
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                  hideBranding ? 'left-[22px]' : 'left-0.5'
                }`}
              />
            </button>
          ) : (
            <Link to="/dashboard/plans" className="btn-brand shrink-0 whitespace-nowrap text-xs">
              <Crown size={13} /> {t('common.upgradeCta')}
            </Link>
          )}
        </div>
      </div>

      {/* Başlık & açıklama */}
      <Section title={t('design.section.titleDesc')}>
        <div className="space-y-4">
          <div>
            <label className="label">{t('design.field.profileTitle')} <span className="font-normal text-muted">({(profile.display_name || '').length}/30)</span></label>
            <input
              className="input"
              maxLength={30}
              value={profile.display_name || ''}
              onChange={(e) => patchLocal({ display_name: e.target.value })}
              onBlur={(e) => saveProfile({ display_name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">
              {t('design.field.description')}{' '}
              {rich
                ? <span className="font-normal text-brand-violet">{t('design.richTextBadge')}</span>
                : <span className="font-normal text-muted">({(profile.bio || '').length}/80)</span>}
            </label>
            {rich ? (
              <RichTextEditor
                value={profile.bio_html || ''}
                onBlur={(html) => saveProfile({ bio_html: html })}
                placeholder={t('design.richText.placeholder')}
              />
            ) : (
              <textarea
                className="input min-h-[80px] resize-none"
                maxLength={80}
                value={profile.bio || ''}
                onChange={(e) => patchLocal({ bio: e.target.value })}
                onBlur={(e) => saveProfile({ bio: e.target.value })}
              />
            )}
            {!rich && <p className="mt-1.5 text-xs text-muted">{t('design.richTextHint')}</p>}
          </div>
        </div>
      </Section>

      {/* Düzen & hizalama */}
      <Section title={t('design.section.layout')}>
        <label className="label">{t('design.titleAlignLabel')}</label>
        <div className="mb-4 flex gap-2">
          <ChoiceButton active={(ts.title_align || 'center') === 'left'} onClick={() => setTheme({ title_align: 'left' })}><AlignLeft size={15} /> {t('design.align.left')}</ChoiceButton>
          <ChoiceButton active={(ts.title_align || 'center') === 'center'} onClick={() => setTheme({ title_align: 'center' })}><AlignCenter size={15} /> {t('design.align.center')}</ChoiceButton>
          <ChoiceButton active={ts.title_align === 'right'} onClick={() => setTheme({ title_align: 'right' })}><AlignRight size={15} /> {t('design.align.right')}</ChoiceButton>
        </div>
        <label className="label">{t('design.desktopLayoutLabel')}</label>
        <div className="mb-4 flex gap-2">
          <ChoiceButton active={(ts.layout || 'single') === 'single'} onClick={() => setTheme({ layout: 'single' })}><Square size={15} /> {t('design.layout.single')}</ChoiceButton>
          <ChoiceButton active={ts.layout === 'double'} onClick={() => setTheme({ layout: 'double' })}><Columns2 size={15} /> {t('design.layout.double')}</ChoiceButton>
        </div>
        <label className="label">{t('design.buttonShapeLabel')}</label>
        <div className="flex flex-wrap gap-2">
          {BUTTON_SHAPES.map((s) => (
            <ChoiceButton key={s.k} active={(ts.buttonStyle || 'rounded') === s.k} onClick={() => setTheme({ buttonStyle: s.k })}>{s.l}</ChoiceButton>
          ))}
        </div>
      </Section>

      {/* Temalar */}
      <Section title={t('design.section.themes')}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {THEMES.map((item) => {
            const active = (ts.template || 'wave') === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setTheme({ template: item.key })}
                className={`overflow-hidden rounded-xl border-2 text-left transition ${active ? 'border-brand-violet' : 'border-transparent hover:border-line'}`}
              >
                <div className="flex h-24 flex-col items-center justify-center gap-1.5 p-2" style={getTheme(item.key).pageStyle}>
                  <div className="h-6 w-6 rounded-full bg-white/40" />
                  <div className="h-2 w-12 rounded-full" style={getTheme(item.key).button} />
                  <div className="h-2 w-12 rounded-full" style={getTheme(item.key).button} />
                </div>
                <div className="bg-white px-2 py-1.5 text-center text-xs font-semibold text-ink-soft">{themeName(item, t)}</div>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Hazır Temalar — komple şablonlar (renk+buton stili) + iş-koluna özel profesyonel temalar (Basic+) */}
      <Section title={t('design.section.presetThemes')}>
        {canPreset ? (
          <>
            <p className="mb-4 -mt-1 text-xs text-muted">
              {t('design.presetThemes.desc')}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {/* Komple şablonlar — renk + buton stili/şekli birlikte */}
              {TEMPLATES.map((item) => {
                const active = ts.template === item.key;
                const th = getTheme(item.key);
                const bs = resolveButton(th, item.buttonStyle);
                return (
                  <button
                    key={item.key}
                    onClick={() => setTheme(templateSettings(item))}
                    className={`overflow-hidden rounded-xl border-2 text-left transition ${active ? 'border-brand-violet' : 'border-transparent hover:border-line'}`}
                  >
                    <div className="relative flex h-24 flex-col items-center justify-center gap-2 p-3" style={th.pageStyle}>
                      {item.professional && (
                        <span className="absolute right-1.5 top-1.5 rounded-full bg-black/35 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">{t('design.badge.business')}</span>
                      )}
                      <div className="h-5 w-5 rounded-full bg-white/40" />
                      <div className="h-3 w-full" style={bs} />
                      <div className="h-3 w-full" style={bs} />
                    </div>
                    <div className="bg-white px-2 py-1.5 text-center">
                      <div className="text-xs font-semibold text-ink-soft">{templateName(item, t)}</div>
                      <div className="text-[10px] text-muted">{templateCat(item, t)}</div>
                    </div>
                  </button>
                );
              })}
              {/* İş-koluna özel renk temaları */}
              {PRESET_THEMES.map((item) => {
                const active = ts.template === item.key;
                const th = getTheme(item.key);
                return (
                  <button
                    key={item.key}
                    onClick={() => setTheme({ template: item.key })}
                    className={`overflow-hidden rounded-xl border-2 text-left transition ${active ? 'border-brand-violet' : 'border-transparent hover:border-line'}`}
                  >
                    <div className="relative flex h-24 flex-col items-center justify-center gap-1.5 p-2" style={th.pageStyle}>
                      {item.professional && (
                        <span className="absolute right-1.5 top-1.5 rounded-full bg-black/35 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">{t('design.badge.business')}</span>
                      )}
                      <div className="h-6 w-6 rounded-full bg-white/40" />
                      <div className="h-2 w-12 rounded-full" style={th.button} />
                      <div className="h-2 w-12 rounded-full" style={th.button} />
                    </div>
                    <div className="bg-white px-2 py-1.5 text-center">
                      <div className="text-xs font-semibold text-ink-soft">{themeName(item, t)}</div>
                      <div className="text-[10px] text-muted">{themeSector(item, t)}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-xl bg-surface px-6 py-8 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white"><Crown size={22} /></span>
            <p className="text-sm font-bold text-ink">{t('design.presetThemes.lockedTitle')}</p>
            <p className="max-w-sm text-xs text-muted">
              {t('design.presetThemes.lockedDesc')}
            </p>
            {/* Kilitli önizleme — dokunulamaz */}
            <div className="pointer-events-none grid w-full max-w-md grid-cols-3 gap-2 opacity-60">
              {[...TEMPLATES.slice(0, 3), ...PRESET_THEMES.slice(0, 3)].map((item) => (
                <div key={item.key} className="overflow-hidden rounded-lg">
                  <div className="relative flex h-14 items-center justify-center" style={getTheme(item.key).pageStyle}>
                    <Lock size={14} className="text-white/80" />
                  </div>
                  <div className="truncate bg-white px-1 py-1 text-center text-[9px] font-semibold text-ink-soft">
                    {item.category != null ? templateCat(item, t) : themeSector(item, t)}
                  </div>
                </div>
              ))}
            </div>
            <Link to="/dashboard/plans" className="btn-brand mt-1 inline-flex items-center gap-1.5">
              <Crown size={15} /> {t('common.upgradeCta')}
            </Link>
          </div>
        )}
      </Section>

      {/* Şablonlarım — kullanıcının kaydettiği tasarım şablonları (kaydet/uygula/export/import/toplu) */}
      <MyTemplatesSection />

      {/* Hazır Sayfalar — önceden doldurulmuş tam sayfa şablonları (herkese açık) — EN ALTTA */}
      <Section title={t('design.section.pageTemplates')}>
        <div className="mb-3 -mt-1 flex items-start gap-2 text-xs text-muted">
          <LayoutTemplate size={15} className="mt-0.5 shrink-0 text-brand-violet" />
          <p>{t('design.pageTemplates.hint')}</p>
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {PAGE_TEMPLATES.map((tpl) => (
            <button
              key={tpl.key}
              onClick={() => setPickedTemplate(tpl)}
              className="flex items-start gap-3 rounded-xl border border-line bg-white p-3 text-left transition hover:border-brand-violet hover:shadow-card"
            >
              <span className="text-2xl leading-none">{tpl.emoji}</span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-ink">{pageTplName(tpl, t)}</span>
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-brand-violet">{pageTplCategory(tpl, t)}</span>
                <span className="mt-0.5 block truncate text-xs text-muted">{pageTplDescription(tpl, t)}</span>
              </span>
            </button>
          ))}
        </div>
      </Section>

      {pickedTemplate && (
        <TemplateApplyModal
          template={pickedTemplate}
          existingBlockCount={links?.length || 0}
          onClose={() => setPickedTemplate(null)}
          onApply={applyTemplate}
        />
      )}
    </div>
  );
}
