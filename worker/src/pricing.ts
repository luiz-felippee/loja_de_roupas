// Regras de preco e cupom executadas no servidor. Espelham src/utils/coupons.ts e src/utils/cash.ts do site.

export interface CouponRow {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  min_order: number;
  valid_from: string | null;
  valid_until: string | null;
  max_uses: number | null;
  uses: number;
  active: number;
}

export interface ProductRow {
  id: string;
  name: string;
  price: number;
  promo_price: number | null;
  promo_ends: string | null;
  stock: number;
  colors_json: string;
  sizes_json: string;
  active: number;
  photo: string | null;
}

export const centavos = (v: number): number => Math.round(v * 100) / 100;

/** Data local do servidor em AAAA-MM-DD. Workers rodam em UTC: a loja opera no fuso de Brasilia (UTC-3). */
export function dataLoja(agora: Date = new Date()): string {
  const local = new Date(agora.getTime() - 3 * 3600_000);
  return local.toISOString().slice(0, 10);
}

/** Preco vigente: promocao vale ate o fim do dia indicado (inclusive). */
export function precoVigente(p: ProductRow, agora: Date = new Date()): number {
  if (p.promo_price == null) return p.price;
  if (p.promo_ends && dataLoja(agora) > p.promo_ends) return p.price;
  return p.promo_price;
}

export type ResultadoCupom =
  | { ok: true; coupon: CouponRow; discount: number }
  | { ok: false; motivo: string };

export function validarCupom(cupom: CouponRow | null, subtotal: number, agora: Date = new Date()): ResultadoCupom {
  if (!cupom || !cupom.active) return { ok: false, motivo: 'Cupom inválido.' };
  const hoje = dataLoja(agora);
  if (cupom.valid_from && hoje < cupom.valid_from) return { ok: false, motivo: 'Este cupom ainda não está válido.' };
  if (cupom.valid_until && hoje > cupom.valid_until) return { ok: false, motivo: 'Este cupom expirou.' };
  if (cupom.max_uses != null && cupom.uses >= cupom.max_uses) return { ok: false, motivo: 'Este cupom já atingiu o limite de usos.' };
  if (subtotal < cupom.min_order) {
    return { ok: false, motivo: `Pedido mínimo de R$ ${cupom.min_order.toFixed(2).replace('.', ',')} para usar este cupom.` };
  }
  const bruto = cupom.type === 'percent' ? subtotal * (cupom.value / 100) : cupom.value;
  const discount = centavos(Math.min(Math.max(bruto, 0), subtotal));
  return { ok: true, coupon: cupom, discount };
}
