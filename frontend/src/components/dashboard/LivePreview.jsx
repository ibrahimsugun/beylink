import { useState } from 'react';
import { Smartphone, ExternalLink } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { ProfileView } from '../profile/ProfileView.jsx';

export function LivePreview() {
  const { profile, links } = useProfile();
  const { t } = useLanguage();
  const [key, setKey] = useState(0); // yenile butonu için

  if (!profile) return null;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted">
        <Smartphone size={14} /> {t('livepreview.title')}
      </div>

      {/* Telefon çerçevesi */}
      <div className="relative h-[560px] w-[280px] rounded-[2.4rem] border-[10px] border-ink bg-ink shadow-pop">
        <div className="absolute left-1/2 top-2 z-10 h-1.5 w-16 -translate-x-1/2 rounded-full bg-white/30" />
        <div key={key} className="thin-scroll h-full w-full overflow-y-auto rounded-[1.7rem]">
          <ProfileView profile={profile} links={links} />
        </div>
      </div>

      <a
        href={`/${profile.username}`}
        target="_blank"
        rel="noreferrer"
        className="btn-ghost text-xs"
        onClick={() => setKey((k) => k + 1)}
      >
        <ExternalLink size={13} /> /{profile.username}
      </a>
    </div>
  );
}
