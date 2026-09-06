// Görev 1.5 — "Neden BeyLink?" için tek özellik kartı (ayrı component; kart yapısı ile aynı grid'de tekrar kullanılır).
export function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <article className="card p-6 transition hover:shadow-pop">
      <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-white">
        <Icon size={20} />
      </span>
      <h3 className="mt-4 font-display text-lg font-bold text-ink">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{desc}</p>
    </article>
  );
}
