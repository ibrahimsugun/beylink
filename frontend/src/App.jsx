import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { CookieNotice } from './components/CookieNotice.jsx';
import { ProfileProvider } from './context/ProfileContext.jsx';
import { DashboardLayout } from './components/dashboard/DashboardLayout.jsx';
import { useLanguage } from './context/LanguageContext.jsx';

// Marketing/kurumsal site (SiteLayout altında izole — Faz 9 subdomain hazırlığı).
// Home ilk açılış → eager import; diğer sayfalar lazy → Faz 5 code-splitting.
import { SiteLayout } from './site/SiteLayout.jsx';
import Home from './site/pages/Home.jsx';

// Marketing lazy sayfaları
const Features = lazy(() => import('./site/pages/Features.jsx'));
const Pricing = lazy(() => import('./site/pages/Pricing.jsx'));
const Templates = lazy(() => import('./site/pages/Templates.jsx'));
const HelpCenter = lazy(() => import('./site/pages/Help.jsx'));
const Faq = lazy(() => import('./site/pages/Faq.jsx'));
const About = lazy(() => import('./site/pages/About.jsx'));
const Contact = lazy(() => import('./site/pages/Contact.jsx'));
const Privacy = lazy(() => import('./site/pages/Privacy.jsx'));
const Terms = lazy(() => import('./site/pages/Terms.jsx'));
const Cookies = lazy(() => import('./site/pages/Cookies.jsx'));
const BlogIndex = lazy(() => import('./site/blog/BlogIndex.jsx'));
const BlogPost = lazy(() => import('./site/blog/BlogPost.jsx'));

// Auth — SiteLayout dışı, lazy (marketing ziyaretçisi login/register açmaz → ana bundle'a girmesin)
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'));
const ResetPassword = lazy(() => import('./pages/ResetPassword.jsx'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail.jsx'));

// Dashboard sayfaları — auth-gated + izole. Marketing ziyaretçisi hiç yüklemez → ayrı chunk'lar
const LinksPage = lazy(() => import('./pages/LinksPage.jsx'));
const DesignPage = lazy(() => import('./pages/DesignPage.jsx'));
const SeoPage = lazy(() => import('./pages/SeoPage.jsx'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage.jsx'));
const BtagsPage = lazy(() => import('./pages/BtagsPage.jsx'));
const SubAccountsPage = lazy(() => import('./pages/SubAccountsPage.jsx'));
const PlansPage = lazy(() => import('./pages/PlansPage.jsx'));
const BillingPage = lazy(() => import('./pages/BillingPage.jsx'));
const KrediYuklePage = lazy(() => import('./pages/KrediYuklePage.jsx'));
const DemoOdemePage = lazy(() => import('./pages/DemoOdemePage.jsx'));
const HelpPage = lazy(() => import('./pages/HelpPage.jsx'));
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'));
const DomainsPage = lazy(() => import('./pages/DomainsPage.jsx'));

// Public profil — /:username. Kullanıcıya bağlı içerik, ilk açılışta gerekli değil
const PublicProfile = lazy(() => import('./pages/PublicProfile.jsx'));

// BeyLink'in KENDİ hostname'leri — burada OLMAYAN her hostname bir özel (branded) domain
// sayılır (bkz. backend resolveHost middleware, aynı liste `APP_HOSTNAMES` env'iyle eşleşmeli).
// Özel domainde SPA'nın tamamı (marketing/dashboard) DEĞİL, yalnız o hesabın public profili
// sunulur — kök '/' → hedef profil, '/{slug}' → sahibin diğer profilleri (backend host-farkında
// kısıtlar; başka kullanıcının slug'ı zaten 404 döner).
const APP_HOSTNAMES = new Set(['beylink.org', 'www.beylink.org', 'localhost', '127.0.0.1']);
const isCustomDomainHost = () =>
  typeof window !== 'undefined' && !APP_HOSTNAMES.has(window.location.hostname.toLowerCase());

function DashboardShell() {
  return (
    <ProfileProvider>
      <DashboardLayout />
    </ProfileProvider>
  );
}

// Marketing sayfaları için ince Suspense fallback — Layout render olur, yalnız içerik alanı bekler.
function Suspended({ children }) {
  const { t } = useLanguage();
  return (
    <Suspense fallback={<div className="flex min-h-[40vh] items-center justify-center text-sm text-muted">{t('common.loading')}</div>}>
      {children}
    </Suspense>
  );
}

// Auth/dashboard/public sayfaları için tam ekran fallback — layout dışı, kendi kabukları var.
function SuspendedFull({ children }) {
  const { t } = useLanguage();
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-surface text-sm text-muted">{t('common.loading')}</div>}>
      {children}
    </Suspense>
  );
}

export default function App() {
  // Özel alan adı host'u — marketing/auth/dashboard rotalarını hiç render etmeden yalnız
  // public profili sun (kök '/' dahil). Ana BeyLink domaininde bu dal hiç çalışmaz.
  if (isCustomDomainHost()) {
    return (
      <Routes>
        <Route path="/" element={<SuspendedFull><PublicProfile /></SuspendedFull>} />
        <Route path="/:username" element={<SuspendedFull><PublicProfile /></SuspendedFull>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <>
    <Routes>
      {/* Marketing site — SiteLayout altında izole (Faz 9: app.beylink.org ayrımında bu ağaç ana domainde kalır).
          Lazy sayfaları Suspense ile sarmak yerine element seviyesinde <Suspense> kullanmak layout'u anında render eder
          → header/footer flicker olmaz, yalnız içerik alanı beklerken kısa spinner görünür. */}
      <Route element={<SiteLayout />}>
        <Route index element={<Home />} />
        <Route path="/features" element={<Suspended><Features /></Suspended>} />
        <Route path="/pricing" element={<Suspended><Pricing /></Suspended>} />
        <Route path="/templates" element={<Suspended><Templates /></Suspended>} />
        <Route path="/help" element={<Suspended><HelpCenter /></Suspended>} />
        <Route path="/faq" element={<Suspended><Faq /></Suspended>} />
        <Route path="/about" element={<Suspended><About /></Suspended>} />
        <Route path="/contact" element={<Suspended><Contact /></Suspended>} />
        <Route path="/privacy" element={<Suspended><Privacy /></Suspended>} />
        <Route path="/terms" element={<Suspended><Terms /></Suspended>} />
        <Route path="/cookies" element={<Suspended><Cookies /></Suspended>} />
        <Route path="/blog" element={<Suspended><BlogIndex /></Suspended>} />
        <Route path="/blog/:slug" element={<Suspended><BlogPost /></Suspended>} />

        {/* Eski Türkçe rota adları — SEO/bookmark koruması için kalıcı yönlendirme (301 niyetinde).
            Yeni İngilizce rotalar yukarıda; buradakiler yalnız geriye dönük uyumluluk. */}
        <Route path="/ozellikler" element={<Navigate to="/features" replace />} />
        <Route path="/fiyatlandirma" element={<Navigate to="/pricing" replace />} />
        <Route path="/sablonlar" element={<Navigate to="/templates" replace />} />
        <Route path="/yardim" element={<Navigate to="/help" replace />} />
        <Route path="/sss" element={<Navigate to="/faq" replace />} />
        <Route path="/hakkimizda" element={<Navigate to="/about" replace />} />
        <Route path="/iletisim" element={<Navigate to="/contact" replace />} />
        <Route path="/gizlilik" element={<Navigate to="/privacy" replace />} />
        <Route path="/kullanim-sartlari" element={<Navigate to="/terms" replace />} />
        <Route path="/cerez-politikasi" element={<Navigate to="/cookies" replace />} />
        <Route path="/blog/link-in-bio-nedir" element={<Navigate to="/blog/what-is-link-in-bio" replace />} />
        <Route path="/blog/instagram-bio-optimizasyonu" element={<Navigate to="/blog/instagram-bio-optimization" replace />} />
        <Route path="/blog/tiktok-link-kullanimi" element={<Navigate to="/blog/tiktok-bio-link" replace />} />
        <Route path="/blog/youtube-creator-araclari" element={<Navigate to="/blog/youtube-creator-tools" replace />} />
        <Route path="/blog/kisisel-marka-olusturma" element={<Navigate to="/blog/personal-branding-guide" replace />} />
        <Route path="/blog/influencer-link-yonetimi" element={<Navigate to="/blog/influencer-link-management" replace />} />
        <Route path="/blog/qr-kod-kullanim-rehberi" element={<Navigate to="/blog/qr-code-guide" replace />} />
        <Route path="/blog/dijital-kartvizit-rehberi" element={<Navigate to="/blog/digital-business-card-guide" replace />} />
        <Route path="/blog/kisa-link-kullanmanin-avantajlari" element={<Navigate to="/blog/short-link-benefits" replace />} />
        <Route path="/blog/landing-page-optimizasyonu" element={<Navigate to="/blog/landing-page-optimization" replace />} />
        <Route path="/blog/musteri-yorumlari-nasil-toplanir" element={<Navigate to="/blog/how-to-collect-customer-reviews" replace />} />
        <Route path="/blog/analitik-metriklerini-anlamak" element={<Navigate to="/blog/understanding-link-analytics" replace />} />
        <Route path="/blog/alt-hesap-yonetimi-ekipler-icin" element={<Navigate to="/blog/sub-account-management" replace />} />
      </Route>

      {/* Auth — SiteLayout dışı (kendi minimal ekranları) */}
      <Route path="/login" element={<SuspendedFull><Login /></SuspendedFull>} />
      <Route path="/register" element={<SuspendedFull><Register /></SuspendedFull>} />
      <Route path="/forgot-password" element={<SuspendedFull><ForgotPassword /></SuspendedFull>} />
      <Route path="/reset-password" element={<SuspendedFull><ResetPassword /></SuspendedFull>} />
      <Route path="/verify-email" element={<SuspendedFull><VerifyEmail /></SuspendedFull>} />

      {/* Dashboard — auth-gated + izole (Faz 9: app.beylink.org'a taşınır) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardShell />}>
          <Route index element={<SuspendedFull><LinksPage /></SuspendedFull>} />
          <Route path="design" element={<SuspendedFull><DesignPage /></SuspendedFull>} />
          <Route path="seo" element={<SuspendedFull><SeoPage /></SuspendedFull>} />
          <Route path="analytics" element={<SuspendedFull><AnalyticsPage /></SuspendedFull>} />
          <Route path="btags" element={<SuspendedFull><BtagsPage /></SuspendedFull>} />
          <Route path="sub-accounts" element={<SuspendedFull><SubAccountsPage /></SuspendedFull>} />
          <Route path="domains" element={<SuspendedFull><DomainsPage /></SuspendedFull>} />
          <Route path="plans" element={<SuspendedFull><PlansPage /></SuspendedFull>} />
          <Route path="billing" element={<SuspendedFull><BillingPage /></SuspendedFull>} />
          <Route path="top-up" element={<SuspendedFull><KrediYuklePage /></SuspendedFull>} />
          <Route path="demo-payment" element={<SuspendedFull><DemoOdemePage /></SuspendedFull>} />
          {/* Eski Türkçe dashboard rota adları — bookmark/deep-link koruması için yönlendirme */}
          <Route path="kredi-yukle" element={<Navigate to="/dashboard/top-up" replace />} />
          <Route path="demo-odeme" element={<Navigate to="/dashboard/demo-payment" replace />} />
          <Route path="help" element={<SuspendedFull><HelpPage /></SuspendedFull>} />
          <Route path="settings" element={<SuspendedFull><SettingsPage /></SuspendedFull>} />
          <Route path="admin" element={<SuspendedFull><AdminDashboard /></SuspendedFull>} />
        </Route>
      </Route>

      {/* Public profil (ana domainde kalır — /:username) */}
      <Route path="/:username" element={<SuspendedFull><PublicProfile /></SuspendedFull>} />

      {/* Bilinmeyen rota → ana sayfa (SiteLayout üzerinden) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    {/* İlk-ziyaret çerez/gizlilik bildirimi — yalnız ana host'ta (branded dalda mount edilmez). */}
    <CookieNotice />
    </>
  );
}
