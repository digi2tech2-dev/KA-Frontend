import { Capacitor } from '@capacitor/core';

const safely = (callback, fallback = false) => {
  try {
    return callback();
  } catch {
    return fallback;
  }
};

export const isNativeApp = () => safely(() => Boolean(Capacitor.isNativePlatform()));

export const isAndroidNativeApp = () => (
  isNativeApp() && safely(() => Capacitor.getPlatform() === 'android')
);

export const isNativePushAvailable = () => (
  isAndroidNativeApp() && safely(() => Capacitor.isPluginAvailable('PushNotifications'))
);

export const isNativeGoogleAuthAvailable = () => (
  isAndroidNativeApp() && safely(() => Capacitor.isPluginAvailable('NativeGoogleAuth'))
);
