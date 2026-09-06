import {
  Instagram, Twitter, Youtube, Facebook, Linkedin, Github, Twitch,
  Send, MessageCircle, Mail, Globe, Link as LinkIcon, Music2, Phone,
  BookOpen, ShoppingBag, Camera, Video, Rss, Dribbble, Figma, Star,
} from 'lucide-react';

// icon_name (string) → Lucide bileşeni
export const ICON_MAP = {
  instagram: Instagram,
  twitter: Twitter,
  x: Twitter,
  youtube: Youtube,
  facebook: Facebook,
  linkedin: Linkedin,
  github: Github,
  twitch: Twitch,
  telegram: Send,
  whatsapp: MessageCircle,
  tiktok: Music2,
  mail: Mail,
  email: Mail,
  phone: Phone,
  globe: Globe,
  link: LinkIcon,
  'book-open': BookOpen,
  shop: ShoppingBag,
  camera: Camera,
  video: Video,
  rss: Rss,
  dribbble: Dribbble,
  figma: Figma,
  music: Music2,
  star: Star,
};

export function Icon({ name, ...props }) {
  const Cmp = ICON_MAP[name] || LinkIcon;
  return <Cmp {...props} />;
}

// Onboarding / hızlı ekleme için sosyal katalog. `label` alanları çoğunlukla marka adı
// (Instagram, TikTok, ...) — çeviri gerektirmez. Yalnız 'mail' Türkçe bir kelime ("E-posta");
// i18n anahtarı `social.mail.label` altında hazır (bkz. locales/{tr,en}.json). Render eden
// component (Task 2b: components/links/AddSocialModal.jsx) `socialLabel(item, t)` kullanmalı.
export const SOCIAL_CATALOG = [
  { key: 'instagram', label: 'Instagram', placeholder: 'instagram.com/kullanici' },
  { key: 'tiktok', label: 'TikTok', placeholder: 'tiktok.com/@kullanici' },
  { key: 'x', label: 'X (Twitter)', placeholder: 'x.com/kullanici' },
  { key: 'youtube', label: 'YouTube', placeholder: 'youtube.com/@kanal' },
  { key: 'facebook', label: 'Facebook', placeholder: 'facebook.com/sayfa' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/kullanici' },
  { key: 'whatsapp', label: 'WhatsApp', placeholder: 'wa.me/905xxxxxxxxx' },
  { key: 'telegram', label: 'Telegram', placeholder: 't.me/kullanici' },
  { key: 'github', label: 'GitHub', placeholder: 'github.com/kullanici' },
  { key: 'mail', label: 'E-posta', placeholder: 'mailto:ad@ornek.com' },
];

// socialLabel(item, t?) — 'mail' için i18n anahtarından ("Email"/"E-posta"), diğerleri için
// veri alanındaki marka adından (mutasyona uğramaz) okur. t verilmezse orijinal alan döner.
export function socialLabel(item, t) {
  if (item.key === 'mail') return t ? t('social.mail.label') : item.label;
  return item.label;
}
