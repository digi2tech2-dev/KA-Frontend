import React from 'react';
import {
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Hash,
  ReceiptText,
  Target,
  UserRound,
  WalletCards,
} from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { formatDateTime, formatNumber } from '../../utils/intl';
import {
  getTargetOrderStatusLabel,
  getTargetOrderStatusVariant,
  normalizeTargetOrderStatus,
} from '../../utils/targetOrders';
import { isSiteWalletPaymentMethod } from '../../utils/paymentSettings';

const SummaryItem = ({ icon: Icon, label, value, accent = false }) => (
  <div className="rounded-xl border border-[color:rgb(var(--color-border-rgb)/0.64)] bg-[color:rgb(var(--color-surface-rgb)/0.52)] p-3">
    <p className="flex items-center gap-1.5 text-[10px] font-semibold text-[var(--color-text-secondary)]">
      <Icon className="h-3.5 w-3.5 text-emerald-500" />
      {label}
    </p>
    <p className={`mt-1.5 break-words text-sm font-black ${accent ? 'text-emerald-500' : 'text-[var(--color-text)]'}`}>
      {value || '-'}
    </p>
  </div>
);

const getPaymentMethodLabel = (order) => {
  if (isSiteWalletPaymentMethod(order.paymentMethodId || order.paymentMethod || order.paymentMethodName)) {
    return 'محفظة الموقع';
  }
  return order.paymentMethodName || order.paymentMethod || '-';
};

const TargetOrderSuccessModal = ({ isOpen, onClose, order, onViewOrders }) => {
  if (!order) return null;

  const status = normalizeTargetOrderStatus(order.status || 'PENDING');
  const appName = order.appNameSnapshot || order.productName || order.app?.name || 'طلب تارجت';
  const dollarAmount = Number(order.coinAmount ?? order.quantity ?? 0);
  const unitPrice = Number(order.unitPriceSnapshot ?? order.unitPrice ?? order.app?.unitPrice ?? 0);
  const totalPrice = Number(order.totalPrice ?? (dollarAmount * unitPrice));
  const accountId = order.senderId || order.transferFromId || '-';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تم إرسال الطلب بنجاح"
      size="lg"
      className="z-[240]"
      placement="bottom"
      footer={(
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="secondary" className="rounded-xl" onClick={onClose}>
            إغلاق
          </Button>
          <Button type="button" className="rounded-xl" onClick={onViewOrders}>
            <ReceiptText className="h-4 w-4" />
            عرض طلباتي
          </Button>
        </div>
      )}
    >
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-[1.4rem] border border-emerald-500/20 bg-[radial-gradient(22rem_circle_at_top,rgb(16_185_129/0.16),transparent_58%),rgb(var(--color-card-rgb)/0.78)] p-5 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/25">
            <CheckCircle2 className="h-7 w-7" />
          </span>
          <h3 className="mt-3 text-lg font-black text-[var(--color-text)]">استلمنا طلب بيع التارجت</h3>
          <p className="mx-auto mt-1 max-w-md text-xs leading-6 text-[var(--color-text-secondary)]">
            الطلب الآن قيد المراجعة، ويمكنك متابعة حالته من صفحة طلباتك.
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <Badge variant={getTargetOrderStatusVariant(status)}>{getTargetOrderStatusLabel(status)}</Badge>
            {order.id ? (
              <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-[color:rgb(var(--color-border-rgb)/0.72)] px-2.5 py-1 text-[10px] font-bold text-[var(--color-text-secondary)]">
                <Hash className="h-3 w-3" />
                <span className="truncate">{order.id}</span>
              </span>
            ) : null}
          </div>
        </div>

        <div className="rounded-[1.25rem] border border-emerald-500/18 bg-emerald-500/[0.06] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--color-text-secondary)]">
                <CircleDollarSign className="h-4 w-4 text-emerald-500" />
                إجمالي قيمة البيع
              </p>
              <p className="mt-1 text-2xl font-black text-emerald-500">
                {formatNumber(totalPrice, 'en-US', { maximumFractionDigits: 2 })}
                <span className="mr-1.5 text-xs">EGP</span>
              </p>
            </div>
            <div className="text-left">
              <p className="text-[10px] text-[var(--color-text-secondary)]">الدولار</p>
              <p className="mt-1 text-base font-black text-[var(--color-text)]">{formatNumber(dollarAmount, 'en-US')} $</p>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-black text-[var(--color-text)]">تفاصيل بيع التارجت</p>
          <div className="grid grid-cols-2 gap-2.5">
            <SummaryItem icon={Target} label="التطبيق" value={appName} />
            <SummaryItem icon={UserRound} label="معرّف الحساب" value={accountId} />
            <SummaryItem icon={WalletCards} label="طريقة الاستلام" value={getPaymentMethodLabel(order)} />
            <SummaryItem icon={CircleDollarSign} label="سعر الدولار" value={`${formatNumber(unitPrice, 'en-US', { maximumFractionDigits: 2 })} EGP`} />
          </div>
        </div>

        <p className="flex items-center justify-center gap-1.5 text-center text-[10px] text-[var(--color-text-secondary)]">
          <Clock3 className="h-3.5 w-3.5 text-emerald-500" />
          تم الإرسال {formatDateTime(order.createdAt || new Date().toISOString(), 'en-US')}
        </p>
      </div>
    </Modal>
  );
};

export default TargetOrderSuccessModal;
