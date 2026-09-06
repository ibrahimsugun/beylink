import { isFreeTemplate } from '../config/themes.js';
import { assertPlanCap } from './plan.js';

// Tema plan-gating (TEK kural): gelen template serbest allowlist DIŞINDA ve DEĞİŞİYORSA
// presetThemes (Basic+) gerektirir. updateProfile, applyPageTemplate ve tasarım-şablonu
// uygulaması aynı kuralı kullanır → hiçbir yol Pro-tema backdoor'u açmaz.
export function assertThemeGate(user, incomingTs, currentTs) {
  const incoming = incomingTs?.template;
  const current = currentTs?.template;
  if (incoming && incoming !== current && !isFreeTemplate(incoming)) {
    assertPlanCap(user, 'presetThemes');
  }
}
