import dns from 'node:dns/promises';
import { config } from '../config/env.js';

// "Bize işaret ediyor mu" doğrulaması (A3): domain'in A/CNAME kaydı sunucumuza çözümleniyor mu?
// Apex domainler CNAME alamadığı için A kaydı (serverIp) beklenir; subdomainler CNAME (cnameTarget)
// kullanabilir — ikisinden biri yeterlidir. verifyToken verilmişse TXT de eşleşmelidir (katı doğrulama).
// `resolver`/`serverIp`/`cnameTarget` parametreleri (varsayılan: gerçek `node:dns/promises` +
// config.brandedDomain) testlerin gerçek ağa çıkmadan ve dev'de serverIp boş olsa bile sahte
// DNS yanıtları enjekte edebilmesi için — üretim çağrılarını etkilemez (ekstra bağımlılık yok).
export async function verifyDomain(
  domain,
  { kind = 'apex', verifyToken = null, resolver = dns, serverIp = config.brandedDomain.serverIp, cnameTarget = config.brandedDomain.cnameTarget } = {},
) {
  // A kaydı (apex) — serverIp configli değilse (dev) atlanır.
  const checkA = async () => {
    if (!serverIp) return false;
    try {
      const ips = await resolver.resolve4(domain);
      return ips.includes(serverIp);
    } catch {
      return false; // A kaydı yok/çözülemedi
    }
  };
  // CNAME kaydı (subdomain + www) — hedef cname.beylink.org mu?
  const checkCname = async () => {
    if (!cnameTarget) return false;
    try {
      const cnames = await resolver.resolveCname(domain);
      const target = cnameTarget.replace(/\.$/, '').toLowerCase();
      return cnames.some((c) => c.replace(/\.$/, '').toLowerCase() === target);
    } catch {
      return false; // CNAME yok/çözülemedi
    }
  };

  // Tipe göre birincil yöntem, diğeri yedek (OR mantığı korunur → ikisinden biri yeterli):
  //   subdomain → CNAME birincil (method etiketi dns_cname doğru kalır), A yedek
  //   apex      → A birincil (mevcut davranış), CNAME yedek
  let method = null;
  if (kind === 'subdomain') {
    if (await checkCname()) method = 'dns_cname';
    else if (await checkA()) method = 'dns_a';
  } else {
    if (await checkA()) method = 'dns_a';
    else if (await checkCname()) method = 'dns_cname';
  }

  if (!method) {
    return { ok: false, method: null, error: 'DNS kaydı sunucumuza işaret etmiyor (A veya CNAME bulunamadı)' };
  }

  if (verifyToken) {
    try {
      const txts = await resolver.resolveTxt(`_beylink-verify.${domain}`);
      const flat = txts.map((rec) => rec.join('')).map((s) => s.trim());
      if (!flat.includes(verifyToken)) {
        return { ok: false, method, error: 'TXT doğrulama kaydı (_beylink-verify) bulunamadı veya eşleşmiyor' };
      }
    } catch {
      return { ok: false, method, error: 'TXT doğrulama kaydı (_beylink-verify) bulunamadı' };
    }
  }

  return { ok: true, method, error: null };
}
