export const LEGACY_ANDROID_VERSION_CODE = 4;

export const parsePositiveVersionCode = (value) => {
  const normalized = typeof value === 'number'
    ? value
    : (typeof value === 'string' && /^\d+$/.test(value.trim()) ? Number(value.trim()) : NaN);

  return Number.isSafeInteger(normalized) && normalized > 0 ? normalized : null;
};

export const normalizeUpdateManifest = (manifest) => {
  const versionCode = parsePositiveVersionCode(manifest?.versionCode);
  const minSupportedVersionCode = parsePositiveVersionCode(manifest?.minSupportedVersionCode);
  const versionName = typeof manifest?.versionName === 'string' ? manifest.versionName.trim() : '';
  const apkUrl = typeof manifest?.apkUrl === 'string' ? manifest.apkUrl.trim() : '';

  if (!versionCode || !minSupportedVersionCode || !versionName || !apkUrl) return null;

  return {
    versionCode,
    versionName,
    minSupportedVersionCode,
    forceUpdate: manifest.forceUpdate === true,
    apkUrl,
  };
};

export const getAndroidUpdateDecision = ({ installedVersionCode, manifest } = {}) => {
  const installed = parsePositiveVersionCode(installedVersionCode);
  const latest = normalizeUpdateManifest(manifest);

  if (!installed || !latest || latest.versionCode <= installed) return null;

  return {
    ...latest,
    isForced: latest.forceUpdate || installed < latest.minSupportedVersionCode,
  };
};
