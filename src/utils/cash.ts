import type { CashSession, Order } from '../types';

export interface ResumoCaixa {
  vendasDinheiro: number;
  reforcos: number;
  sangrias: number;
  esperado: number;
  contado?: number;
  /** contado - esperado: positivo = sobra, negativo = falta. */
  diferenca?: number;
}

const centavos = (v: number) => Math.round(v * 100) / 100;

/** Dinheiro esperado na gaveta: fundo + vendas em dinheiro + reforcos - sangrias. */
export function resumoCaixa(sessao: CashSession, pedidos: Order[], agora: Date = new Date()): ResumoCaixa {
  const inicio = new Date(sessao.openedAt).getTime();
  const fim = sessao.closedAt ? new Date(sessao.closedAt).getTime() : agora.getTime();

  const vendasDinheiro = pedidos
    .filter((p) => p.paymentMethod === 'dinheiro')
    .filter((p) => {
      const t = new Date(p.createdAt).getTime();
      return t >= inicio && t <= fim;
    })
    .reduce((soma, p) => soma + p.total, 0);

  const reforcos = sessao.movements.filter((m) => m.kind === 'reforco').reduce((s, m) => s + m.amount, 0);
  const sangrias = sessao.movements.filter((m) => m.kind === 'sangria').reduce((s, m) => s + m.amount, 0);
  const esperado = centavos(sessao.openingFloat + vendasDinheiro + reforcos - sangrias);

  if (sessao.countedAmount === undefined) {
    return { vendasDinheiro: centavos(vendasDinheiro), reforcos: centavos(reforcos), sangrias: centavos(sangrias), esperado };
  }
  return {
    vendasDinheiro: centavos(vendasDinheiro),
    reforcos: centavos(reforcos),
    sangrias: centavos(sangrias),
    esperado,
    contado: sessao.countedAmount,
    diferenca: centavos(sessao.countedAmount - esperado),
  };
}
