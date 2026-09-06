import { useLanguage } from '../../context/LanguageContext.jsx';

export function Spinner({ size = 20, className = '' }) {
  const { t } = useLanguage();
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      style={{ width: size, height: size }}
      aria-label={t('common.loading')}
    />
  );
}

export function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface text-brand-violet">
      <Spinner size={32} />
    </div>
  );
}
