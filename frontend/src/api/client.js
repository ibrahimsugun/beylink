const TOKEN_KEY = 'beylink_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request(method, path, body, { auth = true, isForm = false } = {}) {
  const headers = {};
  if (!isForm) headers['Content-Type'] = 'application/json';
  const token = tokenStore.get();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const err = new Error(data?.error || 'İstek başarısız');
    err.status = res.status;
    err.code = data?.code;
    // E-posta onayı gerektiren bir işlem backend'de bloklandıysa → doğrulama bildirimini aç
    // (proaktif kontrol atlanmış her yolu da kapsar; DashboardLayout'taki modal dinler).
    if (data?.code === 'email_unverified') {
      window.dispatchEvent(new CustomEvent('beylink:email-unverified'));
    }
    throw err;
  }
  return data;
}

export const api = {
  get: (p, opts) => request('GET', p, null, opts),
  post: (p, b, opts) => request('POST', p, b, opts),
  put: (p, b, opts) => request('PUT', p, b, opts),
  patch: (p, b, opts) => request('PATCH', p, b, opts),
  delete: (p, opts) => request('DELETE', p, null, opts),
  upload: (p, formData) => request('POST', p, formData, { isForm: true }),
};
