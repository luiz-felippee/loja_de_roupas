import { useEffect, useState } from 'react';
import type { Coupon } from '../../types';
import { readStorage, writeStorage } from '../../utils/storage';
import type { AddToast } from './types';

export type NewCoupon = Omit<Coupon, 'id' | 'uses'>;

/** Cupons de desconto: cadastro pela loja e contagem de usos. */
export function useCoupons(addToast: AddToast) {
  const [coupons, setCoupons] = useState<Coupon[]>(() => readStorage<Coupon[]>('hm_coupons', []));

  useEffect(() => {
    writeStorage('hm_coupons', coupons);
  }, [coupons]);

  const addCoupon = (data: NewCoupon): boolean => {
    const code = data.code.trim().toUpperCase();
    if (!code) {
      addToast('Código obrigatório', 'Informe o código do cupom.', 'error');
      return false;
    }
    if (coupons.some((c) => c.code === code)) {
      addToast('Código já existe', `Já existe um cupom com o código ${code}.`, 'error');
      return false;
    }
    setCoupons((prev) => [...prev, { ...data, code, id: crypto.randomUUID(), uses: 0 }]);
    addToast('Cupom criado', `${code} já pode ser usado no checkout.`, 'success');
    return true;
  };

  const updateCoupon = (id: string, data: Partial<NewCoupon>) => {
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  };

  const removeCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  };

  const registerCouponUse = (code: string) => {
    const alvo = code.trim().toUpperCase();
    setCoupons((prev) => prev.map((c) => (c.code === alvo ? { ...c, uses: c.uses + 1 } : c)));
  };

  return { coupons, addCoupon, updateCoupon, removeCoupon, registerCouponUse };
}
