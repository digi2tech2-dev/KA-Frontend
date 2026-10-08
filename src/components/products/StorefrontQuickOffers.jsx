import React, { useEffect, useMemo, useState } from 'react';
import { BadgeDollarSign, Download, Sparkles } from 'lucide-react';
import { cn } from '../ui/Button';
import { isNativeApp } from '../../utils/platform';

const StorefrontQuickOffers = ({ language = 'ar', onSellTarget }) => {
  const [activeOffer, setActiveOffer] = useState(0);
  const isArabic = language === 'ar';
  const offers = useMemo(() => {
    const targetOffer = {
      id: 'target-sale',
      icon: BadgeDollarSign,
      title: isArabic ? 'عندك Target؟ حوّله لرصيد' : 'Have Target? Turn it into balance',
      description: isArabic ? 'قدّم طلب البيع بخطوات بسيطة وسريعة.' : 'Submit your sale request in a few simple steps.',
      action: isArabic ? 'ابدأ بيع Target' : 'Start selling Target',
      onClick: onSellTarget,
      tone: 'target',
    };

    if (isNativeApp()) return [targetOffer];

    return [
      {
        id: 'android-download',
        icon: Download,
        title: isArabic ? 'تطبيق AD CARD بين إيديك' : 'AD CARD in your hands',
        description: isArabic ? 'تصفّح أسرع وتجربة أكثر استقرارًا.' : 'Faster browsing and a more stable experience.',
        action: isArabic ? 'نزّل التطبيق الآن' : 'Download the app',
        href: '/download-app',
        tone: 'app',
      },
      targetOffer,
    ];
  }, [isArabic, onSellTarget]);

  useEffect(() => setActiveOffer(0), [offers.length]);

  useEffect(() => {
    if (offers.length < 2) return undefined;
    const id = window.setInterval(() => setActiveOffer((current) => (current + 1) % offers.length), 5000);
    return () => window.clearInterval(id);
  }, [offers.length]);

  const offer = offers[activeOffer] || offers[0];
  const Icon = offer.icon;
  const isTarget = offer.tone === 'target';
  const actionClassName = cn(
    'inline-flex shrink-0 items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[10px] font-extrabold transition-all hover:-translate-y-0.5 hover:brightness-110 sm:px-3 sm:text-xs',
    isTarget
      ? 'border-fuchsia-200/30 bg-[linear-gradient(135deg,#a51c93,#76106b)] text-white shadow-[0_10px_24px_-13px_rgb(165_28_147/0.64)]'
      : 'border-amber-100/35 bg-[linear-gradient(135deg,#e5a668,#bd7041)] text-[#31102f] shadow-[0_10px_24px_-13px_rgb(189_112_65/0.6)]'
  );

  const action = <><Icon className="h-3.5 w-3.5" /><span>{offer.action}</span></>;

  return (
    <section
      className={cn(
        'ad-storefront-offer relative isolate flex h-[5.75rem] flex-col overflow-hidden rounded-[1.15rem] border px-2.5 py-2 shadow-[0_20px_42px_-28px_rgb(49_16_47/0.78)] sm:px-3',
        isTarget ? 'border-fuchsia-300/35 bg-[#210c24]' : 'border-amber-200/35 bg-[#251821]'
      )}
      data-tone={offer.tone}
      aria-label={isArabic ? 'عروض سريعة' : 'Quick offers'}
    >
      <span className={cn(
        'pointer-events-none absolute inset-0 opacity-90',
        isTarget
          ? 'bg-[radial-gradient(circle_at_94%_-20%,rgba(217,54,194,0.4),transparent_38%),radial-gradient(circle_at_2%_120%,rgba(118,16,107,0.64),transparent_48%)]'
          : 'bg-[radial-gradient(circle_at_94%_-20%,rgba(241,185,121,0.42),transparent_38%),radial-gradient(circle_at_2%_120%,rgba(189,112,65,0.42),transparent_48%)]'
      )} />
      <span className="pointer-events-none absolute -end-6 -top-10 h-28 w-28 rounded-full border border-white/10" />
      <div key={offer.id} className="relative flex min-h-0 flex-1 items-center gap-2 animate-in fade-in duration-300">
        <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border shadow-[inset_0_1px_rgba(255,255,255,0.18)]', isTarget ? 'border-fuchsia-200/30 bg-fuchsia-300/15 text-fuchsia-100' : 'border-amber-100/30 bg-amber-200/15 text-amber-100')}>
          {isTarget ? <BadgeDollarSign className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold text-white sm:text-sm">{offer.title}</p>
          <p className="mt-px text-[10px] text-white/72 sm:text-xs">{offer.description}</p>
        </div>
        {offer.href ? <a href={offer.href} className={actionClassName}>{action}</a> : <button type="button" onClick={offer.onClick} className={actionClassName}>{action}</button>}
      </div>
      {offers.length > 1 ? <div className="relative mt-1 flex justify-center gap-1" aria-label={isArabic ? 'اختيار العرض' : 'Choose offer'}>{offers.map((item, index) => <button key={item.id} type="button" onClick={() => setActiveOffer(index)} aria-label={item.title} aria-current={index === activeOffer ? 'true' : undefined} className={cn('h-1 rounded-full transition-all', index === activeOffer ? cn('w-4', isTarget ? 'bg-fuchsia-200' : 'bg-amber-200') : 'w-1 bg-white/25 hover:bg-white/55')} />)}</div> : null}
    </section>
  );
};

export default React.memo(StorefrontQuickOffers);
