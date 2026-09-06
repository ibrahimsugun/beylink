import { domainModel } from '../models/domainModel.js';
import { userModel } from '../models/userModel.js';
import { applyExpiryIfNeeded, planCaps } from '../utils/plan.js';
import { config } from '../config/env.js';

/**
 * Host-farkında yönlendirme motoru (A4/B3). İstekteki Host başlığı BeyLink'in kendi
 * hostname'lerinden biri DEĞİLSE, `custom_domains`'te aranır. Eşleşme aktifse VE sahibinin
 * planı hâlâ brandedDomain cap'ine sahipse `req.customDomain` set edilir; aksi halde
 * (bilinmeyen host, doğrulanmamış domain, ya da plan düştü) `req.customDomain` undefined
 * kalır ve istek normal (BeyLink ana domaini) gibi işlenir.
 *
 * publicController/prerenderController/seoRoutes bunu okuyup: kök '/' → target profil,
 * '/{slug}' → yalnız o sahibin profilleri, canonical/OG/sitemap host'a göre üretir.
 */
export function resolveHost(req, _res, next) {
  const hostHeader = (req.headers.host || '').split(':')[0].toLowerCase();
  if (!hostHeader || config.appHostnames.has(hostHeader)) return next();

  // custom_domains artık apex + subdomain (ör. links.siteniz.com) satırlarını VERBATIM saklar.
  // 'www.' önekini atmak yalnız www→apex kanonikliği içindir: `www.siteniz.com` ve `siteniz.com`
  // aynı apex satırını bulur (redirect Caddy'de yapılır). www-DIŞI alt alan host'ları (subdomain)
  // 'www.' ile başlamadığından değişmeden aranır → kendi satırıyla birebir eşleşir.
  const domain = hostHeader.replace(/^www\./, '');
  const row = domainModel.findActiveByDomain(domain);
  if (row) {
    const owner = applyExpiryIfNeeded(userModel.findById(row.user_id));
    if (owner && planCaps(owner).brandedDomain) {
      req.customDomain = row;
    }
  }
  next();
}
