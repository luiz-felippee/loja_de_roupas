import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Sparkles, ArrowRight, Flame } from 'lucide-react';
import { Product } from '../../types';

export const PromoSlider: React.FC = () => {
  const { products, setSelectedProduct } = useStore();

  const promoProducts = products.filter((p) => p.isPromo && p.stock > 0);

  if (promoProducts.length === 0) return null;

  return (
    <section id="promocoes-section" className="py-10 bg-[#10131a] border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Promoções da Semana
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Desconto Ativo
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Peças selecionadas com valor especial por tempo limitado ou até durar o estoque.
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Horizontal Cards Area */}
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-thin">
          {promoProducts.map((product: Product) => {
            const discountPct = product.promoPrice
              ? Math.round(((product.price - product.promoPrice) / product.price) * 100)
              : 0;

            return (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className="min-w-[270px] sm:min-w-[310px] bg-[#161922] hover:bg-[#1a1f2b] rounded-2xl border border-zinc-800 hover:border-amber-500/40 p-3.5 transition-all cursor-pointer group flex flex-col justify-between snap-start shadow-md hover:shadow-xl hover:shadow-amber-500/5"
              >
                <div>
                  {/* Photo Container */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-950 mb-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Discount Tag */}
                    <div className="absolute top-2.5 left-2.5 bg-amber-500 text-black font-extrabold text-xs px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      -{discountPct}% OFF
                    </div>

                    {/* Stock pill */}
                    <div className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-sm text-zinc-200 text-[11px] font-medium px-2 py-0.5 rounded border border-white/10">
                      {product.stock} em estoque
                    </div>
                  </div>

                  {/* Clean unboxed metadata */}
                  <div className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider mb-1">
                    {product.category === 'times' ? 'Camisa de Time' : product.category === 'polo' ? 'Polo Premium' : product.category === 'bermuda' ? 'Bermuda' : 'Regata'}
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug min-h-[2.5rem]">
                    {product.name}
                  </h3>

                  {/* Color Swatches preview */}
                  <div className="flex items-center gap-1.5 mt-2">
                    {product.colors.map((c, idx) => (
                      <span
                        key={idx}
                        className="w-3.5 h-3.5 rounded-full border border-zinc-700/80 shadow-sm"
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                    <span className="text-[11px] text-zinc-500 ml-1">
                      {product.colors.length} {product.colors.length > 1 ? 'cores' : 'cor'}
                    </span>
                  </div>
                </div>

                {/* Price and CTA */}
                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-500 line-through tabular-nums block">
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-base font-extrabold text-amber-400 tabular-nums">
                      R$ {(product.promoPrice ?? product.price).toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProduct(product);
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1 group-hover:translate-x-0.5"
                  >
                    Ver Cores
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
