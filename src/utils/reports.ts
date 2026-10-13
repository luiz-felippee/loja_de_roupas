import type { Order, PaymentMethod } from '../types';
import { dataIso } from './coupons';

export interface ResumoVendas {
  pedidos: number;
  faturamento: number;
  ticketMedio: number;
  porPagamento: Record<PaymentMethod, number>;
  porDia: { data: string; total: number; pedidos: number }[];
  maisVendidos: { nome: string; quantidade: number; faturamento: number }[];
}

const centavos = (v: number) => Math.round(v * 100) / 100;

/** Resume pedidos entre `desde` e `ate` (inclusive). Sem datas, considera todos. */
export function resumoVendas(pedidos: Order[], desde?: Date, ate?: Date): ResumoVendas {
  const no = pedidos.filter((p) => {
    const t = new Date(p.createdAt).getTime();
    if (desde && t < desde.getTime()) return false;
    if (ate && t > ate.getTime()) return false;
    return true;
  });

  const faturamento = no.reduce((s, p) => s + p.total, 0);
  const porPagamento: Record<PaymentMethod, number> = { pix: 0, cartao: 0, dinheiro: 0 };
  const dias = new Map<string, { total: number; pedidos: number }>();
  const produtos = new Map<string, { quantidade: number; faturamento: number }>();

  for (const p of no) {
    porPagamento[p.paymentMethod] += p.total;
    const dia = dataIso(new Date(p.createdAt));
    const d = dias.get(dia) ?? { total: 0, pedidos: 0 };
    d.total += p.total;
    d.pedidos += 1;
    dias.set(dia, d);
    for (const item of p.items) {
      const acc = produtos.get(item.name) ?? { quantidade: 0, faturamento: 0 };
      acc.quantidade += item.quantity;
      acc.faturamento += item.price * item.quantity;
      produtos.set(item.name, acc);
    }
  }

  return {
    pedidos: no.length,
    faturamento: centavos(faturamento),
    ticketMedio: no.length ? centavos(faturamento / no.length) : 0,
    porPagamento: {
      pix: centavos(porPagamento.pix),
      cartao: centavos(porPagamento.cartao),
      dinheiro: centavos(porPagamento.dinheiro),
    },
    porDia: [...dias.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([data, d]) => ({ data, total: centavos(d.total), pedidos: d.pedidos })),
    maisVendidos: [...produtos.entries()]
      .map(([nome, p]) => ({ nome, quantidade: p.quantidade, faturamento: centavos(p.faturamento) }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10),
  };
}
