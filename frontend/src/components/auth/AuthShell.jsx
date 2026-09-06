import { Logo } from '../ui/Logo.jsx';
import { ProfileView } from '../profile/ProfileView.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

function demoData(t) {
  return {
    profile: {
      username: 'demo',
      display_name: 'Mira Yılmaz',
      bio: t('auth.shell.demo.bio'),
      avatar_url: null,
      theme_settings: { template: 'brand', title_align: 'center', header_type: 'avatar' },
    },
    links: [
      { id: 1, type: 'social', title: 'Instagram', icon_name: 'instagram', url: '#' },
      { id: 2, type: 'social', title: 'YouTube', icon_name: 'youtube', url: '#' },
      { id: 3, type: 'social', title: 'TikTok', icon_name: 'tiktok', url: '#' },
      { id: 5, type: 'link', title: t('auth.shell.demo.videoTitle'), icon_name: 'video', url: '#' },
      { id: 6, type: 'link', title: t('auth.shell.demo.personalSite'), icon_name: 'globe', url: '#' },
    ],
  };
}

export function AuthShell({ title, subtitle, children }) {
  const { t } = useLanguage();
  const DEMO = demoData(t);
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Sol — form */}
      <div className="flex flex-col px-6 py-8 sm:px-12 lg:px-16">
        <Logo />
        <div className="flex flex-1 flex-col justify-center py-10">
          <div className="mx-auto w-full max-w-md">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{title}</h1>
            {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>

      {/* Sağ — marka paneli + önizleme */}
      <div className="relative hidden items-center justify-center overflow-hidden bg-brand-gradient-soft lg:flex">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-brand-teal/20 blur-3xl" />
        <div className="absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-brand-violet/20 blur-3xl" />
        <div className="relative h-[520px] w-[260px] rotate-3 rounded-[2.2rem] border-[10px] border-ink bg-ink shadow-pop">
          <div className="thin-scroll h-full w-full overflow-hidden rounded-[1.6rem]">
            <ProfileView profile={DEMO.profile} links={DEMO.links} showBranding={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
