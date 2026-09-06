import { profileModel } from '../models/profileModel.js';
import { linkModel } from '../models/linkModel.js';
import { assertProfileAccess, assertProfileEditable } from '../utils/authz.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { badRequest, forbidden, emailUnverified } from '../utils/ApiError.js';
import { assertPlanCap } from '../utils/plan.js';
import { sanitizeSeoSettings } from '../utils/seo.js';
import { sanitizeBioHtml, htmlToText } from '../utils/sanitizeHtml.js';
import { toSafeLinkTarget } from '../utils/url.js';
import { applyPageTemplate } from '../services/templates.js';
import { assertThemeGate } from '../utils/themeGate.js';

const TEMPLATE_BLOCK_TYPES = ['link', 'social', 'divider', 'contact', 'gallery'];
const TEMPLATE_URL_REQUIRED = ['link', 'social'];
const MAX_TEMPLATE_BLOCKS = 40;

export const getMyProfile = asyncHandler(async (req, res) => {
  const profile = profileModel.findByUserId(req.user.id);
  res.json({ profile });
});

export const getProfile = asyncHandler(async (req, res) => {
  const profile = assertProfileAccess(req.user, req.params.id);
  res.json({ profile });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const profile = assertProfileEditable(req.user, req.params.id);

  // SEO alanları (meta başlık/açıklama + gelişmiş seo_settings)
  if (
    req.body.meta_title !== undefined ||
    req.body.meta_description !== undefined ||
    req.body.seo_settings !== undefined
  ) {
    // Alt hesaplar SEO bölümünü yalnız GÖRÜNTÜLER — düzenleyemez (rol tabanlı, plandan bağımsız).
    if (req.user.role === 'sub') {
      throw forbidden('SEO alanları alt hesaplarda salt okunurdur; yalnızca ana hesap düzenleyebilir.');
    }
    assertPlanCap(req.user, 'seo'); // owner için plan gating (Basic+)
  }

  // Hazır (preset) temalar yalnız Pro. Serbest 8 şablon herkese açık; onların DIŞINDAKİ her
  // template (iş-koluna özel presetler + bilinmeyenler) presetThemes cap'i ister. Yalnızca template
  // DEĞİŞİYORSA denetlenir → Pro iken preset seçip sonra plandan düşen kullanıcı diğer tasarım
  // ayarlarını düzenlemeye devam edebilir (mevcut şablonu korunur, sayfası "brick" olmaz).
  if (req.body.theme_settings !== undefined) {
    assertThemeGate(req.user, req.body.theme_settings, profile.theme_settings);
    // BeyLink markasını gizleme yalnız Pro ve Pro Plus. Downgrade sonrası eski true değerler
    // public read'de (publicController) otomatik false'a çekildiği için burada sadece "true'ya
    // yeni geçiş"i engelliyoruz: cap yoksa hide_branding istemcide false'a zorlanır (silent
    // clamp) — kullanıcı "boş yere 403" yerine toggle'ı görür, gerçek Pro cap kontrolü yine hard.
    const incoming = req.body.theme_settings || {};
    if (incoming.hide_branding === true) assertPlanCap(req.user, 'hideBranding');
  }

  // E-posta onayı yoksa profil YAYINLANAMAZ (is_published=1). Sayfa oluşturulabilir/düzenlenebilir ama
  // aktif edilemez. is_published=0 (yayından kaldırma) ve diğer alanlar serbest. Alt hesaplar (e-postasız) muaf.
  if (req.body.is_published && req.user.email && req.user.email_verified !== 1) {
    throw emailUnverified('E-postanız onaylanmadı. Profilinizi yayınlamak için e-posta adresinizi onaylayın.');
  }

  // NOT: username (public slug) kayıttan sonra değiştirilemez — istemci gönderse bile yok sayılır.
  const patch = {};
  const passthrough = ['display_name', 'meta_title', 'meta_description', 'is_published', 'theme_settings'];
  for (const key of passthrough) {
    if (req.body[key] !== undefined) patch[key] = req.body[key];
  }

  // seo_settings — depolamadan önce normalize/sanitize (fbPixelId rakam, robots enum, URL http/https)
  if (req.body.seo_settings !== undefined) {
    patch.seo_settings = sanitizeSeoSettings(req.body.seo_settings);
  }

  // Bio: Pro'da zengin metin (bio_html sanitize + düz-metin türet); değilse düz metin.
  // Düz metin düzenlemesi zengin sürümü temizler (tutarlılık).
  if (req.body.bio_html !== undefined) {
    assertPlanCap(req.user, 'richText');
    const clean = sanitizeBioHtml(req.body.bio_html);
    patch.bio_html = clean;
    patch.bio = htmlToText(clean).slice(0, 300);
  } else if (req.body.bio !== undefined) {
    patch.bio = req.body.bio;
    patch.bio_html = '';
  }

  const updated = profileModel.update(profile.id, patch);
  res.json({ profile: updated });
});

// Hazır sayfa şablonu uygula — mevcut bloklar SİLİNİR, şablonun (düzenlenmiş) blokları + ad/bio/tema yazılır.
// İçerik şablonları herkese açık; yalnız Pro-tema taşınırsa presetThemes gate'i devreye girer (backdoor guard).
export const applyTemplate = asyncHandler(async (req, res) => {
  const profile = assertProfileEditable(req.user, req.params.id);
  const { theme_settings, display_name, bio, blocks } = req.body;

  if (!Array.isArray(blocks)) throw badRequest('blocks[] gerekli', 'blocks');
  if (blocks.length > MAX_TEMPLATE_BLOCKS) throw badRequest(`En fazla ${MAX_TEMPLATE_BLOCKS} blok uygulanabilir`, 'blocks');

  if (theme_settings !== undefined) assertThemeGate(req.user, theme_settings, profile.theme_settings);

  // Blokları doğrula + URL normalize (http/https zorunlu, şemasıza https:// eklenir)
  const clean = blocks.map((b) => {
    const type = b?.type || 'link';
    if (!TEMPLATE_BLOCK_TYPES.includes(type)) throw badRequest(`Geçersiz blok tipi: ${type}`, 'blocks');
    let url = b?.url ?? null;
    if (TEMPLATE_URL_REQUIRED.includes(type)) {
      if (!url) throw badRequest('Bağlantı bloklarında URL gerekli', 'blocks');
      url = toSafeLinkTarget(url);
      if (!url) throw badRequest('Yalnızca http/https, e-posta (mailto:) veya telefon (tel:) bağlantılarına izin verilir', 'blocks');
    }
    return {
      type,
      title: b?.title != null ? String(b.title).slice(0, 200) : null,
      url,
      iconName: b?.icon_name != null ? String(b.icon_name).slice(0, 40) : null,
      config: b?.config && typeof b.config === 'object' && !Array.isArray(b.config) ? b.config : {},
    };
  });

  const profilePatch = {};
  if (display_name !== undefined) profilePatch.display_name = String(display_name).slice(0, 60);
  if (bio !== undefined) { profilePatch.bio = String(bio).slice(0, 300); profilePatch.bio_html = ''; }
  if (theme_settings !== undefined) profilePatch.theme_settings = theme_settings;

  applyPageTemplate(profile.id, { profilePatch, blocks: clean });

  res.json({ profile: profileModel.findById(profile.id), links: linkModel.listByProfile(profile.id) });
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  const profile = assertProfileEditable(req.user, req.params.id);
  if (!req.file) throw badRequest('Dosya bulunamadı');
  const updated = profileModel.update(profile.id, { avatar_url: `/uploads/${req.file.filename}` });
  res.json({ profile: updated });
});

export const uploadCover = asyncHandler(async (req, res) => {
  const profile = assertProfileEditable(req.user, req.params.id);
  if (!req.file) throw badRequest('Dosya bulunamadı');
  const updated = profileModel.update(profile.id, { cover_url: `/uploads/${req.file.filename}` });
  res.json({ profile: updated });
});

// Galeri bloğu için tekil görsel yükleme — profili değiştirmez, sadece URL döner
export const uploadGalleryImage = asyncHandler(async (req, res) => {
  assertProfileEditable(req.user, req.params.id);
  if (!req.file) throw badRequest('Dosya bulunamadı');
  res.json({ url: `/uploads/${req.file.filename}` });
});
