import { useEffect } from 'react';

/**
 * Imperatif <head> yöneticisi — react-helmet-async React 18.3'te document.head'i
 * güncellemediğinden sıfır-bağımlılık, deterministik alternatif.
 *
 * UPSERT mantığı: aynı name/property/rel'e sahip bir etiket zaten varsa (ör. index.html'deki
 * statik OG varsayılanları) onu GÜNCELLER — çift etiket oluşmaz. Yoksa yenisini ekler.
 * Unmount olunca (ya da tags/title değişince) her değişikliği GERİ ALIR (eski değeri restore
 * eder / eklediğini siler), böylece profil→anasayfa geçişinde varsayılanlar geri döner.
 *
 * tags: dizi — { name, content } | { property, content } | { rel, href }.
 *   content/href boş/null olan atlanır; falsy (koşullu) elemanlar yok sayılır.
 */
export function useHeadMeta({ title, tags = [] } = {}) {
  const serialized = JSON.stringify({ title: title || null, tags });
  useEffect(() => {
    const prevTitle = document.title;
    if (title) document.title = title;

    const restores = []; // her değişikliği geri alan fonksiyonlar (ters sırada çalışır)

    const upsert = (selector, create, valueAttr, value) => {
      const el = document.head.querySelector(selector);
      if (el) {
        const prev = el.getAttribute(valueAttr);
        el.setAttribute(valueAttr, value);
        restores.push(() => (prev == null ? el.removeAttribute(valueAttr) : el.setAttribute(valueAttr, prev)));
      } else {
        const node = create();
        node.setAttribute(valueAttr, value);
        node.setAttribute('data-bl-head', '');
        document.head.appendChild(node);
        restores.push(() => node.remove());
      }
    };

    for (const t of tags) {
      if (!t) continue;
      if (t.rel) {
        if (!t.href) continue;
        upsert(`link[rel="${t.rel}"]`, () => {
          const l = document.createElement('link');
          l.setAttribute('rel', t.rel);
          return l;
        }, 'href', String(t.href));
      } else {
        const attr = t.property ? 'property' : 'name';
        const key = t.property || t.name;
        if (!key || t.content == null || t.content === '') continue;
        upsert(`meta[${attr}="${key}"]`, () => {
          const m = document.createElement('meta');
          m.setAttribute(attr, key);
          return m;
        }, 'content', String(t.content));
      }
    }

    return () => {
      document.title = prevTitle;
      for (let i = restores.length - 1; i >= 0; i--) restores[i]();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialized]);
}
