import React from 'react';
import { Heart } from 'lucide-react';
import { cn } from '../ui/Button';
import UnavailableLockOverlay from './UnavailableLockOverlay';
import { resolveImageUrl } from '../../utils/imageUrl';
import useAuthStore from '../../store/useAuthStore';
import useFavoritesStore, { favoriteUserKey } from '../../store/useFavoritesStore';

const ProductCardSimple = React.memo(({
  product,
  categoryLabel,
  onOpen,
  showCategory = false,
  buyLabel = 'Buy now',
  unavailableLabel = 'غير متاح',
}) => {
  const user = useAuthStore((state) => state.user);
  const userKey = favoriteUserKey(user);
  const isFavorite = useFavoritesStore((state) => (state.favoritesByUser[userKey] || []).includes(String(product.id)));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const isUnavailable = product.storefrontStatus?.isPurchasable === false;
  const resolvedUnavailableLabel = product.storefrontStatus?.badgeLabel || unavailableLabel;
  const imageSrc = String(product.image || '').trim();
  const resolvedImageSrc = imageSrc ? resolveImageUrl(imageSrc) : '';
  const arabicName = product.nameAr || product.displayName || product.name || 'Product';
  const englishName = product.name || product.externalProductName || product.nameAr || '';
  const displayName = arabicName;

  return (
    <div
      className={cn(
        'storefront-product-card group relative isolate flex w-full origin-center select-none flex-col rounded-[1.25rem] p-2 text-start transition-all duration-200 ease-out hover:-translate-y-0.5',
        isUnavailable && 'hover:translate-y-0'
      )}
    >
      <button type="button" onClick={() => onOpen(product)} className="absolute inset-0 z-20 rounded-[1.25rem]" aria-label={displayName} />
      <button
        type="button"
        onClick={() => toggleFavorite(userKey, product.id)}
        className={cn('absolute end-3 top-3 z-30 grid h-8 w-8 place-items-center rounded-full border border-[color:rgb(var(--color-border-rgb)/0.75)] bg-[var(--color-card)] shadow-sm transition-colors hover:text-rose-500', isFavorite ? 'text-rose-500' : 'text-[var(--color-text-secondary)]')}
        aria-label={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
        aria-pressed={isFavorite}
      >
        <Heart className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
      </button>
      {isUnavailable ? (
        <span className="pointer-events-none absolute inset-0 z-10 rounded-[1.25rem] bg-[linear-gradient(180deg,rgb(255_255_255/0.14),rgb(244_114_208/0.08))] dark:bg-[linear-gradient(180deg,rgb(255_255_255/0.06),rgb(124_58_237/0.08))]" aria-hidden="true" />
      ) : null}
      <div className="storefront-product-media pointer-events-none relative overflow-hidden rounded-[1rem]">
        {resolvedImageSrc ? (
          <img
            src={resolvedImageSrc}
            alt={displayName}
            loading="lazy"
            decoding="async"
            sizes="(max-width: 640px) 32vw, (max-width: 1024px) 24vw, 18vw"
            className={cn(
              'relative block aspect-square h-full w-full bg-transparent object-contain object-center p-2 transition duration-500 group-hover:scale-[1.04]',
              isUnavailable && 'brightness-[0.92] saturate-[0.88]'
            )}
          />
        ) : (
          <div
            aria-hidden="true"
            className={cn(
              'relative grid aspect-square h-full w-full place-items-center rounded-[1rem] border border-[color:rgb(var(--color-border-rgb)/0.72)] bg-[color:rgb(var(--color-surface-rgb)/0.72)] text-2xl font-black text-[var(--color-text-secondary)] transition duration-500 group-hover:scale-[1.03]',
              isUnavailable && 'brightness-[0.94] saturate-[0.88]'
            )}
          >
            {displayName.slice(0, 1).toUpperCase()}
          </div>
        )}
        {isUnavailable && (
          <div className="absolute inset-0 z-20 bg-white/12 dark:bg-white/5">
            <UnavailableLockOverlay label={resolvedUnavailableLabel} size="md" />
          </div>
        )}
      </div>

      <div className="storefront-product-title pointer-events-none relative z-20 mt-2 w-full text-center transition-colors duration-200 group-hover:text-[var(--color-primary)]">
        <h3 className="line-clamp-1 text-[0.78rem] font-bold leading-5 text-[var(--color-text)] sm:text-sm" dir="rtl">
          {arabicName}
        </h3>
        {englishName && englishName !== arabicName ? (
          <p className="line-clamp-1 text-[0.68rem] font-semibold leading-4 text-[var(--color-text-secondary)]" dir="ltr">
            {englishName}
          </p>
        ) : null}
      </div>
    </div>
  );
});

ProductCardSimple.displayName = 'ProductCardSimple';

export default ProductCardSimple;
