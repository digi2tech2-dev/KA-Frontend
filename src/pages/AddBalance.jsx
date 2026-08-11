import React, { useEffect, useMemo, useState } from 'react';
import { Building2, ChevronDown, CreditCard, ShieldCheck, Smartphone, Wallet, Zap } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import useAuthStore from '../store/useAuthStore';
import useSystemStore from '../store/useSystemStore';
import { resolveImageUrl } from '../utils/imageUrl';
import { formatWalletNumber } from '../utils/storefront';
import { getActivePaymentGroups } from '../utils/paymentSettings';

const getMethodIcon = (method) => {
  const token = `${method?.type || ''} ${method?.id || ''} ${method?.name || ''}`.toLowerCase();
  if (token.includes('bank') || token.includes('تحويل')) return Building2;
  if (token.includes('wallet') || token.includes('vodafone') || token.includes('orange') || token.includes('etisalat')) return Smartphone;
  return CreditCard;
};

const PaymentMethodButton = ({ method, onSelect }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const Icon = getMethodIcon(method);
  const showImage = Boolean(method?.image) && !imageFailed;

  return (
    <button
      type="button"
      onClick={() => onSelect(method)}
      className="group flex min-w-0 flex-col items-center justify-center gap-2 rounded-[0.9rem] border border-[color:rgb(var(--color-border-rgb)/0.78)] bg-[color:rgb(var(--color-card-rgb)/0.72)] p-2 text-center shadow-[0_14px_34px_-30px_rgb(var(--color-primary-rgb)/0.58)] transition-all hover:-translate-y-0.5 hover:border-[color:rgb(var(--color-primary-rgb)/0.38)] hover:bg-[color:rgb(var(--color-card-rgb)/0.92)]"
    >
      <span className="grid aspect-square w-full place-items-center overflow-hidden rounded-[0.72rem] border border-[color:rgb(var(--color-primary-rgb)/0.18)] bg-[color:rgb(var(--color-primary-rgb)/0.08)] text-[var(--color-primary)]">
        {showImage ? (
          <img
            src={resolveImageUrl(method.image)}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <Icon className="h-6 w-6" />
        )}
      </span>

      <span className="block min-w-0 w-full">
        <strong className="block truncate text-[0.7rem] font-extrabold text-[var(--color-text)] sm:text-xs">
          {method.name}
        </strong>
      </span>
    </button>
  );
};

const AddBalance = ({
  embedded = false,
  automaticAmount = null,
  automaticCurrency = '',
  onSelectMethod = null,
}) => {
  const { dir } = useLanguage();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const paymentSettings = useSystemStore((state) => state.paymentSettings);
  const loadPaymentSettings = useSystemStore((state) => state.loadPaymentSettings);
  const isRTL = dir === 'rtl';

  useEffect(() => {
    void loadPaymentSettings({ force: true }).catch(() => null);
  }, [loadPaymentSettings]);

  const currentBalance = Number(user?.walletBalance ?? user?.coins ?? user?.balance ?? 0);
  const currentCurrency = String(user?.currency || 'USD').toUpperCase();
  const suggestedAmount = Number(automaticAmount ?? searchParams.get('amount') ?? 0);
  const suggestedCurrency = String(automaticCurrency || searchParams.get('currency') || currentCurrency).toUpperCase();
  const isAutomaticTopup = (embedded || searchParams.get('mode') === 'auto')
    && Number.isFinite(suggestedAmount)
    && suggestedAmount > 0;
  const [openGroupId, setOpenGroupId] = useState(null);

  const paymentGroups = useMemo(
    () => getActivePaymentGroups(paymentSettings, { fallbackToDefault: false }),
    [paymentSettings]
  );

  useEffect(() => {
    if (!paymentGroups.length) {
      setOpenGroupId(null);
      return;
    }
    setOpenGroupId((current) => (
      paymentGroups.some((group) => String(group.id) === String(current))
        ? current
        : paymentGroups[0].id
    ));
  }, [paymentGroups]);

  const handleMethodSelect = (method) => {
    if (onSelectMethod) {
      onSelectMethod(method);
      return;
    }

    const next = new URLSearchParams();
    if (isAutomaticTopup) {
      next.set('amount', String(suggestedAmount));
      next.set('currency', suggestedCurrency);
      next.set('mode', 'auto');
    }
    const query = next.toString();
    navigate(`/wallet/payment-details/${method.id}${query ? `?${query}` : ''}`);
  };

  return (
    <div className={embedded ? 'w-full min-w-0 overflow-x-hidden pb-1' : 'min-h-full pb-6'} dir={dir}>
      <div className="mx-auto w-full min-w-0 max-w-3xl space-y-3 px-1 sm:space-y-4 sm:px-2">
        <section className="relative isolate overflow-hidden rounded-[1.55rem] border border-cyan-300/20 bg-[radial-gradient(22rem_circle_at_95%_-20%,rgb(244_114_208/0.42),transparent_48%),radial-gradient(18rem_circle_at_4%_115%,rgb(37_99_235/0.5),transparent_52%),linear-gradient(135deg,#10082b_0%,#24205c_38%,#075a75_70%,#b37a18_115%)] p-4 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_30px_70px_-38px_rgb(109_40_217/0.95),0_18px_45px_-34px_rgb(192_38_211/0.9)] sm:p-5">
          <span className="pointer-events-none absolute -end-8 -top-12 -z-10 h-32 w-32 rounded-full border border-white/10 bg-white/8 blur-[1px]" />
          <span className="pointer-events-none absolute end-12 top-2 -z-10 h-20 w-20 rounded-full bg-amber-300/20 blur-3xl" />
          <span className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(255_255_255/0.025)_1px,transparent_1px),linear-gradient(180deg,rgb(255_255_255/0.025)_1px,transparent_1px)] bg-[length:28px_28px] [mask-image:linear-gradient(110deg,black,transparent_72%)]" />

          <div className="relative flex items-center justify-between gap-3 sm:gap-5">
            <div className="min-w-0 flex-1">
              <p className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/8 px-2 py-1 text-[0.62rem] font-black text-amber-100 backdrop-blur-md">
                <Wallet className="h-3 w-3" />
                {isRTL ? 'المحفظة' : 'Wallet'}
              </p>
              <h1 className="mt-2 text-lg font-black tracking-tight text-white drop-shadow-[0_2px_12px_rgb(0_0_0/0.24)] sm:text-2xl">
                {t('wallet.addBalance')}
              </h1>
              <p className="mt-1 max-w-sm text-[0.68rem] font-semibold leading-5 text-cyan-100/75 sm:text-xs">
                {isRTL ? 'اختر وسيلة الدفع المناسبة وأكمل البيانات' : 'Choose a payment method and complete the details'}
              </p>
            </div>

            <div className="relative shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-[linear-gradient(145deg,rgb(255_255_255/0.14),rgb(255_255_255/0.06))] px-3 py-2.5 text-end shadow-[inset_0_1px_0_rgb(255_255_255/0.13),0_16px_35px_-26px_rgb(0_0_0/0.75)] backdrop-blur-xl sm:min-w-36 sm:px-4 sm:py-3">
              <span className="pointer-events-none absolute -end-3 -top-5 h-14 w-14 rounded-full bg-amber-300/20 blur-xl" />
              <span className="relative text-[0.58rem] font-bold text-cyan-100/70 sm:text-[0.65rem]">
                {isRTL ? 'الرصيد الحالي' : 'Current balance'}
              </span>
              <div className="relative mt-1 flex items-baseline justify-end gap-1.5" dir="ltr">
                <strong className="font-['Poppins'] text-xl font-extrabold tracking-tight text-white [font-variant-numeric:tabular-nums] sm:text-2xl">
                  {formatWalletNumber(currentBalance, false, { maximumFractionDigits: 3 })}
                </strong>
                <span className="rounded-md bg-white/12 px-1.5 py-0.5 font-['Poppins'] text-[0.58rem] font-extrabold text-amber-100 sm:text-[0.65rem]">{currentCurrency}</span>
              </div>
            </div>
          </div>
        </section>

        {isAutomaticTopup ? (
          <section className="flex items-center gap-3 rounded-[1rem] border border-amber-400/25 bg-[linear-gradient(115deg,rgb(245_158_11/0.1),rgb(var(--color-primary-rgb)/0.08))] p-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500 text-white shadow-[0_12px_24px_-16px_rgb(245_158_11/0.8)]">
              <Zap className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <strong className="block text-xs font-black text-[var(--color-text)]">
                {isRTL ? 'شحن آلي لإكمال الشراء' : 'Auto top-up for your purchase'}
              </strong>
              <span className="mt-0.5 block text-[0.68rem] font-semibold text-[var(--color-text-secondary)]">
                {isRTL ? 'سنضع المبلغ المطلوب تلقائيًا بعد اختيار وسيلة الدفع' : 'The required amount will be entered automatically'}
              </span>
            </div>
            <strong className="shrink-0 text-sm font-black text-amber-600 dark:text-amber-300" dir="ltr">
              {formatWalletNumber(suggestedAmount, false, { maximumFractionDigits: 3 })} {suggestedCurrency}
            </strong>
          </section>
        ) : null}

        <section className="rounded-[1.3rem] border border-[color:rgb(var(--color-border-rgb)/0.72)] bg-[color:rgb(var(--color-card-rgb)/0.64)] p-3 sm:p-4">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[color:rgb(var(--color-primary-rgb)/0.1)] text-[var(--color-primary)]">
              <CreditCard className="h-4.5 w-4.5" />
            </span>
            <div>
              <h2 className="text-sm font-black text-[var(--color-text)]">
                {isRTL ? 'اختر وسيلة الدفع' : 'Choose a payment method'}
              </h2>
              <p className="mt-0.5 text-[0.68rem] font-semibold text-[var(--color-text-secondary)]">
                {isRTL ? 'كل الوسائل المتاحة لحسابك تظهر هنا' : 'All available methods for your account appear here'}
              </p>
            </div>
          </div>

          {paymentGroups.length ? (
            <div className="space-y-4">
              {paymentGroups.map((group) => (
                <div key={group.id}>
                  <button
                    type="button"
                    onClick={() => setOpenGroupId((current) => (
                      String(current) === String(group.id) ? null : group.id
                    ))}
                    aria-expanded={String(openGroupId) === String(group.id)}
                    className="mb-2 flex min-h-10 w-full items-center justify-between gap-2 rounded-xl border border-[color:rgb(var(--color-border-rgb)/0.7)] bg-[color:rgb(var(--color-surface-rgb)/0.5)] px-3 text-start transition hover:border-[color:rgb(var(--color-primary-rgb)/0.3)] hover:bg-[color:rgb(var(--color-primary-rgb)/0.06)]"
                  >
                    <h3 className="truncate text-xs font-extrabold text-[var(--color-text)]">{group.name}</h3>
                    <span className="flex shrink-0 items-center gap-2">
                      {group.currency ? (
                        <span className="rounded-full bg-[color:rgb(var(--color-primary-rgb)/0.08)] px-2 py-0.5 text-[0.62rem] font-black text-[var(--color-primary)]">
                          {String(group.currency).toUpperCase()}
                        </span>
                      ) : null}
                      <ChevronDown className={`h-4 w-4 text-[var(--color-text-secondary)] transition-transform ${String(openGroupId) === String(group.id) ? 'rotate-180' : ''}`} />
                    </span>
                  </button>
                  {String(openGroupId) === String(group.id) ? (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {group.methods.map((method) => (
                        <PaymentMethodButton
                          key={method.id}
                          method={method}
                          onSelect={handleMethodSelect}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[1rem] border border-dashed border-[color:rgb(var(--color-border-rgb)/0.82)] px-4 py-8 text-center">
              <Wallet className="mx-auto h-7 w-7 text-[var(--color-text-secondary)]" />
              <h3 className="mt-2 text-sm font-black text-[var(--color-text)]">
                {isRTL ? 'لا توجد وسائل دفع متاحة الآن' : 'No payment methods available'}
              </h3>
              <p className="mt-1 text-xs font-semibold text-[var(--color-text-secondary)]">
                {isRTL ? 'يرجى المحاولة لاحقًا أو التواصل مع الدعم' : 'Try again later or contact support'}
              </p>
            </div>
          )}
        </section>

        <div className="flex items-center justify-center gap-2 py-1 text-[0.68rem] font-semibold text-[var(--color-text-secondary)]">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          {isRTL ? 'بيانات التحويل محمية وتُراجع بأمان' : 'Payment details are protected and reviewed securely'}
        </div>
      </div>
    </div>
  );
};

export default AddBalance;
