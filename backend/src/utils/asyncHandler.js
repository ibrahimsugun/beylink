// Async controller'ları try/catch olmadan sarmalar
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
