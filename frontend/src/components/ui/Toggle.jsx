export function Toggle({ checked, onChange, disabled = false, size = 'md' }) {
  const w = size === 'sm' ? 'w-9 h-5' : 'w-11 h-6';
  const knob = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5';
  const translate = size === 'sm' ? 'translate-x-4' : 'translate-x-5';
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex ${w} shrink-0 items-center rounded-full transition-colors
        ${checked ? 'bg-brand-gradient' : 'bg-line'} ${disabled ? 'opacity-50' : ''}`}
    >
      <span
        className={`inline-block ${knob} transform rounded-full bg-white shadow transition-transform
          ${checked ? translate : 'translate-x-0.5'}`}
        style={{ width: size === 'sm' ? '0.875rem' : '1.125rem', height: size === 'sm' ? '0.875rem' : '1.125rem' }}
      />
    </button>
  );
}
