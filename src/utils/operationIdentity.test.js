import test from 'node:test';
import assert from 'node:assert/strict';
import { attachOperationIdentity, createClientIdempotencyKey } from './operationIdentity.js';

test('financial retries retain the original identity and separate operations get different keys', () => {
  const config = { method: 'POST' };
  attachOperationIdentity(config);
  const key = config.headers['Idempotency-Key'];
  assert.match(key, /^[a-zA-Z0-9._:-]{8,128}$/);
  attachOperationIdentity(config);
  assert.equal(config.headers['Idempotency-Key'], key);
  assert.notEqual(attachOperationIdentity({ method: 'post' }).headers['Idempotency-Key'], key);
});

test('preserves caller-supplied keys regardless of header casing and leaves reads alone', () => {
  const config = { method: 'patch', headers: { 'idempotency-key': 'caller-operation-1' } };
  attachOperationIdentity(config);
  assert.deepEqual(config.headers, { 'idempotency-key': 'caller-operation-1' });
  assert.deepEqual(attachOperationIdentity({ method: 'get' }), { method: 'get' });
});

test('older webviews without crypto.randomUUID still send a valid operation key', () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
  try {
    Object.defineProperty(globalThis, 'crypto', { configurable: true, value: undefined });
    assert.match(createClientIdempotencyKey(), /^[a-zA-Z0-9._:-]{8,128}$/);
    assert.ok(attachOperationIdentity({ method: 'delete' }).headers['Idempotency-Key']);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'crypto', descriptor);
    else delete globalThis.crypto;
  }
});
