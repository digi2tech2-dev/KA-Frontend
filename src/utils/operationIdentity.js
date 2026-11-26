// Reuse one identity across HTTP retries so financial mutations are not applied twice.
export const createClientIdempotencyKey = () => {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID();
  return `operation-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
};

export const attachOperationIdentity = (config) => {
  if (!['post', 'put', 'patch', 'delete'].includes(String(config.method || '').toLowerCase())) return config;
  config.headers = config.headers || {};
  const existing = Object.keys(config.headers).some(key => key.toLowerCase() === 'idempotency-key' && config.headers[key]);
  if (!existing) config.headers['Idempotency-Key'] = createClientIdempotencyKey();
  return config;
};
