export function Logo({ size = 28, withText = true, className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src="/logo-mark.svg" width={size} height={size} alt="" aria-hidden="true" />
      {withText && (
        <span className="font-display text-lg font-extrabold tracking-tight text-ink">
          Bey<span className="text-brand-violet">Link</span>
        </span>
      )}
    </div>
  );
}
