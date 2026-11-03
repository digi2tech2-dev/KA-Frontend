import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import axios from 'axios';

const require = createRequire(import.meta.url);
const { build } = createRequire(require.resolve('vite'))('esbuild');

const requests = [];
let failure = null;
let response = { _id: 'test-order', status: 'PROCESSING' };
axios.defaults.adapter = async (config) => {
  requests.push({ url: config.url, method: config.method, body: config.data ? JSON.parse(config.data) : undefined, key: config.headers.get('Idempotency-Key') });
  if (failure) throw failure;
  return { status: 200, statusText: 'OK', headers: {}, config, data: { success: true, data: response } };
};
const generated = new URL('../node_modules/.cache/coin-recharge-api-test.mjs', import.meta.url);
await mkdir(new URL('.', generated), { recursive: true });
await build({ entryPoints: [fileURLToPath(new URL('../src/services/realApi.js', import.meta.url))], outfile: fileURLToPath(generated), bundle: true, platform: 'node', format: 'esm', packages: 'external', define: { 'import.meta.env': JSON.stringify({ VITE_API_BASE_URL: 'http://test.invalid/api', DEV: false }) } });
const { default: api } = await import(generated.href);

test('supplier config, balance, verification and paginated evidence use their backend routes', async () => {
  requests.length = 0;
  response = { product: { unitPrice: '0.02' } };
  await api.suppliers.updateCoinRechargeProductConfig('supplier', { unitPrice: '0.02', minCoins: 1, maxCoins: 1000, isActive: true, name: 'Coins' });
  await api.suppliers.getBalance('supplier');
  await api.products.verifyField('product', '123');
  await api.suppliers.getCoinRechargeHistory('supplier', 2);
  assert.deepEqual(requests.map((item) => [item.method, item.url]), [
    ['patch', '/admin/providers/supplier/coin-recharge/product-config'],
    ['get', '/admin/providers/supplier/balance'], ['post', '/products/product/verify-field'],
    ['get', '/admin/providers/supplier/coin-recharge/history'],
  ]);
  assert.deepEqual(requests[2].body, { fieldValue: '123' });
});

test('coin checkout sends target_uid once to /me/orders with an idempotency key', async () => {
  requests.length = 0;
  response = { order: { _id: 'test-order', status: 'PROCESSING' } };
  await api.orders.create({ productId: 'product', providerCode: 'coin-recharge', quantity: 100, customInputs: { target_uid: '123' }, customerInput: { fieldsSnapshot: [{ key: 'target_uid' }] }, idempotencyKey: 'stable-key', preferLegacyOrderEndpoint: true });
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, '/me/orders');
  assert.equal(requests[0].key, 'stable-key');
  assert.deepEqual(requests[0].body.orderFieldsValues, { target_uid: '123' });
  assert.equal(requests[0].body.quantity, 100);
});

test('coin routing accepts the production-shaped legacy orderFields values map without serializing routing metadata', async () => {
  requests.length = 0;
  response = { order: { _id: 'test-order', status: 'PROCESSING' } };
  const submittedValues = { target_uid: '123' };
  await api.orders.create({
    productId: 'product',
    isCoinRecharge: true,
    quantity: 100,
    customInputs: submittedValues,
    orderFields: submittedValues,
    orderFieldsValues: submittedValues,
    customerInput: { fieldsSnapshot: [{ key: 'target_uid' }] },
    idempotencyKey: 'legacy-values-key',
    preferLegacyOrderEndpoint: true,
  });
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, '/me/orders');
  assert.deepEqual(requests[0].body, {
    productId: 'product', quantity: 100, customInputs: submittedValues, orderFieldsValues: submittedValues,
  });
  assert.equal(Object.hasOwn(requests[0].body, 'isCoinRecharge'), false);
});

test('traditional supplier request plans and provider-mapped values remain unchanged', async () => {
  requests.length = 0;
  response = { order: { _id: 'traditional-order', status: 'PROCESSING' } };
  const submittedValues = { player_id: '10026', server: 'EU' };
  await api.orders.create({
    productId: 'traditional-product', quantity: 1, customInputs: submittedValues,
    orderFields: submittedValues, orderFieldsValues: submittedValues,
    customerInput: { fieldsSnapshot: [{ key: 'player_id' }, { key: 'server' }] },
    preferLegacyOrderEndpoint: true,
  });
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, '/orders');
  assert.deepEqual(requests[0].body.orderFields, submittedValues);
  assert.deepEqual(requests[0].body.orderFieldsValues, submittedValues);
});

test('a timeout never resends a coin checkout through another route', async () => {
  requests.length = 0;
  failure = Object.assign(new Error('timeout'), { code: 'ECONNABORTED' });
  await assert.rejects(api.orders.create({ productId: 'product', providerCode: 'coin-recharge', quantity: 100, customInputs: { target_uid: '123' }, idempotencyKey: 'stable-key' }));
  failure = null;
  assert.equal(requests.length, 1);
});

test('both manual decisions use the dedicated resolution route and preserve the reason', async () => {
  requests.length = 0;
  response = { order: { _id: 'test-order', status: 'COMPLETED' } };
  const context = { providerCode: 'coin-recharge', status: 'manual_review', rejectionReason: 'Supplier checked' };
  await api.orders.updateStatus('test-order', 'completed', context);
  await api.orders.updateStatus('test-order', 'rejected', context);
  assert.deepEqual(requests.map((item) => item.url), Array(2).fill('/admin/orders/test-order/coin-recharge/resolve'));
  assert.deepEqual(requests.map((item) => item.body), [{ resolution: 'delivered', reason: 'Supplier checked' }, { resolution: 'refund', reason: 'Supplier checked' }]);
});
