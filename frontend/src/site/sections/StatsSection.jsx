import { useLanguage } from '../../context/LanguageContext.jsx';

// Görev 1.4 — İstatistik bölümü (login öncesi tanıtım için toparlanmış rakamlar).
// Rakamlar tanıtım niyetlidir; kullanıcı giriş yapınca kendi gerçek analitiğini panelde görür.
const STATS = [
  { k: 'pages' },
  { k: 'links' },
  { k: 'clicks' },
  { k: 'satisfaction' },
];

export function StatsSection() {
  const { t } = useLanguage();
  return (
    <section id="statistics" aria-labelledby="statistics-heading" className="border-y border-line bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h2 id="statistics-heading" className="sr-only">{t('landing.stats.srHeading')}</h2>
        <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.k} className="text-center sm:text-left">
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{t(`landing.stats.${s.k}`)}</dt>
              <dd className="mt-1 font-display text-3xl font-extrabold text-ink sm:text-4xl">{t(`landing.stats.${s.k}.value`)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
