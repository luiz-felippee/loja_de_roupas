import { useEffect, useState } from 'react';
import type { Coupon } from '../../types';
import { api } from '../../lib/api';
import type { AddToast } from './types';

export type NewCoupon = Omit<Coupon, 'id' | 'uses'>;

/**
 * Cupons: a lista completa so existe para a equipe (vem da API).
 * A validacao no checkout e feita pelo servidor, sem expor os codigos ao publico.
 */
export function useCoupons(addToast: AddToast, isStaffLoggedIn: boolean) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  const refresh = async () => {
    try {
      setCoupons(await api<Coupon[]>('/admin/coupons'));
    } catch {
      // Sem conexao: mantem a lista atual
    }
  };

  useEffect(() => {
    if (isStaffLoggedIn) refresh();
    else setCoupons([]);
    // refresh so depende de isStaffLoggedIn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStaffLoggedIn]);

  const addCoupon = async (data: NewCoupon): Promise<boolean> => {
    const code = data.code.trim().toUpperCase();
    try {
      await api('/admin/coupons', { body: { ...data, code } });
      await refresh();
      addToast('Cupom criado', `${code} já pode ser usado no checkout.`, 'success');
      return true;
    } catch (e) {
      addToast('Não foi possível criar o cupom', e instanceof Error ? e.message : 'Erro inesperado.', 'error');
      return false;
    }
  };

  const updateCoupon = async (id: string, data: Partial<NewCoupon>) => {
    try {
      await api(`/admin/coupons/${id}`, { method: 'PATCH', body: data });
      await refresh();
    } catch (e) {
      addToast('Não foi possível atualizar o cupom', e instanceof Error ? e.message : 'Erro inesperado.', 'error');
    }
  };

  // Sem rota de exclusao: desativar tira o cupom de uso e mantem o historico
  const removeCoupon = (id: string) => updateCoupon(id, { active: false });

  return { coupons, addCoupon, updateCoupon, removeCoupon };
}
