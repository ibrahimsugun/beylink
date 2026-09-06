import { Globe, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { capsFor } from '../lib/plans.js';

export default function SeoPage() {
  const { profile, patchLocal, saveProfile } = useProfile();
  const { user } = useAuth();
  const { t } = useLanguage();
  if (!profile) return null;

  // SEO düzenleme yalnızca Basic+ planlarında
  if (!capsFor(user).seo) {
    return (
      <div className="mx-auto max-w-lg">
        <h1 className="mb-4 text-2xl font-extrabold text-ink">{t('seo.title')}</h1>
        <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-white"><Crown size={26} /></span>
          <p className="text-lg font-bold text-ink">{t('seo.locked.heading')}</p>
          <p className="max-w-sm text-sm text-muted">{t('seo.locked.desc')}</p>
          <Link to="/dashboard/plans" className="btn-brand mt-1">{t('common.upgradeCta')}</Link>
        </div>
      </div>
    );
  }

  // Alt hesaplar SEO'yu yalnızca GÖRÜNTÜLER — düzenleyemez (backend de reddeder).
  const readOnly = user?.role === 'sub';

  const seo = profile.seo_settings || {};
  const title = profile.meta_title || profile.display_name || `@${profile.username}`;
  const desc = profile.meta_description || profile.bio || '';
  const url = `${window.location.host}/${profile.username}`;

  // seo_settings alanları — anlık önizleme (patchLocal) + kaydet (saveProfile).
  const patchSeo = (field, value) => patchLocal({ seo_settings: { ...seo, [field]: value } });
  const saveSeo = (field, value) => saveProfile({ seo_settings: { ...seo, [field]: value } }).catch(() => {});
  const commitSeo = (field, value) => { patchSeo(field, value); saveSeo(field, value); };

  // Önizleme görseli (og:image çözümü — backend resolveOgImage ile aynı mantık)
  const ogMode = seo.ogImageMode || 'cover';
  const previewImg =
    ogMode === 'custom' ? seo.ogImageUrl :
    ogMode === 'avatar' ? (profile.avatar_url || profile.cover_url) :
    (profile.cover_url || profile.avatar_url);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-extrabold text-ink">{t('seo.pageTitle')}</h1>

      {readOnly && (
        <div className="flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-soft">
          <Globe size={16} className="shrink-0 text-brand-violet" />
          {t('seo.readOnlyNote')}
        </div>
      )}

      <fieldset disabled={readOnly} className="m-0 min-w-0 space-y-5 border-0 p-0 disabled:opacity-70">
      {/* Meta Etiketleri */}
      <div className="card p-5">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted">{t('seo.section.meta')}</h2>
        <div className="space-y-4">
          <div>
            <label className="label">{t('seo.metaTitleLabel')} <span className="font-normal text-muted">({(profile.meta_title || '').length}/60)</span></label>
            <input
              className="input"
              maxLength={60}
              value={profile.meta_title || ''}
              onChange={(e) => patchLocal({ meta_title: e.target.value })}
              onBlur={(e) => saveProfile({ meta_title: e.target.value })}
              placeholder={profile.display_name || t('seo.metaTitlePlaceholder')}
            />
          </div>
          <div>
            <label className="label">{t('seo.metaDescLabel')} <span className="font-normal text-muted">({(profile.meta_description || '').length}/160)</span></label>
            <textarea
              className="input min-h-[90px] resize-none"
              maxLength={160}
              value={profile.meta_description || ''}
              onChange={(e) => patchLocal({ meta_description: e.target.value })}
              onBlur={(e) => saveProfile({ meta_description: e.target.value })}
              placeholder={t('seo.metaDescPlaceholder')}
            />
          </div>
        </div>
      </div>

      {/* Sosyal Paylaşım Görseli */}
      <div className="card p-5">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted">{t('seo.section.ogImage')}</h2>
        <div className="space-y-4">
          <div>
            <label className="label">{t('seo.ogImageSourceLabel')}</label>
            <select className="input" value={ogMode} onChange={(e) => commitSeo('ogImageMode', e.target.value)}>
              <option value="cover">{t('seo.ogImage.cover')}</option>
              <option value="avatar">{t('seo.ogImage.avatar')}</option>
              <option value="custom">{t('seo.ogImage.custom')}</option>
            </select>
          </div>
          {ogMode === 'custom' && (
            <div>
              <label className="label">{t('seo.ogImageCustomUrlLabel')}</label>
              <input
                className="input"
                type="url"
                placeholder="https://…/gorsel.jpg"
                value={seo.ogImageUrl || ''}
                onChange={(e) => patchSeo('ogImageUrl', e.target.value)}
                onBlur={(e) => saveSeo('ogImageUrl', e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Sosyal paylaşım önizlemesi */}
      <div className="card p-5">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted">{t('seo.section.preview')}</h2>
        <div className="overflow-hidden rounded-xl border border-line">
          <div className="flex h-32 items-center justify-center bg-brand-gradient text-white">
            {previewImg ? (
              <img src={previewImg} alt="" className="h-full w-full object-cover" />
            ) : (
              <Globe size={40} className="opacity-80" />
            )}
          </div>
          <div className="bg-white p-3">
            <div className="text-[11px] uppercase text-muted">{url}</div>
            <div className="truncate font-bold text-ink">{title}</div>
            <div className="line-clamp-2 text-sm text-muted">{desc || t('seo.preview.descPlaceholder')}</div>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted">
          {t('seo.preview.note')}
        </p>
      </div>

      {/* Gelişmiş */}
      <div className="card p-5">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted">{t('seo.section.advanced')}</h2>
        <div className="space-y-4">
          <div>
            <label className="label">{t('seo.keywordsLabel')}</label>
            <input
              className="input"
              placeholder={t('seo.keywordsPlaceholder')}
              value={seo.keywords || ''}
              onChange={(e) => patchSeo('keywords', e.target.value)}
              onBlur={(e) => saveSeo('keywords', e.target.value)}
            />
          </div>
          <div>
            <label className="label">{t('seo.canonicalLabel')} <span className="font-normal text-muted">{t('seo.optionalHint')}</span></label>
            <input
              className="input"
              type="url"
              placeholder={`https://${url}`}
              value={seo.canonical || ''}
              onChange={(e) => patchSeo('canonical', e.target.value)}
              onBlur={(e) => saveSeo('canonical', e.target.value)}
            />
          </div>
          <div>
            <label className="label">{t('seo.twitterLabel')}</label>
            <div className="flex items-center gap-2">
              <span className="text-muted">@</span>
              <input
                className="input"
                placeholder={t('seo.twitterPlaceholder')}
                value={seo.twitterHandle || ''}
                onChange={(e) => patchSeo('twitterHandle', e.target.value.replace(/^@+/, ''))}
                onBlur={(e) => saveSeo('twitterHandle', e.target.value.replace(/^@+/, ''))}
              />
            </div>
          </div>
          <div>
            <label className="label">{t('seo.robotsLabel')}</label>
            <select className="input" value={seo.robots || 'index'} onChange={(e) => commitSeo('robots', e.target.value)}>
              <option value="index">{t('seo.robots.index')}</option>
              <option value="noindex">{t('seo.robots.noindex')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Facebook Pixel */}
      <div className="card p-5">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted">{t('seo.section.fbPixel')}</h2>
        <label className="label">{t('seo.fbPixelLabel')}</label>
        <input
          className="input font-mono"
          inputMode="numeric"
          placeholder="1234567890"
          value={seo.fbPixelId || ''}
          onChange={(e) => patchSeo('fbPixelId', e.target.value.replace(/\D/g, ''))}
          onBlur={(e) => saveSeo('fbPixelId', e.target.value.replace(/\D/g, ''))}
        />
        <p className="mt-2 text-xs text-muted">
          {t('seo.fbPixelNote')}
        </p>
      </div>
      </fieldset>
    </div>
  );
}
