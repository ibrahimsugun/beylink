import { LegalPage } from '../LegalPage.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function Privacy() {
  const { t } = useLanguage();
  return (
    <LegalPage
      title={t('seo.privacy.title')}
      description={t('seo.privacy.description')}
      path="/privacy"
      breadcrumbs={[{ name: t('nav.home'), path: '/' }, { name: t('footer.link.privacy'), path: '/privacy' }]}
      lastUpdated="2026-07-07"
      intro={t('legal.privacy.intro')}
      sections={[
        {
          id: 'veri-sorumlusu',
          title: t('legal.privacy.s1.title'),
          body: t('legal.privacy.s1.body'),
        },
        {
          id: 'toplanan-veriler',
          title: t('legal.privacy.s2.title'),
          body: (
            <>
              <p>{t('legal.privacy.s2.lead')}</p>
              <ul className="mt-3 list-disc space-y-1.5 pl-5">
                <li><strong>{t('legal.privacy.s2.items.0.label')}</strong> {t('legal.privacy.s2.items.0.text')}</li>
                <li><strong>{t('legal.privacy.s2.items.1.label')}</strong> {t('legal.privacy.s2.items.1.text')}</li>
                <li><strong>{t('legal.privacy.s2.items.2.label')}</strong> {t('legal.privacy.s2.items.2.text')}</li>
                <li><strong>{t('legal.privacy.s2.items.3.label')}</strong> {t('legal.privacy.s2.items.3.text')}<strong>{t('legal.privacy.s2.items.3.strong')}</strong>{t('legal.privacy.s2.items.3.textAfter')}</li>
                <li><strong>{t('legal.privacy.s2.items.4.label')}</strong> {t('legal.privacy.s2.items.4.text')}</li>
                <li><strong>{t('legal.privacy.s2.items.5.label')}</strong> {t('legal.privacy.s2.items.5.text')}</li>
              </ul>
            </>
          ),
        },
        {
          id: 'kullanim-amaci',
          title: t('legal.privacy.s3.title'),
          body: (
            <ul className="list-disc space-y-1.5 pl-5">
              <li>{t('legal.privacy.s3.items.0')}</li>
              <li>{t('legal.privacy.s3.items.1')}</li>
              <li>{t('legal.privacy.s3.items.2')}</li>
              <li>{t('legal.privacy.s3.items.3')}</li>
              <li>{t('legal.privacy.s3.items.4')}</li>
              <li>{t('legal.privacy.s3.items.5')}</li>
            </ul>
          ),
        },
        {
          id: 'yasal-dayanak',
          title: t('legal.privacy.s4.title'),
          body: t('legal.privacy.s4.body'),
        },
        {
          id: 'paylasim',
          title: t('legal.privacy.s5.title'),
          body: (
            <>
              <p>{t('legal.privacy.s5.lead')}</p>
              <ul className="mt-3 list-disc space-y-1.5 pl-5">
                <li><strong>{t('legal.privacy.s5.items.0.label')}</strong> {t('legal.privacy.s5.items.0.text')}</li>
                <li><strong>{t('legal.privacy.s5.items.1.label')}</strong> {t('legal.privacy.s5.items.1.text')}</li>
                <li><strong>{t('legal.privacy.s5.items.2.label')}</strong> {t('legal.privacy.s5.items.2.text')}</li>
              </ul>
              <p className="mt-3">{t('legal.privacy.s5.outro')}</p>
            </>
          ),
        },
        {
          id: 'saklama',
          title: t('legal.privacy.s6.title'),
          body: t('legal.privacy.s6.body'),
        },
        {
          id: 'guvenlik',
          title: t('legal.privacy.s7.title'),
          body: t('legal.privacy.s7.body'),
        },
        {
          id: 'haklariniz',
          title: t('legal.privacy.s8.title'),
          body: (
            <ul className="list-disc space-y-1.5 pl-5">
              <li>{t('legal.privacy.s8.items.0')}</li>
              <li>{t('legal.privacy.s8.items.1')}</li>
              <li>{t('legal.privacy.s8.items.2')}</li>
              <li>{t('legal.privacy.s8.items.3')}</li>
              <li>{t('legal.privacy.s8.items.4')}</li>
              <li>{t('legal.privacy.s8.items.5')}</li>
            </ul>
          ),
        },
        {
          id: 'cerezler',
          title: t('legal.privacy.s9.title'),
          body: (
            <>
              <p>{t('legal.privacy.s9.body.pre')}<a href="/cookies" className="font-semibold text-brand-violet hover:underline">{t('legal.privacy.s9.body.link')}</a>{t('legal.privacy.s9.body.post')}</p>
            </>
          ),
        },
        {
          id: 'degisiklikler',
          title: t('legal.privacy.s10.title'),
          body: t('legal.privacy.s10.body'),
        },
        {
          id: 'iletisim',
          title: t('legal.privacy.s11.title'),
          body: t('legal.privacy.s11.body'),
        },
      ]}
    />
  );
}
