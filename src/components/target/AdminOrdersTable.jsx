import React from 'react';
import { CircleDollarSign, Eye, ReceiptText, UserRound, WalletCards } from 'lucide-react';
import Badge from '../ui/Badge';
import { selectClassName } from '../ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
import { formatDateTime, formatNumber } from '../../utils/intl';
import {
  getTargetOrderStatusLabel,
  getTargetOrderStatusVariant,
  normalizeTargetOrderStatus,
} from '../../utils/targetOrders';
import { isSiteWalletPaymentMethod } from '../../utils/paymentSettings';

const copyText = (value) => {
  const text = String(value || '').trim();
  if (!text || !navigator?.clipboard?.writeText) return;
  navigator.clipboard.writeText(text).catch(() => null);
};

const getPaymentMethodLabel = (request, isSiteWallet) => {
  if (isSiteWallet) return 'محفظة الموقع';
  const value = String(request.paymentMethodName || request.paymentMethod || '').trim();
  const normalized = value.toLowerCase();
  if (normalized === 'vodafone cash') return 'فودافون كاش';
  if (normalized === 'instapay') return 'إنستا باي';
  if (normalized === 'orange cash') return 'أورانج كاش';
  if (normalized === 'etisalat cash') return 'اتصالات كاش';
  return value || '-';
};

const MobileRequestCard = ({ request, onStatusChange, onViewDetails, canConfirm }) => {
  const normalizedStatus = normalizeTargetOrderStatus(request.status);
  const isSiteWallet = isSiteWalletPaymentMethod(request.paymentMethodId || request.paymentMethod || request.paymentMethodName);
  const proofUrl = request.screenshotProof || request.proofImage;

  return (
    <article className="overflow-hidden rounded-[1.25rem] border border-indigo-500/15 bg-[linear-gradient(145deg,rgb(var(--color-card-rgb)/0.98),rgb(var(--color-elevated-rgb)/0.78))] shadow-[0_18px_45px_-38px_rgb(99_102_241/0.55)]">
      <div className="flex items-start justify-between gap-3 border-b border-[color:rgb(var(--color-border-rgb)/0.58)] px-3.5 py-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-black text-[var(--color-text)]">{request.appNameSnapshot || request.productName}</h3>
          <p className="mt-1 text-[10px] text-[var(--color-text-secondary)]">{formatDateTime(request.createdAt, 'en-US')}</p>
        </div>
        <Badge variant={getTargetOrderStatusVariant(normalizedStatus)}>{getTargetOrderStatusLabel(normalizedStatus)}</Badge>
      </div>

      <div className="space-y-3 p-3.5">
        <div className="flex min-w-0 items-center gap-2.5 rounded-xl bg-[color:rgb(var(--color-surface-rgb)/0.52)] p-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
            <UserRound className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-[var(--color-text)]">{request.userName || 'عميل التارجت'}</p>
            <p className="mt-0.5 truncate text-[10px] text-[var(--color-text-secondary)]">{request.userEmail || `ID: ${request.userId || '-'}`}</p>
          </div>
          {request.userId ? (
            <button type="button" onClick={() => copyText(request.userId)} className="shrink-0 rounded-lg border border-indigo-500/15 px-2 py-1 text-[9px] font-bold text-indigo-500">
              نسخ ID
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-sky-500/15 bg-sky-500/[0.06] p-2.5">
            <p className="text-[9px] text-[var(--color-text-secondary)]">معرّف الحساب</p>
            <p className="mt-1 truncate text-xs font-black text-[var(--color-text)]">{request.senderId || request.transferFromId || '-'}</p>
          </div>
          <div className="rounded-xl border border-indigo-500/15 bg-indigo-500/[0.06] p-2.5">
            <p className="text-[9px] text-[var(--color-text-secondary)]">الدولار</p>
            <p className="mt-1 text-xs font-black text-indigo-500">{formatNumber(request.coinAmount || request.quantity, 'en-US')}</p>
          </div>
          <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.06] p-2.5">
            <p className="flex items-center gap-1 text-[9px] text-[var(--color-text-secondary)]"><CircleDollarSign className="h-3 w-3" /> الإجمالي</p>
            <p className="mt-1 text-xs font-black text-emerald-500">{formatNumber(request.totalPrice, 'en-US', { maximumFractionDigits: 2 })} EGP</p>
          </div>
          <div className="rounded-xl border border-violet-500/15 bg-violet-500/[0.06] p-2.5">
            <p className="flex items-center gap-1 text-[9px] text-[var(--color-text-secondary)]"><WalletCards className="h-3 w-3" /> الاستلام</p>
            <p className="mt-1 truncate text-xs font-black text-violet-500">{getPaymentMethodLabel(request, isSiteWallet)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {proofUrl ? (
            <a href={proofUrl} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-sky-500/20 bg-sky-500/[0.07] text-xs font-bold text-sky-500">
              <Eye className="h-4 w-4" />
              عرض الإثبات
            </a>
          ) : (
            <span className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[color:rgb(var(--color-border-rgb)/0.68)] text-xs text-[var(--color-text-secondary)]">
              <ReceiptText className="h-4 w-4" />
              بدون إثبات
            </span>
          )}
          <button type="button" onClick={() => onViewDetails?.(request)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.07] text-xs font-bold text-indigo-500">
            <ReceiptText className="h-4 w-4" />
            كل التفاصيل
          </button>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-[10px] font-bold text-[var(--color-text-secondary)]">تحديث حالة الطلب</span>
          <select
            value={normalizedStatus}
            onChange={(event) => onStatusChange(request.id, event.target.value)}
            className={`${selectClassName} h-10 rounded-xl px-3 py-1.5 text-xs`}
            disabled={!canConfirm}
          >
            <option value="PENDING">قيد الانتظار</option>
            <option value="APPROVED">قبول</option>
            <option value="REJECTED">رفض</option>
          </select>
        </label>

        {normalizedStatus === 'REJECTED' && (request.rejectionReason || request.adminNotes) ? (
          <p className="rounded-xl border border-rose-500/15 bg-rose-500/[0.06] p-2.5 text-xs text-[var(--color-error)]">{request.rejectionReason || request.adminNotes}</p>
        ) : null}
      </div>
    </article>
  );
};

const AdminOrdersTable = ({ requests = [], onStatusChange, onViewDetails, canConfirm = true, showHeader = true }) => (
  <section className="space-y-4">
    {showHeader ? (
      <div>
        <h2 className="text-xl font-black text-[var(--color-text)]">طلبات التارجت</h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">راجع إثبات التحويل واقبل أو ارفض طلبات التارجت.</p>
      </div>
    ) : null}

    <div className="grid gap-3 lg:hidden">
      {requests.map((request) => (
        <MobileRequestCard
          key={request.id}
          request={request}
          onStatusChange={onStatusChange}
          onViewDetails={onViewDetails}
          canConfirm={canConfirm}
        />
      ))}
      {!requests.length ? (
        <div className="rounded-[1.25rem] border border-dashed border-indigo-500/20 p-8 text-center text-sm text-[var(--color-text-secondary)]">
          لا توجد طلبات تارجت حتى الآن.
        </div>
      ) : null}
    </div>

    <div className="hidden lg:block">
      <Table>
      <TableHeader>
        <TableRow>
          <TableHead>التطبيق</TableHead>
          <TableHead>معرّف الحساب</TableHead>
          <TableHead>الدولار</TableHead>
          <TableHead>الإجمالي</TableHead>
          <TableHead>الدفع</TableHead>
          <TableHead>رقم التحويل</TableHead>
          <TableHead>رقم العملية</TableHead>
          <TableHead>الإثبات</TableHead>
          <TableHead>الحالة</TableHead>
          <TableHead>التفاصيل</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => {
          const normalizedStatus = normalizeTargetOrderStatus(request.status);
          const isSiteWallet = isSiteWalletPaymentMethod(request.paymentMethodId || request.paymentMethod || request.paymentMethodName);
          return (
          <TableRow key={request.id}>
            <TableCell>
              <div>
                <p className="font-bold text-[var(--color-text)]">{request.appNameSnapshot || request.productName}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">{formatDateTime(request.createdAt, 'en-US')}</p>
                {(request.userId || request.userName || request.userEmail) ? (
                  <div className="mt-1.5 max-w-52 text-[10px] text-[var(--color-text-secondary)]">
                    {request.userId ? (
                      <button
                        type="button"
                        onClick={() => copyText(request.userId)}
                        className="inline-flex max-w-full items-center gap-1 rounded-md border border-[color:rgb(var(--color-primary-rgb)/0.2)] px-1.5 py-0.5 font-bold text-[var(--color-primary)]"
                        title="نسخ ID الحساب"
                      >
                        <span className="truncate">ID: {request.userId}</span>
                      </button>
                    ) : null}
                    {request.userName ? <p className="mt-1 truncate font-bold text-[var(--color-text)]">{request.userName}</p> : null}
                    {request.userEmail ? <p className="truncate">{request.userEmail}</p> : null}
                  </div>
                ) : null}
              </div>
            </TableCell>
            <TableCell>
              <p className="font-semibold text-[var(--color-text)]">{request.senderId || request.transferFromId}</p>
            </TableCell>
            <TableCell>{formatNumber(request.coinAmount || request.quantity, 'en-US')}</TableCell>
            <TableCell className="font-bold text-[var(--color-primary)]">
              {formatNumber(request.totalPrice, 'en-US', { maximumFractionDigits: 2 })} EGP
            </TableCell>
            <TableCell>{getPaymentMethodLabel(request, isSiteWallet)}</TableCell>
            <TableCell>
              <button
                type="button"
                onClick={() => copyText(request.transferNumber || request.paymentAccount)}
                className="max-w-40 truncate rounded-lg border border-[color:rgb(var(--color-primary-rgb)/0.2)] px-2 py-1 text-xs font-bold text-[var(--color-primary)] transition hover:bg-[color:rgb(var(--color-primary-rgb)/0.08)]"
                title="نسخ"
              >
                {isSiteWallet ? 'محفظة الموقع' : (request.transferNumber || request.paymentAccount || '-')}
              </button>
            </TableCell>
            <TableCell>
              <button
                type="button"
                onClick={() => copyText(request.transactionNumber || request.transactionId || request.paymentReference)}
                className="max-w-40 truncate rounded-lg border border-[color:rgb(var(--color-primary-rgb)/0.2)] px-2 py-1 text-xs font-bold text-[var(--color-primary)] transition hover:bg-[color:rgb(var(--color-primary-rgb)/0.08)]"
                title="نسخ"
              >
                {request.transactionNumber || request.transactionId || request.paymentReference || '-'}
              </button>
            </TableCell>
            <TableCell>
              {request.screenshotProof || request.proofImage ? (
                <a
                  href={request.screenshotProof || request.proofImage}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[color:rgb(var(--color-primary-rgb)/0.28)] px-3 py-1.5 text-xs font-bold text-[var(--color-primary)] transition hover:bg-[color:rgb(var(--color-primary-rgb)/0.08)]"
                >
                  <Eye className="h-3.5 w-3.5" />
                  عرض
                </a>
              ) : (
                <span className="inline-flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                  <ReceiptText className="h-4 w-4" />
                  غير مرفق
                </span>
              )}
            </TableCell>
            <TableCell>
              <div className="flex min-w-36 items-center gap-2">
                <Badge variant={getTargetOrderStatusVariant(normalizedStatus)}>{getTargetOrderStatusLabel(normalizedStatus)}</Badge>
                <select
                  value={normalizedStatus}
                  onChange={(event) => onStatusChange(request.id, event.target.value)}
                  className={cnStatusSelect}
                  disabled={!canConfirm}
                >
                  <option value="PENDING">قيد الانتظار</option>
                  <option value="APPROVED">قبول</option>
                  <option value="REJECTED">رفض</option>
                </select>
              </div>
              {normalizedStatus === 'REJECTED' && (request.rejectionReason || request.adminNotes) ? (
                <p className="mt-2 max-w-48 text-xs text-[var(--color-error)]">{request.rejectionReason || request.adminNotes}</p>
              ) : null}
            </TableCell>
            <TableCell>
              <button
                type="button"
                onClick={() => onViewDetails?.(request)}
                className="inline-flex items-center gap-2 rounded-full border border-[color:rgb(var(--color-primary-rgb)/0.28)] px-3 py-1.5 text-xs font-bold text-[var(--color-primary)] transition hover:bg-[color:rgb(var(--color-primary-rgb)/0.08)]"
              >
                <ReceiptText className="h-3.5 w-3.5" />
                تفاصيل
              </button>
            </TableCell>
          </TableRow>
          );
        })}

        {!requests.length && (
          <TableRow>
            <TableCell colSpan={10} className="py-10 text-center text-[var(--color-text-secondary)]">
              لا توجد طلبات تارجت حتى الآن.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
      </Table>
    </div>
  </section>
);

const cnStatusSelect = `${selectClassName} h-9 min-w-28 rounded-xl px-3 py-1.5 text-xs`;

export default AdminOrdersTable;
