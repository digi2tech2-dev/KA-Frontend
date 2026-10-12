import { create } from 'zustand';

const STORAGE_KEY = 'ka-card:favorite-products:v1';

const readFavorites = () => {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).map(([userId, ids]) => [
      userId,
      Array.isArray(ids) ? [...new Set(ids.map(String).filter(Boolean))] : [],
    ]));
  } catch {
    return {};
  }
};

const saveFavorites = (favoritesByUser) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favoritesByUser));
  } catch {
    // Favorites still work for the current session when storage is unavailable.
  }
};

export const favoriteUserKey = (user) => String(user?.id || user?._id || user?.userId || 'guest');

const useFavoritesStore = create((set) => ({
  favoritesByUser: readFavorites(),
  toggleFavorite: (userKey, productId) => set((state) => {
    const id = String(productId || '').trim();
    if (!id) return state;
    const current = state.favoritesByUser[userKey] || [];
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    const favoritesByUser = { ...state.favoritesByUser, [userKey]: next };
    saveFavorites(favoritesByUser);
    return { favoritesByUser };
  }),
}));

export default useFavoritesStore;
