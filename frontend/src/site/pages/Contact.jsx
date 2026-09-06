import { useState } from 'react';
import { Mail, MessageSquare, HelpCircle } from 'lucide-react';
import { useSeo, breadcrumbSchema } from '../../lib/seo.js';
import { PageHero } from '../PageHero.jsx';
import { Section } from '../../components/ui/Section.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

const SUPPORT_EMAIL = 'destek@beylink.org';

export default function Contact() {
  const { t } = useLanguage();
  const breadcrumbs = [{ name: t('nav.home'), path: '/' }, { name: t('footer.link.contact'), path: '/contact' }];
  useSeo({
    title: t('seo.contact.title'),
    description: t('seo.contact.description'),
    keywords: t('seo.contact.keywords'),
    path: '/contact',
    jsonLd: [
      breadcrumbSchema(breadcrumbs),
      {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: t('seo.contact.schemaName'),
        contactOption: 'TollFree',
        contactPoint: [{
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: SUPPORT_EMAIL,
          availableLanguage: ['Turkish', 'English'],
        }],
      },
    ],
  });

  const [sent, setSent] = useState(false);
  const onSubmit = (e) => {
    e.preventDefault();
    // Form-endpoint canlıda backend'e bağlanacak (Faz 4/mailer). Şimdilik istemcide onaylıyoruz.
    setSent(true);
  };

  return (
    <>
      <PageHero
        kicker={t('footer.link.contact')}
        title={t('pages.contact.hero.title')}
        lead={t('pages.contact.hero.lead')}
        breadcrumbs={breadcrumbs}
      />

      <Section id="contact-grid" ariaLabel={t('pages.contact.grid.aria')}>
        <div className="grid gap-10 lg:grid-cols-5">
          {/* Sol: kanal kartları */}
          <div className="space-y-4 lg:col-span-2">
            <article className="card p-6">
              <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-white">
                <Mail size={20} />
              </span>
              <h2 className="mt-4 font-display text-lg font-bold text-ink">{t('pages.contact.channel.email.title')}</h2>
              <p className="mt-1.5 text-sm text-muted">{t('pages.contact.channel.email.desc')}</p>
              <address className="mt-3 not-italic">
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-sm font-semibold text-brand-violet hover:underline">
                  {SUPPORT_EMAIL}
                </a>
              </address>
            </article>

            <article className="card p-6">
              <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-white">
                <HelpCircle size={20} />
              </span>
              <h2 className="mt-4 font-display text-lg font-bold text-ink">{t('footer.link.helpCenter')}</h2>
              <p className="mt-1.5 text-sm text-muted">{t('pages.contact.channel.help.desc')}</p>
              <a href="/help" className="mt-3 inline-block text-sm font-semibold text-brand-violet hover:underline">{t('pages.contact.channel.help.link')}</a>
            </article>

            <article className="card p-6">
              <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-white">
                <MessageSquare size={20} />
              </span>
              <h2 className="mt-4 font-display text-lg font-bold text-ink">{t('pages.contact.channel.social.title')}</h2>
              <p className="mt-1.5 text-sm text-muted">{t('pages.contact.channel.social.desc')}</p>
            </article>
          </div>

          {/* Sağ: form */}
          <div className="lg:col-span-3">
            <form onSubmit={onSubmit} className="card p-6 sm:p-8">
              <h2 className="font-display text-xl font-bold text-ink">{t('pages.contact.form.title')}</h2>
              <p className="mt-1.5 text-sm text-muted">
                {t('pages.contact.form.subtitle')}
              </p>

              {sent ? (
                <div className="mt-6 rounded-xl border border-brand-teal/30 bg-brand-teal/10 p-4 text-sm text-ink">
                  {t('pages.contact.form.successPre')}
                  <a href="/help" className="font-semibold text-brand-violet hover:underline">{t('pages.contact.form.successLink')}</a>.
                </div>
              ) : (
                <div className="mt-6 grid gap-4">
                  <div>
                    <label htmlFor="c-name" className="label">{t('pages.contact.form.name')} <span className="text-danger">*</span></label>
                    <input id="c-name" required type="text" className="input" placeholder={t('pages.contact.form.namePlaceholder')} />
                  </div>
                  <div>
                    <label htmlFor="c-email" className="label">{t('pages.contact.form.email')} <span className="text-danger">*</span></label>
                    <input id="c-email" required type="email" className="input" placeholder={t('pages.contact.form.emailPlaceholder')} />
                  </div>
                  <div>
                    <label htmlFor="c-topic" className="label">{t('pages.contact.form.topic')}</label>
                    <select id="c-topic" className="input">
                      <option>{t('pages.contact.form.topicGeneral')}</option>
                      <option>{t('pages.contact.form.topicTech')}</option>
                      <option>{t('pages.contact.form.topicBilling')}</option>
                      <option>{t('pages.contact.form.topicPartnership')}</option>
                      <option>{t('pages.contact.form.topicFeedback')}</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="c-msg" className="label">{t('pages.contact.form.message')} <span className="text-danger">*</span></label>
                    <textarea id="c-msg" required rows={5} className="input" placeholder={t('pages.contact.form.messagePlaceholder')} />
                  </div>
                  <button type="submit" className="btn-brand mt-2">{t('pages.contact.form.submit')}</button>
                </div>
              )}
            </form>
          </div>
        </div>
      </Section>
    </>
  );
}
