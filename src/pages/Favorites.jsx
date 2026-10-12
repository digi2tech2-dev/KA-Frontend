import React, { useEffect, useMemo, useState } from 'react';
import { Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/useAuthStore';
import useFavoritesStore, { favoriteUserKey } from '../store/useFavoritesStore';
import useGroupStore from '../store/useGroupStore';
import useMediaStore from '../store/useMediaStore';
import ProductCardSimple from '../components/products/ProductCardSimple';
import ProductPurchaseDialog from '../components/products/ProductPurchaseDialog';
import { createStorefrontProducts, getStorefrontLanguage } from '../utils/storefront';

const EMPTY_FAVORITES = [];

const Favorites = () => {
  const user = useAuthStore((state) => state.user);
  const products = useMediaStore((state) => state.products);
  const loadProducts = useMediaStore((state) => state.loadProducts);
  const groupsLastLoadedAt = useGroupStore((state) => state.groupsLastLoadedAt);
  const favoriteIds = useFavoritesStore((state) => state.favoritesByUser[favoriteUserKey(user)] || EMPTY_FAVORITES);
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const language = getStorefrontLanguage(i18n);

  useEffect(() => {
    void loadProducts({ force: true });
  }, [loadProducts]);

  const favoriteProducts = useMemo(() => {
    const ids = new Set(favoriteIds);
    return createStorefrontProducts(products, {
      language,
      userGroup: user?.groupId || user?.group || 'Normal',
      userGroupPercentage: user?.groupPercentage ?? null,
    }).filter((product) => ids.has(String(product.id)));
  }, [favoriteIds, groupsLastLoadedAt, language, products, user?.group, user?.groupId, user?.groupPercentage]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 pb-8">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-rose-500/10 text-rose-500"><Heart className="h-5 w-5" fill="currentColor" /></span>
        <div>
          <h1 className="text-xl font-black text-[var(--color-text)]">{language === 'ar' ? 'المفضلة' : 'Favorites'}</h1>
          <p className="text-xs text-[var(--color-text-secondary)]">{language === 'ar' ? `${favoriteProducts.length} منتج` : `${favoriteProducts.length} products`}</p>
        </div>
      </div>

      {favoriteProducts.length ? (
        <div className="products-grid products-grid--items grid grid-cols-3 gap-2 p-1 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5">
          {favoriteProducts.map((product) => (
            <ProductCardSimple key={product.id} product={product} onOpen={setSelectedProduct} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[color:rgb(var(--color-border-rgb)/0.6)] bg-[var(--color-card)] px-5 py-10 text-center">
          <p className="text-sm font-semibold text-[var(--color-text-secondary)]">{language === 'ar' ? 'لا توجد منتجات في المفضلة حاليًا' : 'No favorite products yet'}</p>
          <Link to="/products" className="mt-3 inline-block text-sm font-bold text-[var(--color-primary)]">{language === 'ar' ? 'تصفح المنتجات' : 'Browse products'}</Link>
        </div>
      )}

      <ProductPurchaseDialog
        isOpen={Boolean(selectedProduct)}
        productId={selectedProduct?.id}
        initialProduct={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onViewOrder={(orderId) => { setSelectedProduct(null); navigate(`/orders/${encodeURIComponent(orderId)}`); }}
      />
    </div>
  );
};

export default Favorites;
