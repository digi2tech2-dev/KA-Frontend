import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { resolveImageUrl } from '../../utils/imageUrl';

const getImageValue = (value) => {
  if (typeof value === 'string') return value.trim();
  if (!value || typeof value !== 'object') return '';

  return String(value.url || value.path || value.src || value.preview || value.location || '').trim();
};

const getProductImageCandidates = (product = {}, categoryImage = '') => {
  const candidates = [
    product.image,
    product.imageUrl,
    product.productImage,
    product.productImageUrl,
    product.thumbnail,
    product.thumbnailUrl,
    product.coverImage,
    product.photo,
    product.logo,
    product.icon,
    product.images?.[0],
    product.media?.image,
    product.providerProduct?.image,
    product.providerProduct?.imageUrl,
    product.rawPayload?.image,
    product.rawPayload?.imageUrl,
    categoryImage,
  ]
    .map(getImageValue)
    .filter(Boolean)
    .map(resolveImageUrl);

  return [...new Set(candidates)];
};

const ProductArtwork = ({ product, categoryImage, isUnavailable }) => {
  const candidates = useMemo(() => getProductImageCandidates(product, categoryImage), [categoryImage, product]);
  const [candidateIndex, setCandidateIndex] = useState(0);

  useEffect(() => {
    setCandidateIndex(0);
  }, [product?.id]);

  const imageSrc = candidates[candidateIndex];

  if (!imageSrc) {
    return (
      <span className="grid h-full w-full place-items-center text-[var(--color-primary)]" aria-hidden="true">
        <ShoppingBag className="h-8 w-8 opacity-55" strokeWidth={1.6} />
      </span>
    );
  }

  return (
    <img
      src={imageSrc}
      alt=""
      aria-hidden="true"
      className={`h-full w-full object-contain p-2.5 ${isUnavailable ? 'opacity-45 grayscale' : ''}`}
      loading="lazy"
      decoding="async"
      onError={() => setCandidateIndex((current) => current + 1)}
    />
  );
};

const BestSellingSection = ({
  id,
  title,
  viewAllLabel,
  products,
  categories = [],
  language = 'ar',
  onViewAll,
  onProductSelect,
  disableUnavailable = false,
}) => {
  const isArabic = language === 'ar';
  const DirectionIcon = isArabic ? ChevronLeft : ChevronRight;
  const categoryImages = useMemo(() => new Map(
    categories.map((category) => [String(category?.id || category?._id || ''), category?.image || ''])
  ), [categories]);

  return (
    <section
      className="mx-auto w-full max-w-5xl border-y border-[color:rgb(var(--color-border-rgb)/0.7)] py-4 sm:py-5"
      aria-labelledby={id}
    >
      <div className="mb-3 flex items-center justify-between gap-3 px-0.5 sm:mb-4 sm:px-1">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[color:rgb(var(--color-primary-rgb)/0.12)] text-[var(--color-primary)]" aria-hidden="true">
            <ShoppingBag className="h-4 w-4" strokeWidth={2.2} />
          </span>
          <h2 id={id} className="truncate text-base font-black text-[var(--color-text)] sm:text-lg">
            {title}
          </h2>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg px-2 text-[0.72rem] font-extrabold text-[var(--color-primary)] transition-colors hover:bg-[color:rgb(var(--color-primary-rgb)/0.09)] sm:px-2.5 sm:text-xs"
        >
          <span>{viewAllLabel}</span>
          <DirectionIcon className="h-3.5 w-3.5" strokeWidth={2.3} aria-hidden="true" />
        </button>
      </div>

      <div
        className="scrollbar-hide flex snap-x snap-mandatory gap-2.5 overflow-x-auto overscroll-x-contain px-0.5 pb-1 sm:grid sm:grid-cols-4 sm:gap-3 sm:overflow-visible sm:px-1 lg:grid-cols-5"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {products.map((product) => {
          const productName = product.displayName || product.nameAr || product.name || '';
          const categoryImage = categoryImages.get(String(product.category || '')) || '';
          const isUnavailable = product.storefrontStatus?.isPurchasable === false;
          const unavailableLabel = product.storefrontStatus?.badgeLabel || (isArabic ? 'غير متاح' : 'Unavailable');
          const statusLabel = isUnavailable ? unavailableLabel : (isArabic ? 'متوفر' : 'Available');
          const isDisabled = disableUnavailable && isUnavailable;

          return (
            <button
              key={product.id}
              type="button"
              onClick={() => {
                if (!isDisabled) onProductSelect(product);
              }}
              disabled={isDisabled}
              className={`group min-w-[9.25rem] snap-start overflow-hidden rounded-xl border border-[color:rgb(var(--color-border-rgb)/0.78)] bg-[var(--color-card)] text-start transition-colors hover:border-[color:rgb(var(--color-primary-rgb)/0.42)] min-[430px]:min-w-[10.25rem] sm:min-w-0 ${isDisabled ? 'cursor-not-allowed opacity-70' : ''}`}
              aria-label={productName}
            >
              <span className="relative flex aspect-[5/4] w-full items-center justify-center overflow-hidden border-b border-[color:rgb(var(--color-border-rgb)/0.62)] bg-[color:rgb(var(--color-surface-rgb)/0.72)]">
                <ProductArtwork product={product} categoryImage={categoryImage} isUnavailable={isUnavailable} />
                <span className={`absolute end-2 top-2 inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[0.6rem] font-extrabold ${isUnavailable ? 'border-rose-400/25 bg-[var(--color-card)] text-rose-500' : 'border-emerald-400/25 bg-[var(--color-card)] text-emerald-600 dark:text-emerald-400'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${isUnavailable ? 'bg-rose-500' : 'bg-emerald-500'}`} aria-hidden="true" />
                  {statusLabel}
                </span>
              </span>

              <span className="flex min-h-[3.6rem] items-center justify-between gap-2 px-2.5 py-2">
                <span className="line-clamp-2 text-[0.75rem] font-extrabold leading-5 text-[var(--color-text)] sm:text-[0.8rem]">
                  {productName}
                </span>
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[color:rgb(var(--color-primary-rgb)/0.1)] text-[var(--color-primary)] transition-colors group-hover:bg-[color:rgb(var(--color-primary-rgb)/0.16)]" aria-hidden="true">
                  <DirectionIcon className="h-3.5 w-3.5" strokeWidth={2.4} />
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default BestSellingSection;
