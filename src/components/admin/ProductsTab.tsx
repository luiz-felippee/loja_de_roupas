import React, { useMemo, useState } from 'react';
import { Plus, Pencil, EyeOff, Minus, Search } from 'lucide-react';
import type { AdminState } from './useAdminPanel';
import type { Product } from '../../types';
import { CATEGORIES_LABEL } from './categorias';

type Situacao = 'todos' | 'esgotados' | 'baixo' | 'em_dia';

const reais = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

function statusEstoque(estoque: number): { rotulo: string; classe: string; situacao: Situacao } {
  if (estoque <= 0) return { rotulo: 'Esgotado', classe: 'bg-rose-500/15 text-rose-300 border-rose-500/30', situacao: 'esgotados' };
  if (estoque <= 5) return { rotulo: 'Estoque baixo', classe: 'bg-amber-400/15 text-amber-300 border-amber-400/30', situacao: 'baixo' };
  return { rotulo: 'Em dia', classe: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', situacao: 'em_dia' };
}

/** Catalogo e estoque: indicadores, busca, filtro por situacao e ajuste direto da quantidade. */
export function ProductsTab({ a }: { a: AdminState }) {
  const { deleteProduct, handleOpenEditProduct, handleOpenNewProduct, products, updateProduct, updateStock } = a;
  const [busca, setBusca] = useState('');
  const [situacao, setSituacao] = useState<Situacao>('todos');

  const indicadores = useMemo(() => {
    const ativos = products.filter((p) => (p as Product & { active?: boolean }).active !== false);
    return {
      ativos: ativos.length,
      unidades: ativos.reduce((s, p) => s + p.stock, 0),
      esgotados: ativos.filter((p) => p.stock <= 0).length,
      baixos: ativos.filter((p) => p.stock > 0 && p.stock <= 5).length,
    };
  }, [products]);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return products
      .filter((p) => !termo || p.name.toLowerCase().includes(termo))
      .filter((p) => situacao === 'todos' || statusEstoque(p.stock).situacao === situacao)
      .sort((x, y) => x.name.localeCompare(y.name));
  }, [products, busca, situacao]);

  const abas: { id: Situacao; rotulo: string; total: number }[] = [
    { id: 'todos', rotulo: 'Todos', total: products.length },
    { id: 'esgotados', rotulo: 'Esgotados', total: indicadores.esgotados },
    { id: 'baixo', rotulo: 'Estoque baixo', total: indicadores.baixos },
    { id: 'em_dia', rotulo: 'Em dia', total: products.length - indicadores.esgotados - indicadores.baixos },
  ];

  const kpis = [
    { rotulo: 'Produtos ativos', valor: indicadores.ativos },
    { rotulo: 'Unidades em estoque', valor: indicadores.unidades },
    { rotulo: 'Esgotados', valor: indicadores.esgotados, alerta: indicadores.esgotados > 0 ? 'rose' : undefined },
    { rotulo: 'Estoque baixo', valor: indicadores.baixos, alerta: indicadores.baixos > 0 ? 'amber' : undefined },
  ];

  const ajustarEstoque = (produto: Product, novo: number) => {
    if (!Number.isInteger(novo) || novo < 0 || novo === produto.stock) return;
    updateProduct(produto.id, { stock: novo });
  };

  return (
    <div className="space-y-6">
      {/* Cabecalho */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Catálogo e estoque</h2>
          <p className="text-sm text-zinc-400 mt-1">Cadastre peças, ajuste quantidades e acompanhe o que precisa de reposição.</p>
        </div>
        <button
          onClick={handleOpenNewProduct}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-sm font-bold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo produto
        </button>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <div key={k.rotulo} className="rounded-2xl border border-zinc-800 bg-[#0f1d3b] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{k.rotulo}</p>
            <p
              className={`mt-2 text-2xl font-black tabular-nums ${
                k.alerta === 'rose' ? 'text-rose-300' : k.alerta === 'amber' ? 'text-amber-300' : 'text-white'
              }`}
            >
              {k.valor}
            </p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="rounded-2xl border border-zinc-800 bg-[#0f1d3b] p-3 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {abas.map((aba) => (
            <button
              key={aba.id}
              onClick={() => setSituacao(aba.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                situacao === aba.id
                  ? 'bg-white text-black border-white'
                  : 'border-zinc-700 text-zinc-300 hover:border-zinc-500'
              }`}
            >
              {aba.rotulo} <span className="tabular-nums opacity-70">{aba.total}</span>
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar produto pelo nome"
            className="w-full bg-[#0a1528] border border-zinc-800 focus:border-amber-400/60 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Tabela (desktop e tablet) */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-zinc-800 bg-[#0f1d3b]">
        <table className="w-full text-sm">
          <thead className="bg-[#0a1528] text-left text-[11px] uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Produto</th>
              <th className="px-4 py-3 font-semibold">Preço</th>
              <th className="px-4 py-3 font-semibold">Estoque</th>
              <th className="px-4 py-3 font-semibold">Situação</th>
              <th className="px-4 py-3 text-right font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filtrados.map((p) => {
              const st = statusEstoque(p.stock);
              const inativo = (p as Product & { active?: boolean }).active === false;
              return (
                <tr key={p.id} className={inativo ? 'opacity-50' : 'hover:bg-[#142a52]/40'}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-[#0a1528]">
                        {p.image && <img src={p.image} alt="" className="h-full w-full object-cover" loading="lazy" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{p.name}</p>
                        <p className="text-xs text-zinc-500">
                          {CATEGORIES_LABEL[p.category] ?? p.category} · {p.colors.length} cor(es) · {p.sizes.join(', ')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {p.isPromo && p.promoPrice ? (
                      <div>
                        <span className="font-bold text-amber-300">{reais(p.promoPrice)}</span>
                        <span className="ml-2 text-xs text-zinc-500 line-through">{reais(p.price)}</span>
                      </div>
                    ) : (
                      <span className="text-white">{reais(p.price)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="inline-flex items-center rounded-lg border border-zinc-700 bg-[#0a1528]">
                      <button
                        onClick={() => updateStock(p.id, -1)}
                        disabled={p.stock <= 0}
                        className="px-2 py-1.5 text-zinc-300 hover:text-white disabled:opacity-30"
                        aria-label={`Diminuir estoque de ${p.name}`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        key={`${p.id}-${p.stock}`}
                        defaultValue={p.stock}
                        inputMode="numeric"
                        onBlur={(e) => ajustarEstoque(p, Number(e.target.value))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                        }}
                        className="w-14 bg-transparent text-center font-bold tabular-nums text-white focus:outline-none"
                        aria-label={`Quantidade de ${p.name}`}
                      />
                      <button
                        onClick={() => updateStock(p.id, 1)}
                        className="px-2 py-1.5 text-zinc-300 hover:text-white"
                        aria-label={`Aumentar estoque de ${p.name}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {inativo ? (
                      <span className="rounded-md border border-zinc-700 px-2 py-1 text-[11px] font-bold text-zinc-400">Desativado</span>
                    ) : (
                      <span className={`rounded-md border px-2 py-1 text-[11px] font-bold ${st.classe}`}>{st.rotulo}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEditProduct(p)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-[#142a52] hover:text-white"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Editar
                      </button>
                      {!inativo && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Desativar "${p.name}"? Ele some da vitrine, mas o histórico de pedidos continua.`)) deleteProduct(p.id);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-400 hover:bg-[#142a52] hover:text-rose-300"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                          Desativar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtrados.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-zinc-500">Nenhum produto encontrado com esses filtros.</p>
        )}
      </div>

      {/* Lista (celular) */}
      <div className="md:hidden space-y-3">
        {filtrados.map((p) => {
          const st = statusEstoque(p.stock);
          const inativo = (p as Product & { active?: boolean }).active === false;
          return (
            <div key={p.id} className={`rounded-2xl border border-zinc-800 bg-[#0f1d3b] p-4 space-y-3 ${inativo ? 'opacity-50' : ''}`}>
              <div className="flex gap-3">
                <div className="h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-[#0a1528]">
                  {p.image && <img src={p.image} alt="" className="h-full w-full object-cover" loading="lazy" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white leading-snug">{p.name}</p>
                  <p className="text-xs text-zinc-500">{CATEGORIES_LABEL[p.category] ?? p.category}</p>
                  <p className="mt-1 text-sm font-bold text-white tabular-nums">{reais(p.isPromo && p.promoPrice ? p.promoPrice : p.price)}</p>
                </div>
                {!inativo && (
                  <span className={`h-fit shrink-0 rounded-md border px-2 py-1 text-[10px] font-bold ${st.classe}`}>{st.rotulo}</span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center rounded-lg border border-zinc-700 bg-[#0a1528]">
                  <button onClick={() => updateStock(p.id, -1)} disabled={p.stock <= 0} className="px-3 py-2 text-zinc-300 disabled:opacity-30" aria-label="Diminuir estoque">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="min-w-10 text-center font-bold tabular-nums text-white">{p.stock}</span>
                  <button onClick={() => updateStock(p.id, 1)} className="px-3 py-2 text-zinc-300" aria-label="Aumentar estoque">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenEditProduct(p)} className="rounded-lg px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-[#142a52]">Editar</button>
                  {!inativo && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Desativar "${p.name}"?`)) deleteProduct(p.id);
                      }}
                      className="rounded-lg px-3 py-2 text-xs font-semibold text-zinc-400 hover:bg-[#142a52] hover:text-rose-300"
                    >
                      Desativar
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtrados.length === 0 && <p className="py-10 text-center text-sm text-zinc-500">Nenhum produto encontrado com esses filtros.</p>}
      </div>
    </div>
  );
}
