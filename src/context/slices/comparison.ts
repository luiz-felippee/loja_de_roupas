import { useEffect, useMemo, useState } from 'react';
import type { Product, ProductReview, ToastMessage } from '../../types';
import { readStorage, writeStorage } from '../../utils/storage';
import type { AddToast } from './types';

export function useComparison(products: Product[], addToast: AddToast) {
  // Product Comparison (Até 3 peças lado a lado)
  const [comparedProductIds, setComparedProductIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('hm_compared_product_ids');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed.slice(0, 3);
      }
    } catch {
      // fallback
    }
    return [];
  });
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  useEffect(() => {
    writeStorage('hm_compared_product_ids', comparedProductIds);
  }, [comparedProductIds]);

  const comparedProducts = useMemo(() => {
    return comparedProductIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));
  }, [comparedProductIds, products]);

  const isProductInComparison = (productId: string) => {
    return comparedProductIds.includes(productId);
  };

  const addToComparison = (product: Product): boolean => {
    if (comparedProductIds.includes(product.id)) {
      return true;
    }
    if (comparedProductIds.length >= 3) {
      addToast(
        'Limite de comparação atingido',
        'Você já selecionou o limite máximo de 3 peças para comparação. Remova uma para adicionar outra.',
        'warning'
      );
      return false;
    }
    setComparedProductIds((prev) => [...prev, product.id]);
    addToast(
      'Peça adicionada ao comparador',
      `"${product.name}" pronta para comparação (${comparedProductIds.length + 1} de 3 peças).`,
      'info',
      {
        label: 'Ver Comparativo',
        onClick: () => setIsComparisonModalOpen(true)
      }
    );
    return true;
  };

  const removeFromComparison = (productId: string) => {
    setComparedProductIds((prev) => prev.filter((id) => id !== productId));
  };

  const toggleProductComparison = (product: Product) => {
    if (comparedProductIds.includes(product.id)) {
      removeFromComparison(product.id);
      addToast('Peça removida', `"${product.name}" removida da comparação.`, 'info');
    } else {
      addToComparison(product);
    }
  };

  const clearComparison = () => {
    setComparedProductIds([]);
    addToast('Comparador limpo', 'Todas as peças foram removidas da lista de comparação.', 'info');
  };

  return {
    addToComparison,
    clearComparison,
    comparedProductIds,
    comparedProducts,
    isComparisonModalOpen,
    isProductInComparison,
    removeFromComparison,
    setComparedProductIds,
    setIsComparisonModalOpen,
    toggleProductComparison,
  };
}
