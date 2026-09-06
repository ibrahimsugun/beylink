import { userModel } from '../models/userModel.js';
import { profileModel } from '../models/profileModel.js';
import { notFound, forbidden } from './ApiError.js';

/**
 * Kullanıcının bir profile erişim yetkisi var mı?
 * - Profil doğrudan kullanıcıya aitse → evet
 * - Owner ise ve profil kendi alt hesabına aitse → evet
 * - Aksi halde → hayır
 */
export function assertProfileAccess(user, profileId) {
  const profile = profileModel.findById(Number(profileId));
  if (!profile) throw notFound('Profil bulunamadı');

  if (profile.user_id === user.id) return profile;

  if (user.role === 'owner') {
    const owner = userModel.findById(profile.user_id);
    if (owner && owner.parent_user_id === user.id) return profile;
  }

  throw forbidden('Bu profile erişiminiz yok');
}

/**
 * Erişim + düzenleme yetkisi. Owner her zaman düzenleyebilir.
 * Alt hesap (sub) yalnızca `can_edit_profile` açıksa kendi profilini düzenleyebilir.
 */
export function assertProfileEditable(user, profileId) {
  const profile = assertProfileAccess(user, profileId);
  if (user.role === 'sub' && !user.can_edit_profile) {
    throw forbidden('Profil düzenleme yetkiniz kapalı. Yöneticinize başvurun.');
  }
  // Askıdaki (premium bitmiş) alt hesabın profili düzenlenemez — sahibi olan alt hesap da,
  // profili switcher'dan açan owner da editleyemez. (Owner kendi profilinde is_suspended=0.)
  const targetUser = profile.user_id === user.id ? user : userModel.findById(profile.user_id);
  if (targetUser?.role === 'sub' && targetUser.is_suspended === 1) {
    throw forbidden('Bu alt hesap askıda (ana hesabın premium üyeliği sona erdi). Düzenlemek için ana hesabın premium alması gerekir.');
  }
  return profile;
}
