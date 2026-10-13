import { describe, expect, it } from 'vitest';
import { resumoVendas } from './reports';
import type { Order } from '../types';

const item = (name: string, quantity: number, price: number) => ({
  productId: name, name, color: 'Preto', size: 'M' as const, price, quantity, image: '',
});

const pedido = (id: string, total: number, paymentMethod: Order['paymentMethod'], createdAt: string, items = [item('Polo', 1, total)]): Order => ({
  id, createdAt, updatedAt: createdAt, customer: { name: 'A', phone: '', address: '' },
  items, paymentMethod, deliveryType: 'retirada', deliveryFee: 0, subtotal: total, total, status: 'finalizado',
});

describe('resumoVendas', () => {
  const pedidos = [
    pedido('1', 100, 'pix', '2026-10-14T15:00:00.000Z', [item('Polo', 2, 50)]),
    pedido('2', 60, 'dinheiro', '2026-10-15T15:00:00.000Z', [item('Bermuda', 3, 20)]),
    pedido('3', 40, 'cartao', '2026-10-15T16:00:00.000Z', [item('Polo', 1, 40)]),
  ];

  it('totaliza faturamento, ticket medio e pagamentos', () => {
    const r = resumoVendas(pedidos);
    expect(r.pedidos).toBe(3);
    expect(r.faturamento).toBe(200);
    expect(r.ticketMedio).toBeCloseTo(66.67, 2);
    expect(r.porPagamento).toEqual({ pix: 100, cartao: 40, dinheiro: 60 });
  });

  it('agrupa por dia em ordem crescente', () => {
    const r = resumoVendas(pedidos);
    expect(r.porDia.map((d) => d.pedidos)).toEqual([1, 2]);
    expect(r.porDia[1].total).toBe(100);
  });

  it('ranqueia produtos por quantidade', () => {
    const r = resumoVendas(pedidos);
    expect(r.maisVendidos[0]).toEqual({ nome: 'Polo', quantidade: 3, faturamento: 140 });
    expect(r.maisVendidos[1].nome).toBe('Bermuda');
  });

  it('filtra por periodo', () => {
    const desde = new Date('2026-10-15T00:00:00.000Z');
    const r = resumoVendas(pedidos, desde);
    expect(r.pedidos).toBe(2);
  });

  it('nao quebra sem pedidos', () => {
    const r = resumoVendas([]);
    expect(r.ticketMedio).toBe(0);
    expect(r.porDia).toEqual([]);
  });
});
