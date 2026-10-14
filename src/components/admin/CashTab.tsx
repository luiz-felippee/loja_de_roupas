import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { SAMPLE_ORDER_IDS } from '../../data/sampleOrders';
import { resumoCaixa } from '../../utils/cash';
import type { CashMovementKind, CashSession, Order } from '../../types';

const brl = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;
const numero = (s: string) => Number(s.replace(',', '.'));

export const CashTab: React.FC = () => {
  const { orders, cashSessions, currentCashSession, openCash, addCashMovement, closeCash } = useStore();
  const [fundo, setFundo] = useState('');
  const [tipo, setTipo] = useState<CashMovementKind>('reforco');
  const [valor, setValor] = useState('');
  const [nota, setNota] = useState('');
  const [contado, setContado] = useState('');

  const pedidosReais = orders.filter((o) => !SAMPLE_ORDER_IDS.has(o.id));
  const atual = currentCashSession;
  const resumo = atual ? resumoCaixa(atual, pedidosReais) : null;
  const historico = cashSessions.filter((s) => s.closedAt);

  const card = 'bg-[#0f1d3b] border border-zinc-800 rounded-2xl p-5';
  const campo = 'w-full bg-[#0f1d3b] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400/60';

  if (!atual) {
    return (
      <div className="space-y-6">
        <div className={card + ' space-y-3 max-w-md'}>
          <h3 className="text-sm font-extrabold text-white">Caixa fechado</h3>
          <p className="text-xs text-zinc-400">Informe o fundo de troco para abrir o caixa do dia.</p>
          <input className={campo} placeholder="Fundo de troco (R$)" inputMode="decimal" value={fundo} onChange={(e) => setFundo(e.target.value)} />
          <button
            onClick={() => {
              const v = numero(fundo);
              if (!(v >= 0) || fundo.trim() === '') return;
              openCash(v);
              setFundo('');
            }}
            className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold rounded-xl"
          >
            Abrir caixa
          </button>
        </div>
        <Historico sessoes={historico} pedidos={pedidosReais} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={card + ' grid grid-cols-2 lg:grid-cols-4 gap-4'}>
        <Metrica titulo="Fundo de troco" valor={brl(atual.openingFloat)} />
        <Metrica titulo="Vendas em dinheiro" valor={brl(resumo!.vendasDinheiro)} />
        <Metrica titulo="Reforços / sangrias" valor={`${brl(resumo!.reforcos)} / ${brl(resumo!.sangrias)}`} />
        <Metrica titulo="Esperado na gaveta" valor={brl(resumo!.esperado)} destaque />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className={card + ' space-y-3'}>
          <h3 className="text-sm font-extrabold text-white">Reforço ou sangria</h3>
          <div className="flex gap-2">
            <select className={campo} value={tipo} onChange={(e) => setTipo(e.target.value as CashMovementKind)}>
              <option value="reforco">Reforço (entrou dinheiro)</option>
              <option value="sangria">Sangria (retirou dinheiro)</option>
            </select>
            <input className={campo} placeholder="Valor (R$)" inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} />
          </div>
          <input className={campo} placeholder="Motivo (ex.: troco para o cofre)" value={nota} onChange={(e) => setNota(e.target.value)} />
          <button
            onClick={() => {
              const v = numero(valor);
              if (!(v > 0)) return;
              addCashMovement(tipo, v, nota);
              setValor('');
              setNota('');
            }}
            className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl"
          >
            Registrar
          </button>
          {atual.movements.length > 0 && (
            <ul className="text-[11px] text-zinc-400 space-y-1 pt-2 border-t border-zinc-800">
              {atual.movements.map((m) => (
                <li key={m.id}>
                  {m.kind === 'reforco' ? '+' : '−'} {brl(m.amount)} · {m.note || (m.kind === 'reforco' ? 'Reforço' : 'Sangria')}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={card + ' space-y-3'}>
          <h3 className="text-sm font-extrabold text-white">Fechar caixa</h3>
          <p className="text-xs text-zinc-400">Conte o dinheiro da gaveta e informe o total.</p>
          <input className={campo} placeholder="Dinheiro contado (R$)" inputMode="decimal" value={contado} onChange={(e) => setContado(e.target.value)} />
          <button
            onClick={() => {
              const v = numero(contado);
              if (!(v >= 0) || contado.trim() === '') return;
              closeCash(v);
              setContado('');
            }}
            className="w-full py-2.5 bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold rounded-xl"
          >
            Fechar caixa
          </button>
        </div>
      </div>

      <Historico sessoes={historico} pedidos={pedidosReais} />
    </div>
  );
};

const Metrica: React.FC<{ titulo: string; valor: string; destaque?: boolean }> = ({ titulo, valor, destaque }) => (
  <div>
    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">{titulo}</p>
    <p className={`text-base font-black tabular-nums ${destaque ? 'text-amber-300' : 'text-white'}`}>{valor}</p>
  </div>
);

const Historico: React.FC<{ sessoes: CashSession[]; pedidos: Order[] }> = ({ sessoes, pedidos }) => {
  if (sessoes.length === 0) return null;
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-extrabold text-white">Fechamentos anteriores</h3>
      {sessoes.map((s) => {
        const r = resumoCaixa(s, pedidos);
        const dif = r.diferenca ?? 0;
        return (
          <div key={s.id} className="bg-[#0f1d3b] border border-zinc-800 rounded-xl p-4 text-xs flex flex-wrap gap-x-6 gap-y-1 justify-between">
            <span className="text-zinc-300">{new Date(s.openedAt).toLocaleDateString('pt-BR')}</span>
            <span className="text-zinc-400">Esperado {brl(r.esperado)}</span>
            <span className="text-zinc-400">Contado {brl(r.contado ?? 0)}</span>
            <span className={dif === 0 ? 'text-emerald-300 font-bold' : dif > 0 ? 'text-amber-300 font-bold' : 'text-rose-300 font-bold'}>
              {dif === 0 ? 'Bateu' : dif > 0 ? `Sobra ${brl(dif)}` : `Falta ${brl(-dif)}`}
            </span>
          </div>
        );
      })}
    </div>
  );
};
