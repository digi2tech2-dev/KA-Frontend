import test from 'node:test';
import assert from 'node:assert/strict';
import { isCoinRechargeOrder, isCoinRechargeProduct, isCoinTargetVerified, getCoinResolution } from './coinRecharge.js';
import { resolveProductOrderFields } from './productPurchase.js';

const product = { orderFields: [{ id: 'target_uid', key: 'target_uid', label: 'User ID', type: 'text', required: true, isVerifiable: true }], providerMapping: { target_uid: 'toUserId' } };

test('customer product response without providerProduct still identifies coin recharge', () => {
  assert.equal(isCoinRechargeProduct(product), true);
  assert.equal(isCoinRechargeProduct({ externalProductId: 'coin-recharge-dynamic' }), true);
  assert.equal(isCoinRechargeProduct({ providerCode: 'coin-recharge' }), true);
  assert.equal(isCoinRechargeProduct({ orderFields: [{ key: 'playerId' }] }), false);
});

test('submitted field values are not treated as product field definitions', () => {
  // Production order payload shape after the legacy checkout compatibility
  // alias has been applied. It is values, not Product.orderFields.
  const submittedValues = { target_uid: '123456' };
  assert.equal(isCoinRechargeProduct({ orderFields: submittedValues }), false);
  assert.equal(isCoinRechargeOrder({ orderFields: submittedValues }), false);
  assert.equal(isCoinRechargeOrder({ isCoinRecharge: true, orderFields: submittedValues }), true);
});

test('coin checkout renders only its declared target and keeps verification enabled', () => {
  const fields = resolveProductOrderFields(product, 'en');
  assert.deepEqual(fields.map((field) => field.key), ['target_uid']);
  assert.equal(fields[0].isVerifiable, true);
});

test('existing providers retain their playerId fallback', () => {
  const fields = resolveProductOrderFields({ orderFields: [{ key: 'server', label: 'Server' }] }, 'en');
  assert.deepEqual(fields.map((field) => field.key), ['playerId', 'server']);
});

test('verification is bound to the current target and cannot be used while pending', () => {
  const verified = { uid: '123', _verifiedValue: '123' };
  assert.equal(isCoinTargetVerified('123', verified), true);
  assert.equal(isCoinTargetVerified('124', verified), false);
  assert.equal(isCoinTargetVerified('123', verified, true), false);
  assert.equal(isCoinTargetVerified('123', undefined), false);
  assert.equal(isCoinTargetVerified('abc', { _verifiedValue: 'abc' }), false);
  assert.equal(isCoinTargetVerified('9'.repeat(51), { _verifiedValue: '9'.repeat(51) }), false);
});

test('manual resolution supports the statuses normalized by the AD order store', () => {
  assert.equal(getCoinResolution('COMPLETED'), 'delivered');
  assert.equal(getCoinResolution('rejected'), 'refund');
  assert.equal(getCoinResolution('FAILED'), 'refund');
  assert.throws(() => getCoinResolution('processing'));
});
