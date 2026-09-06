export const LANGUAGES = [
  { code: 'tr', label: 'Türkçe', flag: '\u{1F1F9}\u{1F1F7}', locale: 'tr-TR', visible: true },
  { code: 'en', label: 'English', flag: '\u{1F1EC}\u{1F1E7}', locale: 'en-US', visible: true },
  { code: 'ru', label: 'Русский', flag: '\u{1F1F7}\u{1F1FA}', locale: 'ru-RU', visible: true },
  { code: 'es', label: 'Español', flag: '\u{1F1EA}\u{1F1F8}', locale: 'es-ES', visible: true },
  { code: 'de', label: 'Deutsch', flag: '\u{1F1E9}\u{1F1EA}', locale: 'de-DE', visible: true },
  { code: 'fr', label: 'Français', flag: '\u{1F1EB}\u{1F1F7}', locale: 'fr-FR', visible: true },
  { code: 'pt', label: 'Português', flag: '\u{1F1E7}\u{1F1F7}', locale: 'pt-BR', visible: true },
  { code: 'it', label: 'Italiano', flag: '\u{1F1EE}\u{1F1F9}', locale: 'it-IT', visible: true },
  { code: 'ja', label: '日本語', flag: '\u{1F1EF}\u{1F1F5}', locale: 'ja-JP', visible: true },
];

// Yeni temel dil İngilizce; Türkçe tarayıcılar TR alır, geri kalanı EN.
export const DEFAULT_LANG = 'en';

export const LANG_MAP = Object.fromEntries(LANGUAGES.map((l) => [l.code, l]));

// localStorage'da kayıt yoksa tarayıcı diline göre başlangıç dilini seçer.
// navigator.language 'tr' ile başlıyorsa 'tr', aksi halde 'en'.
export function detectInitialLang() {
  if (typeof navigator === 'undefined' || !navigator.language) return DEFAULT_LANG;
  return navigator.language.toLowerCase().startsWith('tr') ? 'tr' : 'en';
}
