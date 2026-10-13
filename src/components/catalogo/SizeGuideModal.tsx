import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { SIZE_CHARTS } from '../../utils/fittingAndSizes';
import { ProductCategory, ProductSize } from '../../types';
import { Ruler, X, Sparkles, CheckCircle2 } from 'lucide-react';

export const SizeGuideModal: React.FC = () => {
  const {
    isSizeGuideOpen,
    setIsSizeGuideOpen,
    openVirtualFitting,
    selectedProduct
  } = useStore();

  const [activeCategory, setActiveCategory] = useState<ProductCategory>(
    selectedProduct?.category || 'times'
  );

  if (!isSizeGuideOpen) return null;

  const categoryLabels: Record<ProductCategory, string> = {
    times: 'Camisas de Times',
    polo: 'Camisas Polo',
    bermuda: 'Bermudas',
    regata: 'Camisas Regatas'
  };

  const chart = SIZE_CHARTS[activeCategory];
  const sizes: ProductSize[] = ['P', 'M', 'G', 'GG'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-[#131622] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800/80 bg-[#161a29] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Guia de Medidas & Tamanhos
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Tabela oficial padrão brasileiro com medidas reais da peça em centímetros
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSizeGuideOpen(false)}
            className="w-9 h-9 rounded-full bg-zinc-800/80 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            aria-label="Fechar guia de medidas"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {(['times', 'polo', 'bermuda', 'regata'] as ProductCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  activeCategory === cat
                    ? 'bg-amber-400 text-black border-amber-300 shadow-md'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                }`}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>

          {/* Size Measurements Table */}
          <div className="overflow-x-auto border border-zinc-800 rounded-2xl bg-zinc-950/60">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400 font-bold">
                  <th className="p-3 text-white">Tamanho</th>
                  {activeCategory !== 'bermuda' && <th className="p-3">Tórax / Peito</th>}
                  <th className="p-3">Comprimento</th>
                  <th className="p-3">Cintura</th>
                  <th className="p-3">
                    {activeCategory === 'bermuda' ? 'Comprimento Perna' : activeCategory === 'regata' ? 'Cava' : 'Manga'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {sizes.map((s) => {
                  const m = chart[s];
                  return (
                    <tr key={s} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="p-3 font-extrabold text-amber-400">{s}</td>
                      {activeCategory !== 'bermuda' && <td className="p-3">{m.chest}</td>}
                      <td className="p-3">{m.length}</td>
                      <td className="p-3">{m.waist}</td>
                      <td className="p-3">{m.sleeveOrInseam || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* How to Measure Tips */}
          <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5 text-amber-400">
              <CheckCircle2 className="w-4 h-4" />
              Como medir uma peça que você já tem em casa:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] text-zinc-400 pt-1">
              <div className="p-2.5 bg-zinc-950/40 rounded-xl border border-zinc-800/80">
                <strong className="text-zinc-200 block mb-0.5">1. Tórax / Largura</strong>
                Meça em linha reta de uma axila à outra em uma superfície plana.
              </div>
              <div className="p-2.5 bg-zinc-950/40 rounded-xl border border-zinc-800/80">
                <strong className="text-zinc-200 block mb-0.5">2. Comprimento</strong>
                Meça do ponto mais alto do ombro (junto à gola) até a barra inferior.
              </div>
              <div className="p-2.5 bg-zinc-950/40 rounded-xl border border-zinc-800/80">
                <strong className="text-zinc-200 block mb-0.5">3. Cintura / Gancho</strong>
                Para bermudas, meça o cós sem esticar o elástico e a altura do cavalo.
              </div>
            </div>
          </div>

          {/* Prompt to try Virtual Fitting */}
          <div className="p-4 bg-gradient-to-r from-amber-500/10 to-zinc-900 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Prefere não medir com fita métrica?
              </h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Nosso Provador Virtual calcula o tamanho ideal baseado apenas em sua altura e peso.
              </p>
            </div>
            <button
              onClick={() => {
                setIsSizeGuideOpen(false);
                openVirtualFitting(selectedProduct || undefined);
              }}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs rounded-xl transition-all whitespace-nowrap shadow-md"
            >
              Abrir Provador Virtual
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
