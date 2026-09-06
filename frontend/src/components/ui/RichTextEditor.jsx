import { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Link2, Eraser } from 'lucide-react';

/**
 * Hafif, sıfır-bağımlılık zengin metin editörü (contentEditable + execCommand).
 * Çıktı ham HTML'dir; GÜVENLİK backend sanitizeBioHtml ile sağlanır (her yazımda).
 * Bu bileşen sadece düzenleme kolaylığı sağlar — güvenlik sınırı sunucudadır.
 *
 * Not: İçeriği React state'ine yazMIYORuz (onChange yok); yalnız onBlur ile kaydedilir.
 * Böylece canlı önizleme her zaman SUNUCUDAN dönen SANITIZE edilmiş HTML'i gösterir.
 */
export function RichTextEditor({ value = '', onBlur, placeholder = '' }) {
  const ref = useRef(null);
  const lastValue = useRef(null);

  // İçeriği yalnızca DIŞARIDAN değiştiğinde DOM'a yaz (kullanıcı yazarken imleç sıçramasın)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (value !== lastValue.current && value !== el.innerHTML) {
      el.innerHTML = value || '';
    }
    lastValue.current = value;
  }, [value]);

  const exec = (cmd, arg) => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    // styleWithCSS=false → biçimlendirme <b>/<i>/<u> tag'leri üretir (span style değil → sanitizer korur)
    try { document.execCommand('styleWithCSS', false, false); } catch { /* yok say */ }
    document.execCommand(cmd, false, arg);
  };

  const addLink = () => {
    const url = window.prompt('Bağlantı URL’si (https://...)');
    if (url) exec('createLink', url);
  };

  const Btn = ({ onClick, title, children }) => (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()} // editör odağını kaybetme
      onClick={onClick}
      title={title}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft transition hover:bg-surface"
    >
      {children}
    </button>
  );

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white focus-within:border-brand-violet focus-within:ring-2 focus-within:ring-brand-violet/20">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-line bg-surface/60 px-2 py-1.5">
        <Btn onClick={() => exec('bold')} title="Kalın"><Bold size={15} /></Btn>
        <Btn onClick={() => exec('italic')} title="İtalik"><Italic size={15} /></Btn>
        <Btn onClick={() => exec('underline')} title="Altı çizili"><Underline size={15} /></Btn>
        <span className="mx-1 h-5 w-px bg-line" />
        <Btn onClick={() => exec('insertUnorderedList')} title="Madde listesi"><List size={15} /></Btn>
        <Btn onClick={() => exec('insertOrderedList')} title="Numaralı liste"><ListOrdered size={15} /></Btn>
        <Btn onClick={addLink} title="Bağlantı ekle"><Link2 size={15} /></Btn>
        <span className="mx-1 h-5 w-px bg-line" />
        <Btn onClick={() => exec('removeFormat')} title="Biçimi temizle"><Eraser size={15} /></Btn>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onBlur={() => onBlur?.(ref.current?.innerHTML || '')}
        data-placeholder={placeholder}
        className="bl-rich min-h-[96px] px-3 py-2.5 text-sm text-ink outline-none"
      />
    </div>
  );
}
