import type { Coupon } from '../types';

export type ResultadoCupom = { ok: true; coupon: Coupon; discount: number } | { ok: false; motivo: string };

/** Data local no formato AAAA-MM-DD (sem conversao para UTC). */
export function dataIso(d: Date): string {
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export function calcularDesconto(coupon: Coupon, subtotal: number): number {
  const bruto = coupon.type === 'percent' ? subtotal * (coupon.value / 100) : coupon.value;
  const limitado = Math.min(Math.max(bruto, 0), subtotal);
  return Math.round(limitado * 100) / 100;
}

export function validarCupom(
  cupons: Coupon[],
  codigo: string,
  subtotal: number,
  agora: Date = new Date(),
): ResultadoCupom {
  const busca = codigo.trim().toUpperCase();
  if (!busca) return { ok: false, motivo: 'Digite um código de cupom.' };

  const coupon = cupons.find((c) => c.code.toUpperCase() === busca);
  if (!coupon || !coupon.active) return { ok: false, motivo: 'Cupom inválido.' };

  const hoje = dataIso(agora);
  if (coupon.validFrom && hoje < coupon.validFrom) return { ok: false, motivo: 'Este cupom ainda não está válido.' };
  if (coupon.validUntil && hoje > coupon.validUntil) return { ok: false, motivo: 'Este cupom expirou.' };
  if (coupon.maxUses != null && coupon.uses >= coupon.maxUses) return { ok: false, motivo: 'Este cupom já atingiu o limite de usos.' };
  if (subtotal < coupon.minOrder) {
    const minimo = coupon.minOrder.toFixed(2).replace('.', ',');
    return { ok: false, motivo: `Pedido mínimo de R$ ${minimo} para usar este cupom.` };
  }

  return { ok: true, coupon, discount: calcularDesconto(coupon, subtotal) };
}
