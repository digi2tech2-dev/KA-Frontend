const toLocalDateKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const orderValueUsd = (order) => {
  const snapshot = order?.usdAmount;
  if (snapshot !== null && snapshot !== undefined && snapshot !== '') {
    const value = Number(snapshot);
    if (Number.isFinite(value) && value >= 0) return value;
  }

  const amount = Number(order?.chargedAmount ?? order?.totalPrice ?? order?.priceCoins);
  const rate = Number(order?.rateSnapshot ?? order?.financialSnapshot?.exchangeRateAtExecution);
  if (!Number.isFinite(amount) || amount < 0) return null;
  if (Number.isFinite(rate) && rate > 0) return amount / rate;

  const currency = String(order?.currency || order?.currencyCode || order?.financialSnapshot?.originalCurrency || '').toUpperCase();
  return currency === 'USD' ? amount : null;
};

export const buildOrderCandles = (orders, { startDate = '', endDate = '' } = {}) => {
  const points = (Array.isArray(orders) ? orders : [])
    .filter((order) => ['completed', 'approved', 'success'].includes(String(order?.status || '').toLowerCase()))
    .map((order) => {
      const timestamp = new Date(order?.createdAt || order?.date).getTime();
      const date = Number.isFinite(timestamp) ? toLocalDateKey(timestamp) : '';
      return { date, timestamp, value: orderValueUsd(order), id: String(order?.id || order?._id || '') };
    })
    .filter(({ date, value }) => date && value !== null && (!startDate || date >= startDate) && (!endDate || date <= endDate))
    .sort((left, right) => left.timestamp - right.timestamp || left.id.localeCompare(right.id));

  const days = new Map();
  points.forEach(({ date, value }) => {
    const current = days.get(date);
    if (!current) {
      days.set(date, { date, open: value, high: value, low: value, close: value, count: 1 });
      return;
    }
    current.high = Math.max(current.high, value);
    current.low = Math.min(current.low, value);
    current.close = value;
    current.count += 1;
  });
  return Array.from(days.values());
};
