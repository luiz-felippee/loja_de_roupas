import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Scale, X, ArrowRight, Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';

export const ProductComparisonBar: React.FC = () => {
  const {
    comparedProducts,
    removeFromComparison,
    clearComparison,
    setIsComparisonModalOpen
  } = useStore();

  const [isMinimized, setIsMinimized] = useState(false);

  if (comparedProducts.length === 0) return null;

  const maxSlots = 3;
  const emptySlotsCount = Math.max(0, maxSlots - comparedProducts.length);

  return (
    <aside
      aria-label="Barra de comparação de produtos"
      className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl transition-all duration-300"
    >
      <div className="bg-[#10131d]/95 backdrop-blur-xl border border-amber-500/40 shadow-2xl shadow-black/90 rounded-2xl p-2.5 sm:p-3.5 ring-1 ring-amber-400/20">
        {/* Minimized Pill View */}
        {isMinimized ? (
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setIsComparisonModalOpen(true)}
              className="flex items-center gap-2 text-left flex-1 hover:opacity-90 transition-opacity"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black shadow-md shadow-amber-500/20">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  Comparador de Peças ({comparedProducts.length}/3)
                </span>
                <span className="text-[10px] text-zinc-400 block truncate">
                  {comparedProducts.map((p) => p.name).join(' vs ')}
                </span>
              </div>
            </button>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setIsComparisonModalOpen(true)}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center gap-1"
              >
                <span>Ver</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                title="Expandir barra de comparação"
                aria-label="Expandir barra de comparação"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Full Expanded Floating Dock */
          <div>
            {/* Top header row */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
                  <Scale className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-white tracking-tight">
                  Comparador de Produtos
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400/15 text-amber-300 border border-amber-400/30">
                  {comparedProducts.length} de 3 selecionados
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={clearComparison}
                  className="text-[11px] text-zinc-400 hover:text-rose-400 transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-500/10"
                  title="Limpar seleção de comparação"
                >
                  <Trash2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Limpar</span>
                </button>
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                  title="Minimizar barra"
                  aria-label="Minimizar barra"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slots and CTA Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Product Thumbnail Slots */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {comparedProducts.map((prod, idx) => {
                  const effectivePrice = prod.isPromo && prod.promoPrice ? prod.promoPrice : prod.price;
                  return (
                    <div
                      key={prod.id}
                      className="group relative flex items-center gap-2 bg-[#0f1d3b] hover:bg-[#1d2233] border border-zinc-700/80 hover:border-amber-400/40 rounded-xl p-1.5 pr-2.5 transition-all max-w-[170px] sm:max-w-[185px] shrink-0"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#0a1528] shrink-0 relative">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-0.5 left-0.5 bg-black/80 text-amber-400 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                          {idx + 1}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-white truncate leading-tight">
                          {prod.name}
                        </p>
                        <p className="text-[10px] font-extrabold text-amber-400 tabular-nums">
                          R$ {effectivePrice.toFixed(2).replace('.', ',')}
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromComparison(prod.id);
                        }}
                        className="w-5 h-5 rounded-full bg-zinc-800 hover:bg-rose-600 text-zinc-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
                        title="Remover peça da comparação"
                        aria-label={`Remover ${prod.name} da comparação`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}

                {/* Empty invitation slots up to 3 */}
                {Array.from({ length: emptySlotsCount }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="flex items-center gap-1.5 border border-dashed border-zinc-750 rounded-xl p-2 px-3 text-zinc-500 bg-zinc-900/40 shrink-0 text-center"
                  >
                    <Plus className="w-3.5 h-3.5 text-zinc-600" />
                    <span className="text-[10px] font-medium whitespace-nowrap">
                      {comparedProducts.length === 0
                        ? 'Selecione peça'
                        : `Slot ${comparedProducts.length + i + 1} livre`}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Button: Open Comparison Modal */}
              <div className="shrink-0 flex items-center gap-2">
                <button
                  onClick={() => setIsComparisonModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap"
                >
                  <Scale className="w-4 h-4 text-black" />
                  <span>
                    {comparedProducts.length === 1
                      ? 'Visualizar Especificações'
                      : `Comparar ${comparedProducts.length} Peças Lado a Lado`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-black" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
