import React from 'react';
import { useStore } from '../../context/StoreContext';
import { History, X, Eye } from 'lucide-react';

export const RecentlyViewedSection: React.FC = () => {
  const {
    recentlyViewedProducts,
    setSelectedProduct,
    clearRecentlyViewed
  } = useStore();

  if (recentlyViewedProducts.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-zinc-800/80">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-amber-400">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Vistos Recentemente por Você
            </h3>
            <p className="text-[11px] text-zinc-400">
              Retorne rapidamente às peças que você navegou nesta sessão
            </p>
          </div>
        </div>

        <button
          onClick={clearRecentlyViewed}
          className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
        >
          <X className="w-3 h-3" />
          Limpar histórico
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {recentlyViewedProducts.map((product) => {
          const effectivePrice =
            product.isPromo && product.promoPrice ? product.promoPrice : product.price;

          return (
            <div
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className="w-36 sm:w-44 bg-[#141724] hover:bg-[#181c2b] border border-zinc-800/80 hover:border-amber-400/50 rounded-2xl p-2.5 shrink-0 cursor-pointer transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[4/3] rounded-xl bg-zinc-950 overflow-hidden mb-2 relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {product.isPromo && (
                    <span className="absolute top-1 left-1 bg-amber-400 text-black text-[9px] font-extrabold px-1 rounded">
                      PROMO
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                  {product.name}
                </h4>
              </div>

              <div className="mt-2 pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                <span className="text-xs font-black text-amber-400 tabular-nums">
                  R$ {effectivePrice.toFixed(2).replace('.', ',')}
                </span>
                <span className="w-6 h-6 rounded-lg bg-zinc-900 group-hover:bg-amber-400 group-hover:text-black flex items-center justify-center text-zinc-400 transition-colors">
                  <Eye className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
