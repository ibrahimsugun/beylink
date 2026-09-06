export class ApiError extends Error {
  constructor(status, message, code = undefined) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const badRequest = (msg, code) => new ApiError(400, msg, code);
export const unauthorized = (msg = 'Yetkisiz erişim', code) => new ApiError(401, msg, code);
export const forbidden = (msg = 'Bu işleme izniniz yok') => new ApiError(403, msg);
export const notFound = (msg = 'Bulunamadı') => new ApiError(404, msg);
export const conflict = (msg, code) => new ApiError(409, msg, code);
export const tooManyRequests = (msg = 'Çok fazla istek', code) => new ApiError(429, msg, code);
// E-posta onayı gerektiren işlem — istemci `code: 'email_unverified'` ile doğrulama bildirimini açar.
export const emailUnverified = (msg = 'E-postanız onaylanmadı. Bu işlem için e-posta adresinizi onaylayın.') =>
  new ApiError(403, msg, 'email_unverified');
