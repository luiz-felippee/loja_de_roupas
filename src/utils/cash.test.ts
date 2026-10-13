import { describe, expect, it } from 'vitest';
import { resumoCaixa } from './cash';
import type { CashSession, Order } from '../types';

const pedido = (total: number, paymentMethod: Order['paymentMethod'], createdAt: string): Order => ({
  id: 'HM-0001', createdAt, updatedAt: createdAt, customer: { name: 'A', phone: '', address: '' },
  items: [], paymentMethod, deliveryType: 'retirada', deliveryFee: 0, subtotal: total, total, status: 'novo',
});

const sessao: CashSession = {
  id: 's1',
  openedAt: '2026-10-15T09:00:00.000Z',
  openingFloat: 100,
  movements: [
    { id: 'm1', at: '2026-10-15T10:00:00.000Z', kind: 'reforco', amount: 50, note: '' },
    { id: 'm2', at: '2026-10-15T11:00:00.000Z', kind: 'sangria', amount: 30, note: 'cofre' },
  ],
};

describe('resumoCaixa', () => {
  it('soma fundo, vendas em dinheiro, reforcos e subtrai sangrias', () => {
    const pedidos = [
      pedido(40, 'dinheiro', '2026-10-15T12:00:00.000Z'),
      pedido(60, 'dinheiro', '2026-10-15T13:00:00.000Z'),
      pedido(999, 'pix', '2026-10-15T13:00:00.000Z'),
    ];
    const r = resumoCaixa(sessao, pedidos, new Date('2026-10-15T20:00:00.000Z'));
    expect(r.vendasDinheiro).toBe(100);
    expect(r.esperado).toBe(100 + 100 + 50 - 30);
    expect(r.contado).toBeUndefined();
  });

  it('ignora vendas fora do periodo da sessao', () => {
    const r = resumoCaixa(sessao, [pedido(70, 'dinheiro', '2026-10-14T20:00:00.000Z')], new Date('2026-10-15T20:00:00.000Z'));
    expect(r.vendasDinheiro).toBe(0);
  });

  it('calcula diferenca no fechamento (negativa = falta)', () => {
    const fechada = { ...sessao, closedAt: '2026-10-15T23:00:00.000Z', countedAmount: 190 };
    const r = resumoCaixa(fechada, []);
    expect(r.esperado).toBe(120);
    expect(r.diferenca).toBe(70);
    const falta = resumoCaixa({ ...fechada, countedAmount: 100 }, []);
    expect(falta.diferenca).toBe(-20);
  });
});
