import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import type { CouponType } from '../../types';

const vazio = { code: '', type: 'percent' as CouponType, value: '', minOrder: '', validFrom: '', validUntil: '', maxUses: '' };

export const CouponsTab: React.FC = () => {
  const { coupons, addCoupon, updateCoupon } = useStore();
  const [form, setForm] = useState(vazio);
  const [erro, setErro] = useState<string | null>(null);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    const valor = Number(form.value.replace(',', '.'));
    if (!(valor > 0)) return setErro('Informe um valor de desconto maior que zero.');
    if (form.type === 'percent' && valor > 100) return setErro('Percentual não pode passar de 100.');
    const usosMax = form.maxUses.trim() ? Number(form.maxUses) : undefined;
    if (usosMax !== undefined && (!Number.isInteger(usosMax) || usosMax < 1)) {
      return setErro('Limite de usos deve ser um número inteiro maior que zero.');
    }
    setErro(null);
    const criado = await addCoupon({
      code: form.code,
      type: form.type,
      value: valor,
      minOrder: Number(form.minOrder.replace(',', '.')) || 0,
      validFrom: form.validFrom || undefined,
      validUntil: form.validUntil || undefined,
      maxUses: usosMax,
      active: true,
    });
    if (criado) setForm(vazio);
  };

  const campo = 'w-full bg-[#0f1d3b] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400/60';

  return (
    <div className="space-y-6">
      <form onSubmit={salvar} className="bg-[#0f1d3b] border border-zinc-800 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <h3 className="sm:col-span-2 text-sm font-extrabold text-white">Novo cupom</h3>
        <input className={campo} placeholder="Código (ex.: BEMVINDO10)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
        <select className={campo} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as CouponType })}>
          <option value="percent">Percentual (%)</option>
          <option value="fixed">Valor fixo (R$)</option>
        </select>
        <input className={campo} placeholder={form.type === 'percent' ? 'Desconto (%)' : 'Desconto (R$)'} inputMode="decimal" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
        <input className={campo} placeholder="Pedido mínimo (R$)" inputMode="decimal" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} />
        <label className="text-[11px] text-zinc-400 flex flex-col gap-1">Válido a partir de<input type="date" className={campo} value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} /></label>
        <label className="text-[11px] text-zinc-400 flex flex-col gap-1">Válido até<input type="date" className={campo} value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} /></label>
        <input className={campo} placeholder="Limite de usos (vazio = sem limite)" inputMode="numeric" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} />
        {erro && <p className="sm:col-span-2 text-xs text-rose-400">{erro}</p>}
        <button type="submit" className="sm:col-span-2 py-2.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold rounded-xl">Criar cupom</button>
      </form>

      <div className="space-y-2">
        <h3 className="text-sm font-extrabold text-white">Cupons cadastrados</h3>
        {coupons.length === 0 && <p className="text-xs text-zinc-500">Nenhum cupom ainda.</p>}
        {coupons.map((c) => (
          <div key={c.id} className="bg-[#0f1d3b] border border-zinc-800 rounded-xl p-4 flex flex-wrap items-center gap-3 justify-between">
            <div className="min-w-0">
              <p className="font-mono font-bold text-amber-300">{c.code}</p>
              <p className="text-[11px] text-zinc-400">
                {c.type === 'percent' ? `${c.value}%` : `R$ ${c.value.toFixed(2).replace('.', ',')}`}
                {c.minOrder > 0 && ` · mínimo R$ ${c.minOrder.toFixed(2).replace('.', ',')}`}
                {c.validUntil && ` · até ${c.validUntil}`}
                {` · usos ${c.uses}${c.maxUses ? `/${c.maxUses}` : ''}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateCoupon(c.id, { active: !c.active })} className={`px-3 py-1.5 text-[11px] font-bold rounded-lg ${c.active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-800 text-zinc-400'}`}>
                {c.active ? 'Ativo' : 'Inativo'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
