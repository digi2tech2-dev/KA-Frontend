import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { isAndroidNativeApp } from '../utils/platform';
import {
  LEGACY_ANDROID_VERSION_CODE,
  getAndroidUpdateDecision,
  normalizeUpdateManifest,
} from './nativeAppUpdateDecision';

const UPDATE_ORIGIN = 'https://ad-card.com';
const MANIFEST_PATH = '/downloads/android/latest.json';
const REQUEST_TIMEOUT_MS = 8000;

let activeUpdateCheck = null;

const safely = (callback, fallback = false) => {
  try {
    return callback();
  } catch {
    return fallback;
  }
};

const isNativePluginAvailable = (name) => (
  safely(() => Capacitor.isPluginAvailable(name))
);

export const resolveAndroidApkUrl = (value) => {
  if (typeof value !== 'string' || !value.trim()) return '';

  const isRelativeDownloadPath = /^\/(?!\/).*$/u.test(value.trim());

  try {
    const url = new URL(value, UPDATE_ORIGIN);
    const allowedHost = url.hostname === 'ad-card.com' || url.hostname === 'www.ad-card.com';
    const allowedPath = url.pathname.startsWith('/downloads/android/');
    const isSafeRelativeUrl = isRelativeDownloadPath && url.origin === UPDATE_ORIGIN;
    const isSafeAbsoluteUrl = url.protocol === 'https:' && allowedHost;

    return allowedPath && (isSafeRelativeUrl || isSafeAbsoluteUrl) ? url.href : '';
  } catch {
    return '';
  }
};

const fetchLatestManifest = async () => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const separator = MANIFEST_PATH.includes('?') ? '&' : '?';
    const response = await fetch(`${MANIFEST_PATH}${separator}t=${Date.now()}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) return null;

    const manifest = normalizeUpdateManifest(await response.json());
    const apkUrl = resolveAndroidApkUrl(manifest?.apkUrl);
    return manifest && apkUrl ? { ...manifest, apkUrl } : null;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
};

const getInstalledVersionCode = async () => {
  if (!isNativePluginAvailable('App')) {
    return { versionCode: LEGACY_ANDROID_VERSION_CODE, isLegacy: true };
  }

  try {
    const info = await App.getInfo();
    const versionCode = Number(info?.build);
    if (Number.isSafeInteger(versionCode) && versionCode > 0) {
      return { versionCode, isLegacy: false };
    }
  } catch {
    // Legacy remote-live APKs do not contain the App native plugin.
  }

  return { versionCode: LEGACY_ANDROID_VERSION_CODE, isLegacy: true };
};

const runNativeAndroidUpdateCheck = async () => {
  if (!isAndroidNativeApp() || typeof window === 'undefined') return null;

  const [installed, manifest] = await Promise.all([
    getInstalledVersionCode(),
    fetchLatestManifest(),
  ]);

  return getAndroidUpdateDecision({
    installedVersionCode: installed.versionCode,
    manifest,
  });
};

export const checkNativeAndroidUpdate = () => {
  if (!isAndroidNativeApp()) return Promise.resolve(null);
  if (activeUpdateCheck) return activeUpdateCheck;

  activeUpdateCheck = runNativeAndroidUpdateCheck().catch(() => null).finally(() => {
    activeUpdateCheck = null;
  });
  return activeUpdateCheck;
};

export const openNativeAndroidUpdate = async (apkUrl) => {
  const safeUrl = resolveAndroidApkUrl(apkUrl);
  if (!safeUrl || !isAndroidNativeApp()) return false;

  if (isNativePluginAvailable('Browser')) {
    try {
      await Browser.open({ url: safeUrl });
      return true;
    } catch {
      // Older installed APKs can receive this web code before the Browser plugin exists.
    }
  }

  if (typeof window === 'undefined') return false;

  try {
    const openedWindow = window.open(safeUrl, '_blank', 'noopener,noreferrer');
    if (!openedWindow) window.location.assign(safeUrl);
    return true;
  } catch {
    try {
      window.location.assign(safeUrl);
      return true;
    } catch {
      return false;
    }
  }
};
