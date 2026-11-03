export const isCoinRechargeProduct = (product = {}) => (
  String(product.providerCode || product.provider?.adapterType || product.provider?.slug || '').toLowerCase() === 'coin-recharge'
  || [product.externalProductId, product.providerProduct?.externalProductId, product.providerProductId].includes('coin-recharge-dynamic')
  || (product.orderFields || []).some((field) => field?.verification?.type === 'coin_recharge_target'
    || (field?.key === 'target_uid' && field?.isVerifiable === true && product.providerMapping?.target_uid === 'toUserId'))
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
