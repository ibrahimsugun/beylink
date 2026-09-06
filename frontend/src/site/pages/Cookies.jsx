import { LegalPage } from '../LegalPage.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function Cookies() {
  const { t } = useLanguage();
  return (
    <LegalPage
      title={t('seo.cookies.title')}
      description={t('seo.cookies.description')}
      path="/cookies"
      breadcrumbs={[{ name: t('nav.home'), path: '/' }, { name: t('footer.link.cookies'), path: '/cookies' }]}
      lastUpdated="2026-07-09"
      intro={t('legal.cookies.intro')}
      sections={[
        {
          id: 'ne-nerede',
          title: t('legal.cookies.s1.title'),
          body: (
            <>
              <ul className="mt-1 list-disc space-y-2.5 pl-5">
                <li>
                  <code className="rounded bg-surface px-1.5 py-0.5 text-xs">beylink_token</code>{t('legal.cookies.s1.items.0.a')}<strong>{t('legal.cookies.s1.items.0.strong')}</strong>{t('legal.cookies.s1.items.0.b')}
                </li>
                <li>
                  <code className="rounded bg-surface px-1.5 py-0.5 text-xs">beylink_vid</code>{t('legal.cookies.s1.items.1.a')}<strong>{t('legal.cookies.s1.items.1.strong1')}</strong>{t('legal.cookies.s1.items.1.b')}<strong>{t('legal.cookies.s1.items.1.strong2')}</strong>{t('legal.cookies.s1.items.1.c')}
                </li>
                <li>
                  <code className="rounded bg-surface px-1.5 py-0.5 text-xs">beylink_lang</code>{t('legal.cookies.s1.items.2.a')}<strong>{t('legal.cookies.s1.items.2.strong')}</strong>{t('legal.cookies.s1.items.2.b')}
                </li>
              </ul>
              <p className="mt-4">{t('legal.cookies.s1.outro')}</p>
            </>
          ),
        },
        {
          id: 'neden-cerez',
          title: t('legal.cookies.s2.title'),
          body: t('legal.cookies.s2.body'),
        },
        {
          id: 'profil-pixel',
          title: t('legal.cookies.s3.title'),
          body: t('legal.cookies.s3.body'),
        },
        {
          id: 'temizlemek',
          title: t('legal.cookies.s4.title'),
          body: t('legal.cookies.s4.body'),
        },
      ]}
    />
  );
}
