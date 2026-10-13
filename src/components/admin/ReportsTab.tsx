import React, { useMemo, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { SAMPLE_ORDER_IDS } from '../../data/sampleOrders';
import { resumoVendas } from '../../utils/reports';
import type { PaymentMethod } from '../../types';

const PAGAMENTO: Record<PaymentMethod, string> = { pix: 'Pix', cartao: 'Cartão', dinheiro: 'Dinheiro' };

type Periodo = 'hoje' | '7d' | '30d' | 'tudo';
const PERIODOS: { id: Periodo; label: string }[] = [
  { id: 'hoje', label: 'Hoje' },
  { id: '7d', label: '7 dias' },
  { id: '30d', label: '30 dias' },
  { id: 'tudo', label: 'Tudo' },
];

const brl = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

function inicioDoPeriodo(p: Periodo): Date | undefined {
  if (p === 'tudo') return undefined;
  const d = new Date();
  if (p === 'hoje') {
    d.setHours(0, 0, 0, 0);
    return d;
  }
  d.setDate(d.getDate() - (p === '7d' ? 6 : 29));
  d.setHours(0, 0, 0, 0);
  return d;
}

export const ReportsTab: React.FC = () => {
  const { orders } = useStore();
  const [periodo, setPeriodo] = useState<Periodo>('7d');

  const pedidosReais = useMemo(() => orders.filter((o) => !SAMPLE_ORDER_IDS.has(o.id)), [orders]);
  const desde = useMemo(() => inicioDoPeriodo(periodo), [periodo]);
  const resumo = useMemo(() => resumoVendas(pedidosReais, desde), [pedidosReais, desde]);
  const pedidosDoPeriodo = useMemo(
    () => pedidosReais.filter((o) => !desde || new Date(o.createdAt).getTime() >= desde.getTime()),
    [pedidosReais, desde],
  );
  const maxDia = Math.max(1, ...resumo.porDia.map((d) => d.total));

  const exportarCsv = () => {
    const cabecalho = ['codigo', 'data', 'cliente', 'pagamento', 'recebimento', 'cupom', 'desconto', 'total', 'etapa'];
    const linhas = pedidosDoPeriodo.map((o) =>
      [
        o.id,
        new Date(o.createdAt).toLocaleString('pt-BR'),
        o.customer.name,
        PAGAMENTO[o.paymentMethod],
        o.deliveryType,
        o.couponCode ?? '',
        (o.discount ?? 0).toFixed(2).replace('.', ','),
        o.total.toFixed(2).replace('.', ','),
        o.status,
      ]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(';'),
    );
    const blob = new Blob(['﻿' + [cabecalho.join(';'), ...linhas].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vendas-${periodo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const card = 'bg-[#0f1d3b] border border-zinc-800 rounded-2xl p-5';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex gap-2">
          {PERIODOS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriodo(p.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg ${periodo === p.id ? 'bg-amber-400 text-black' : 'bg-zinc-800 text-zinc-300'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <button onClick={exportarCsv} disabled={pedidosDoPeriodo.length === 0} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-zinc-800 text-white disabled:opacity-40">
          Exportar CSV
        </button>
      </div>

      <div className={card + ' grid grid-cols-2 lg:grid-cols-4 gap-4'}>
        <Metrica titulo="Faturamento" valor={brl(resumo.faturamento)} />
        <Metrica titulo="Pedidos" valor={String(resumo.pedidos)} />
        <Metrica titulo="Ticket médio" valor={brl(resumo.ticketMedio)} />
        <Metrica titulo="Pix / Cartão / Dinheiro" valor={`${brl(resumo.porPagamento.pix)} · ${brl(resumo.porPagamento.cartao)} · ${brl(resumo.porPagamento.dinheiro)}`} pequeno />
      </div>

      <div className={card}>
        <h3 className="text-sm font-extrabold text-white mb-4">Faturamento por dia</h3>
        {resumo.porDia.length === 0 ? (
          <p className="text-xs text-zinc-500">Nenhuma venda no período.</p>
        ) : (
          <div className="space-y-2">
            {resumo.porDia.map((d) => (
              <div key={d.data} className="flex items-center gap-3 text-xs">
                <span className="w-20 text-zinc-400 tabular-nums">{d.data.slice(5).split('-').reverse().join('/')}</span>
                <div className="flex-1 h-4 bg-[#0f1d3b] rounded">
                  <div className="h-4 rounded bg-amber-400" style={{ width: `${(d.total / maxDia) * 100}%` }} />
                </div>
                <span className="w-28 text-right text-zinc-200 tabular-nums">{brl(d.total)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={card}>
        <h3 className="text-sm font-extrabold text-white mb-3">Mais vendidos</h3>
        {resumo.maisVendidos.length === 0 ? (
          <p className="text-xs text-zinc-500">Sem dados.</p>
        ) : (
          <table className="w-full text-xs">
            <thead className="text-zinc-500 text-left">
              <tr><th className="py-1">Produto</th><th className="py-1 text-right">Qtd</th><th className="py-1 text-right">Faturamento</th></tr>
            </thead>
            <tbody className="text-zinc-200">
              {resumo.maisVendidos.map((p) => (
                <tr key={p.nome} className="border-t border-zinc-800">
                  <td className="py-2">{p.nome}</td>
                  <td className="py-2 text-right tabular-nums">{p.quantidade}</td>
                  <td className="py-2 text-right tabular-nums">{brl(p.faturamento)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const Metrica: React.FC<{ titulo: string; valor: string; pequeno?: boolean }> = ({ titulo, valor, pequeno }) => (
  <div>
    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">{titulo}</p>
    <p className={`${pequeno ? 'text-xs' : 'text-base'} font-black tabular-nums text-white`}>{valor}</p>
  </div>
);
