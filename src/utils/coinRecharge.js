const isCoinRechargeCode = (value) => String(value || '').trim().toLowerCase() === 'coin-recharge';

/**
 * Product.orderFields is a field-definition array.  Order payloads deliberately
 * use orderFieldsValues/customInputs for submitted values; a legacy request may
 * also contain an `orderFields` values object, which must never be inspected as
 * a product definition.
 */
const hasCoinRechargeFieldDefinition = (orderFields, providerMapping) => (
  Array.isArray(orderFields)
  && orderFields.some((field) => field?.verification?.type === 'coin_recharge_target'
    || (field?.key === 'target_uid' && field?.isVerifiable === true && providerMapping?.target_uid === 'toUserId'))
);

export const isCoinRechargeProduct = (product = {}) => (
  isCoinRechargeCode(product.providerCode)
  || isCoinRechargeCode(product.provider?.adapterType)
  || isCoinRechargeCode(product.provider?.slug)
  || [product.externalProductId, product.providerProduct?.externalProductId, product.providerProductId].includes('coin-recharge-dynamic')
  || hasCoinRechargeFieldDefinition(product.orderFields, product.providerMapping)
);

/**
 * Determine checkout routing from explicit order metadata only.  Do not call
 * isCoinRechargeProduct here: an order's orderFields may be a legacy values map
 * rather than Product.orderFields definitions.
 */
export const isCoinRechargeOrder = (order = {}) => (
  order?.isCoinRecharge === true
  || isCoinRechargeCode(order.providerCode)
  || isCoinRechargeCode(order.provider?.adapterType)
  || isCoinRechargeCode(order.provider?.slug)
  || [order.externalProductId, order.providerProduct?.externalProductId, order.providerProductId].includes('coin-recharge-dynamic')
);

export const isCoinTargetVerified = (value, result, pending = false) => (
  !pending && /^\d{1,50}$/.test(String(value || '').trim())
  && result?._verifiedValue === String(value || '').trim()
);

export const getCoinResolution = (status) => {
  const value = String(status || '').toLowerCase();
  if (['completed', 'approved', 'delivered'].includes(value)) return 'delivered';
  if (['failed', 'rejected', 'incomplete'].includes(value)) return 'refund';
  throw new Error('Invalid coin recharge resolution.');
};
