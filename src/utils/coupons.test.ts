import { describe, expect, it } from 'vitest';
import { calcularDesconto, validarCupom } from './coupons';
import type { Coupon } from '../types';

const base: Coupon = { id: '1', code: 'BEMVINDO10', type: 'percent', value: 10, minOrder: 0, uses: 0, active: true };
const agora = new Date(2026, 9, 15, 12, 0, 0); // 15/10/2026 local

describe('calcularDesconto', () => {
  it('aplica percentual sobre o subtotal', () => {
    expect(calcularDesconto(base, 200)).toBe(20);
  });
  it('nao desconta mais que o subtotal em valor fixo', () => {
    expect(calcularDesconto({ ...base, type: 'fixed', value: 500 }, 80)).toBe(80);
  });
  it('arredonda para centavos', () => {
    expect(calcularDesconto({ ...base, value: 33 }, 100)).toBe(33);
    expect(calcularDesconto({ ...base, value: 33.333 }, 100)).toBe(33.33);
  });
});

describe('validarCupom', () => {
  it('aceita cupom valido, ignorando maiusculas e espacos', () => {
    const r = validarCupom([base], '  bemvindo10 ', 150, agora);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.discount).toBe(15);
  });

  it('rejeita codigo vazio e cupom inexistente', () => {
    expect(validarCupom([base], '  ', 100, agora)).toMatchObject({ ok: false });
    expect(validarCupom([base], 'NAOEXISTE', 100, agora)).toMatchObject({ ok: false, motivo: 'Cupom inválido.' });
  });

  it('rejeita cupom desativado', () => {
    expect(validarCupom([{ ...base, active: false }], 'BEMVINDO10', 100, agora)).toMatchObject({ ok: false });
  });

  it('respeita data de inicio e fim', () => {
    const futuro = { ...base, validFrom: '2026-11-01' };
    expect(validarCupom([futuro], 'BEMVINDO10', 100, agora)).toMatchObject({ ok: false, motivo: 'Este cupom ainda não está válido.' });
    const passado = { ...base, validUntil: '2026-10-01' };
    expect(validarCupom([passado], 'BEMVINDO10', 100, agora)).toMatchObject({ ok: false, motivo: 'Este cupom expirou.' });
    const hoje = { ...base, validUntil: '2026-10-15' };
    expect(validarCupom([hoje], 'BEMVINDO10', 100, agora).ok).toBe(true);
  });

  it('respeita limite de usos', () => {
    const esgotado = { ...base, maxUses: 5, uses: 5 };
    expect(validarCupom([esgotado], 'BEMVINDO10', 100, agora)).toMatchObject({ ok: false });
  });

  it('exige valor minimo do pedido', () => {
    const r = validarCupom([{ ...base, minOrder: 150 }], 'BEMVINDO10', 100, agora);
    expect(r).toMatchObject({ ok: false });
    if (!r.ok) expect(r.motivo).toContain('150,00');
  });
});
