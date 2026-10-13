import { useEffect, useMemo, useState } from 'react';
import type { Product, ProductReview, ToastMessage } from '../../types';
import { readStorage, writeStorage } from '../../utils/storage';
import { soundEffects } from '../../utils/audio';
import { INITIAL_REVIEWS } from '../../data/initialReviews';
import type { AddToast } from './types';

export function useReviews(addToast: AddToast) {
  // Avaliações de Clientes (Reviews & Ratings)
  const [reviews, setReviews] = useState<ProductReview[]>(() => readStorage('hm_product_reviews', INITIAL_REVIEWS));

  useEffect(() => {
    writeStorage('hm_product_reviews', reviews);
  }, [reviews]);

  const addReview = (newReview: Omit<ProductReview, 'id' | 'createdAt'>) => {
    const created: ProductReview = {
      ...newReview,
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    setReviews((prev) => [created, ...prev]);
    soundEffects.playSuccess();
    addToast(
      '⭐ Avaliação publicada!',
      'Obrigado pelo seu feedback! Sua avaliação ajuda outros clientes na escolha das peças.',
      'success'
    );
  };

  const getProductReviews = (productId: string) => {
    return reviews.filter((r) => r.productId === productId);
  };

  const getProductRating = (productId: string) => {
    const list = reviews.filter((r) => r.productId === productId);
    if (list.length === 0) return { average: 5.0, count: 0 };
    const sum = list.reduce((acc, r) => acc + r.rating, 0);
    return {
      average: Number((sum / list.length).toFixed(1)),
      count: list.length
    };
  };

  return {
    addReview,
    getProductRating,
    getProductReviews,
    reviews,
    setReviews,
  };
}
