import { useEffect, useMemo, useState } from 'react';
import type { Product, ProductReview, ToastMessage } from '../../types';
import { readStorage, writeStorage } from '../../utils/storage';

export function useRecentlyViewed(products: Product[]) {
  // Produtos Vistos Recentemente
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => readStorage('hm_recently_viewed_ids', []));

  useEffect(() => {
    writeStorage('hm_recently_viewed_ids', recentlyViewedIds);
  }, [recentlyViewedIds]);

  const recentlyViewedProducts = useMemo(() => {
    return recentlyViewedIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));
  }, [recentlyViewedIds, products]);

  const addToRecentlyViewed = (productId: string) => {
    setRecentlyViewedIds((prev) => {
      const filtered = prev.filter((id) => id !== productId);
      return [productId, ...filtered].slice(0, 8);
    });
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewedIds([]);
  };

  return {
    addToRecentlyViewed,
    clearRecentlyViewed,
    recentlyViewedIds,
    recentlyViewedProducts,
    setRecentlyViewedIds,
  };
}
