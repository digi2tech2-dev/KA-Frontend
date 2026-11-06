import React, { useMemo, useState } from 'react';
import Card from '../ui/Card';
import { buildOrderCandles } from '../../utils/adminOrderCandles';

const CHART_HEIGHT = 250;
const TOP = 20;
const BOTTOM = 203;
const LEFT = 55;
const RIGHT = 14;

const OrderCandlestickChart = ({ orders, startDate, endDate, isArabic }) => {
  const candles = useMemo(
    () => buildOrderCandles(orders, { startDate, endDate }),
    [orders, startDate, endDate]
  );
  const [selectedDate, setSelectedDate] = useState('');
  const selected = candles.find((candle) => candle.date === selectedDate) || candles[candles.length - 1];
  const locale = isArabic ? 'ar-EG' : 'en-US';
  const money = (value) => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
  const total = candles.reduce((sum, candle) => sum + candle.count, 0);
  const width = Math.max(340, candles.length * 42 + LEFT + RIGHT);
  const plotWidth = width - LEFT - RIGHT;
  const values = candles.flatMap((candle) => [candle.high, candle.low]);
  const minimum = values.length ? Math.min(...values) : 0;
  const maximum = values.length ? Math.max(...values) : 1;
  const padding = Math.max((maximum - minimum) * 0.12, maximum * 0.04, 0.5);
  const lower = Math.max(0, minimum - padding);
  const upper = maximum + padding;
  const y = (value) => BOTTOM - ((value - lower) / (upper - lower)) * (BOTTOM - TOP);

  return (
    <Card variant="elevated" className="min-w-0 p-3 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-[var(--color-text)]">
            {isArabic ? 'حركة قيمة الطلبات' : 'Order value movement'}
          </h2>
          <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">
            {isArabic
              ? 'شموع الطلبات المكتملة بالدولار؛ كل شمعة تعرض أول وآخر وأعلى وأقل قيمة طلب في يومها.'
              : 'Completed orders in USD; each candle shows the first, last, highest and lowest order value of the day.'}
          </p>
        </div>
        <span className="rounded-lg border border-[color:rgb(var(--color-border-rgb)/0.75)] px-2 py-1 text-xs text-[var(--color-text-secondary)]">
          {isArabic ? `${new Intl.NumberFormat(locale).format(total)} طلب` : `${total} orders`}
        </span>
      </div>

      {candles.length === 0 ? (
        <div className="mt-4 flex min-h-48 items-center justify-center rounded-xl border border-dashed border-[color:rgb(var(--color-border-rgb)/0.75)] px-4 text-center text-sm text-[var(--color-text-secondary)]">
          {isArabic ? 'لا توجد طلبات مكتملة بقيمة دولار معروفة خلال الفترة المحددة.' : 'No completed orders with a known USD value in the selected period.'}
        </div>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto rounded-xl border border-[color:rgb(var(--color-border-rgb)/0.7)] bg-[color:rgb(var(--color-surface-rgb)/0.35)]">
            <svg
              width={width}
              height={CHART_HEIGHT}
              viewBox={`0 0 ${width} ${CHART_HEIGHT}`}
              role="img"
              aria-label={isArabic ? 'مخطط شموع قيم الطلبات المكتملة' : 'Completed order value candlestick chart'}
              className="block max-w-none"
              dir="ltr"
            >
              {[0, 1, 2, 3, 4].map((tick) => {
                const value = lower + ((upper - lower) * (4 - tick)) / 4;
                const position = y(value);
                return (
                  <g key={tick}>
                    <line x1={LEFT} x2={width - RIGHT} y1={position} y2={position} stroke="currentColor" opacity="0.12" className="text-[var(--color-text)]" />
                    <text x={LEFT - 6} y={position + 4} textAnchor="end" fontSize="10" fill="currentColor" className="text-[var(--color-text-secondary)]">{money(value)}</text>
                  </g>
                );
              })}
              {candles.map((candle, index) => {
                const x = LEFT + ((index + 0.5) * plotWidth) / candles.length;
                const color = candle.close > candle.open ? '#16a34a' : candle.close < candle.open ? '#dc2626' : '#64748b';
                const bodyTop = Math.min(y(candle.open), y(candle.close));
                const bodyHeight = Math.max(3, Math.abs(y(candle.open) - y(candle.close)));
                const dayLabel = `${Number(candle.date.slice(8))}/${Number(candle.date.slice(5, 7))}`;
                return (
                  <g
                    key={candle.date}
                    role="button"
                    tabIndex={0}
                    aria-label={`${candle.date}: ${candle.count} ${isArabic ? 'طلبات' : 'orders'}`}
                    onClick={() => setSelectedDate(candle.date)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setSelectedDate(candle.date);
                      }
                    }}
                    onFocus={() => setSelectedDate(candle.date)}
                    onMouseEnter={() => setSelectedDate(candle.date)}
                    style={{ cursor: 'pointer' }}
                  >
                    <title>{`${candle.date}: ${candle.count} orders; open ${money(candle.open)}, close ${money(candle.close)}, high ${money(candle.high)}, low ${money(candle.low)} USD`}</title>
                    <rect x={x - 18} y={TOP} width={36} height={BOTTOM - TOP + 20} fill="transparent" />
                    <line x1={x} x2={x} y1={y(candle.high)} y2={y(candle.low)} stroke={color} strokeWidth="2" />
                    <rect x={x - 7} y={bodyTop} width={14} height={bodyHeight} rx="2" fill={color} />
                    <text x={x} y={BOTTOM + 25} textAnchor="middle" fontSize="10" fill="currentColor" className="text-[var(--color-text-secondary)]">{dayLabel}</text>
                  </g>
                );
              })}
            </svg>
          </div>
          {selected && (
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--color-text-secondary)]">
              <strong className="text-[var(--color-text)]">{selected.date}</strong>
              <span>{isArabic ? 'الافتتاح' : 'Open'}: {money(selected.open)} USD</span>
              <span>{isArabic ? 'الإغلاق' : 'Close'}: {money(selected.close)} USD</span>
              <span>{isArabic ? 'الأعلى' : 'High'}: {money(selected.high)} USD</span>
              <span>{isArabic ? 'الأدنى' : 'Low'}: {money(selected.low)} USD</span>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default OrderCandlestickChart;
