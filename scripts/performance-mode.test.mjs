import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Capacitor } from '@capacitor/core';
import { detectLitePerformanceMode, applyPerformanceMode } from '../src/utils/performanceMode.js';

test('performance policy distinguishes the Android APK from capable browsers', (t) => {
  const originals = new Map(['window', 'navigator', 'document'].map((key) => (
    [key, Object.getOwnPropertyDescriptor(globalThis, key)]
  )));
  t.after(() => {
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  let native = false;
  t.mock.method(Capacitor, 'isNativePlatform', () => native);
  t.mock.method(Capacitor, 'getPlatform', () => native ? 'android' : 'web');
  const setup = ({ compact = true, reducedMotion = false, memory = 8, cores = 8, userAgent = 'Android 15', saveData = false } = {}) => {
    Object.defineProperty(globalThis, 'window', { configurable: true, value: {
      matchMedia: (query) => ({ matches: query.includes('max-width') ? compact : reducedMotion }),
    } });
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {
      userAgent, deviceMemory: memory, hardwareConcurrency: cores, connection: { saveData },
    } });
  };

  setup();
  assert.equal(detectLitePerformanceMode(), false, 'capable Android browser keeps full mode');
  native = true;
  assert.equal(detectLitePerformanceMode(), true, 'capable Android APK uses lite mode');
  setup({ compact: false, memory: 0, cores: 0 });
  assert.equal(detectLitePerformanceMode(), true, 'APK stays lite on tablets and without hardware hints');
  native = false;
  setup({ userAgent: 'Desktop', compact: false });
  assert.equal(detectLitePerformanceMode(), false, 'desktop browser keeps full mode');
  setup({ reducedMotion: true });
  assert.equal(detectLitePerformanceMode(), true, 'reduced motion is respected');
  setup({ memory: 2, cores: 2 });
  assert.equal(detectLitePerformanceMode(), true, 'constrained browser stays lite');
  setup({ saveData: true });
  assert.equal(detectLitePerformanceMode(), true, 'data saver stays lite');

  const classes = new Set();
  const dataset = {};
  Object.defineProperty(globalThis, 'document', { configurable: true, value: {
    documentElement: { dataset, classList: { toggle: (name, enabled) => enabled ? classes.add(name) : classes.delete(name) } },
  } });
  assert.equal(applyPerformanceMode(), true);
  assert.equal(classes.has('performance-lite'), true);
  assert.equal(dataset.performanceMode, 'lite');
  setup();
  assert.equal(applyPerformanceMode(), false);
  assert.equal(classes.has('performance-lite'), false);
  assert.equal(dataset.performanceMode, 'full');
});
