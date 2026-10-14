import React from 'react';
import { useStore } from '../../context/StoreContext';

const reais = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

/** Promocoes em faixa horizontal. Cada cartao abre o produto. */
export const PromoSlider: React.FC = () => {
  const { products, setSelectedProduct } = useStore();
  const promocoes = products.filter((p) => p.isPromo && p.promoPrice && p.stock > 0);

  if (promocoes.length === 0) return null;

  return (
    <section id="promocoes-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Promoções</h2>
          <p className="text-sm text-zinc-400 mt-1">Peças com preço especial enquanto durar o estoque</p>
        </div>
      </div>

      <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 scrollbar-none">
        {promocoes.map((p) => {
          const desconto = Math.round(((p.price - (p.promoPrice ?? p.price)) / p.price) * 100);
          return (
            <button
              key={p.id}
              onClick={() => setSelectedProduct(p)}
              className="snap-start shrink-0 w-[70%] sm:w-72 text-left bg-[#0f1d3b] border border-zinc-800 hover:border-zinc-600 rounded-2xl overflow-hidden transition-colors group"
            >
              <div className="relative aspect-[4/3] bg-[#0f1118]">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" loading="lazy" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-amber-400 text-black text-xs font-extrabold">
                  -{desconto}%
                </span>
              </div>
              <div className="p-4">
                <p className="text-sm font-bold text-white leading-snug line-clamp-2 min-h-[2.5rem]">{p.name}</p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-lg font-black text-amber-300 tabular-nums">{reais(p.promoPrice ?? p.price)}</span>
                  <span className="text-xs text-zinc-500 line-through tabular-nums">{reais(p.price)}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
