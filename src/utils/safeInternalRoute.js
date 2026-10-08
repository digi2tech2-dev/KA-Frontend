export const getSafeInternalRoute = (value, fallback = '') => {
  if (typeof value !== 'string') return fallback;
  const route = value.trim();

  if (
    !route.startsWith('/')
    || route.startsWith('//')
    || route.includes('://')
    || route.includes('\\')
  ) {
    return fallback;
  }

  try {
    const base = typeof window === 'undefined' ? 'https://internal.invalid' : window.location.origin;
    const parsed = new URL(route, base);
    if (parsed.origin !== base) return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
};

export const isSafeInternalRoute = (value) => Boolean(getSafeInternalRoute(value));
