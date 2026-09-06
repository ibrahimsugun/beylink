import { LegalPage } from '../LegalPage.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function Terms() {
  const { t } = useLanguage();
  return (
    <LegalPage
      title={t('seo.terms.title')}
      description={t('seo.terms.description')}
      path="/terms"
      breadcrumbs={[{ name: t('nav.home'), path: '/' }, { name: t('footer.link.terms'), path: '/terms' }]}
      lastUpdated="2026-07-07"
      intro={t('legal.terms.intro')}
      sections={[
        {
          id: 'servis',
          title: t('legal.terms.s1.title'),
          body: t('legal.terms.s1.body'),
        },
        {
          id: 'hesap',
          title: t('legal.terms.s2.title'),
          body: (
            <>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>{t('legal.terms.s2.items.0')}</li>
                <li>{t('legal.terms.s2.items.1')}</li>
                <li>{t('legal.terms.s2.items.2')}</li>
                <li>{t('legal.terms.s2.items.3')}</li>
              </ul>
            </>
          ),
        },
        {
          id: 'kabul-edilmeyen-icerik',
          title: t('legal.terms.s3.title'),
          body: (
            <>
              <p>{t('legal.terms.s3.lead.pre')}<strong>{t('legal.terms.s3.lead.strong')}</strong>{t('legal.terms.s3.lead.post')}</p>
              <ul className="mt-3 list-disc space-y-1.5 pl-5">
                <li>{t('legal.terms.s3.items.0')}</li>
                <li>{t('legal.terms.s3.items.1')}</li>
                <li>{t('legal.terms.s3.items.2')}</li>
                <li>{t('legal.terms.s3.items.3')}</li>
                <li>{t('legal.terms.s3.items.4')}</li>
                <li>{t('legal.terms.s3.items.5')}</li>
                <li>{t('legal.terms.s3.items.6')}</li>
              </ul>
              <p className="mt-3">{t('legal.terms.s3.outro')}</p>
            </>
          ),
        },
        {
          id: 'kullanici-icerigi',
          title: t('legal.terms.s4.title'),
          body: t('legal.terms.s4.body'),
        },
        {
          id: 'planlar-odeme',
          title: t('legal.terms.s5.title'),
          body: (
            <>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>{t('legal.terms.s5.items.0.pre')}<a href="/pricing" className="font-semibold text-brand-violet hover:underline">{t('legal.terms.s5.items.0.link')}</a>{t('legal.terms.s5.items.0.post')}</li>
                <li>{t('legal.terms.s5.items.1')}</li>
                <li>{t('legal.terms.s5.items.2')}</li>
                <li>{t('legal.terms.s5.items.3')}</li>
                <li>{t('legal.terms.s5.items.4')}</li>
              </ul>
            </>
          ),
        },
        {
          id: 'iptal',
          title: t('legal.terms.s6.title'),
          body: t('legal.terms.s6.body'),
        },
        {
          id: 'sorumluluk-siniri',
          title: t('legal.terms.s7.title'),
          body: t('legal.terms.s7.body'),
        },
        {
          id: 'ucuncu-taraf',
          title: t('legal.terms.s8.title'),
          body: t('legal.terms.s8.body'),
        },
        {
          id: 'degisiklik',
          title: t('legal.terms.s9.title'),
          body: t('legal.terms.s9.body'),
        },
        {
          id: 'iletisim',
          title: t('legal.terms.s11.title'),
          body: t('legal.terms.s11.body'),
        },
      ]}
    />
  );
}
