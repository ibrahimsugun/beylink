import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Palette, Users, QrCode } from 'lucide-react';
import { Logo } from '../components/ui/Logo.jsx';
import { ProfileView } from '../components/profile/ProfileView.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const DEMO = {
  profile: { username: 'demo', display_name: 'Deniz Kaya', bio: 'Müzisyen · Prodüktör 🎧', theme_settings: { template: 'midnight', title_align: 'center' } },
  links: [
    { id: 1, type: 'social', title: 'Instagram', icon_name: 'instagram', url: '#' },
    { id: 2, type: 'social', title: 'YouTube', icon_name: 'youtube', url: '#' },
    { id: 3, type: 'social', title: 'TikTok', icon_name: 'tiktok', url: '#' },
    { id: 4, type: 'link', title: 'Yeni Single 🎵', icon_name: 'music', url: '#' },
    { id: 5, type: 'link', title: 'Konser Biletleri', icon_name: 'link', url: '#' },
  ],
};

const FEATURES = [
  { icon: Palette, title: 'Tam Özelleştirme', desc: 'Temalar, renkler, kapak ve düzen — markana göre.' },
  { icon: BarChart3, title: 'Detaylı Analitik', desc: 'Tıklama, CTR, cihaz ve referrer kırılımları.' },
  { icon: Users, title: 'Alt Hesaplar', desc: 'Müşteri/ekip profillerini tek panelden yönet.' },
  { icon: QrCode, title: 'QR Kod', desc: 'Profilini anında paylaşılabilir QR’a dönüştür.' },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-surface">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <nav className="flex items-center gap-3">
          {user ? (
            <Link to="/dashboard" className="btn-brand">Panele Git <ArrowRight size={15} /></Link>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Giriş</Link>
              <Link to="/register" className="btn-brand">Ücretsiz Başla</Link>
            </>
          )}
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-2 lg:py-20">
        <div>
          <span className="chip bg-brand-violet/10 text-brand-violet">Link-in-bio · Tek sayfa</span>
          <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
            Tüm bağlantıların,<br /><span className="bg-brand-gradient bg-clip-text text-transparent">tek bir BeyLink’te.</span>
          </h1>
          <p className="mt-4 max-w-md text-lg text-muted">
            Sosyal medyanı, projelerini ve butonlarını tek profilde topla. Paylaş, analiz et, büyü.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="btn-brand px-6 py-3 text-base">Hemen Oluştur <ArrowRight size={18} /></Link>
            <Link to="/demo" className="btn-ghost px-6 py-3 text-base">Demoyu Gör</Link>
          </div>
          <p className="mt-3 text-sm text-muted">beylink.com/<span className="font-semibold text-ink">kullaniciadin</span></p>
        </div>

        <div className="flex justify-center">
          <div className="relative h-[540px] w-[270px] rotate-2 rounded-[2.4rem] border-[10px] border-ink bg-ink shadow-pop">
            <div className="thin-scroll h-full w-full overflow-hidden rounded-[1.7rem]">
              <ProfileView profile={DEMO.profile} links={DEMO.links} showBranding={false} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-white"><Icon size={20} /></span>
              <h3 className="mt-3 font-bold text-ink">{title}</h3>
              <p className="mt-1 text-sm text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-line py-8 text-center text-sm text-muted">
        <Logo size={22} className="justify-center" />
        <p className="mt-2">© 2026 BeyLink · Heylink & Linktree’den ilhamla</p>
      </footer>
    </div>
  );
}
