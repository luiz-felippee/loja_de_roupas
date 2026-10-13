import { useEffect, useMemo, useState } from 'react';
import type { Product, ProductReview, ToastMessage } from '../../types';
import { readStorage, writeStorage } from '../../utils/storage';
import { soundEffects } from '../../utils/audio';
import type { AddToast } from './types';

export function useWishlist(products: Product[], addToast: AddToast) {
  // Lista de Desejos / Favoritos (Wishlist)
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>(() => readStorage('hm_wishlist_ids', []));
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  useEffect(() => {
    writeStorage('hm_wishlist_ids', wishlistProductIds);
  }, [wishlistProductIds]);

  const wishlistProducts = useMemo(() => {
    return wishlistProductIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));
  }, [wishlistProductIds, products]);

  const isInWishlist = (productId: string) => wishlistProductIds.includes(productId);

  const toggleWishlist = (product: Product) => {
    if (wishlistProductIds.includes(product.id)) {
      setWishlistProductIds((prev) => prev.filter((id) => id !== product.id));
      addToast('Removido dos favoritos', `"${product.name}" foi removido da sua lista de desejos.`, 'info');
    } else {
      setWishlistProductIds((prev) => [...prev, product.id]);
      soundEffects.playCash();
      addToast(
        '❤️ Salvo nos favoritos!',
        `"${product.name}" adicionado à sua lista de desejos.`,
        'success',
        {
          label: 'Ver Favoritos',
          onClick: () => setIsWishlistOpen(true)
        }
      );
    }
  };

  const clearWishlist = () => {
    setWishlistProductIds([]);
    addToast('Favoritos limpos', 'Todos os itens foram removidos da sua lista.', 'info');
  };

  return {
    clearWishlist,
    isInWishlist,
    isWishlistOpen,
    setIsWishlistOpen,
    setWishlistProductIds,
    toggleWishlist,
    wishlistProductIds,
    wishlistProducts,
  };
}
