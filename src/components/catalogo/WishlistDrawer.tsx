import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Heart, X, Trash2, ShoppingBag, ArrowRight, Share2, Eye } from 'lucide-react';

export const WishlistDrawer: React.FC = () => {
  const {
    isWishlistOpen,
    setIsWishlistOpen,
    wishlistProducts,
    toggleWishlist,
    clearWishlist,
    setSelectedProduct,
    addToCart,
    setIsCartOpen,
    addToast
  } = useStore();

  if (!isWishlistOpen) return null;

  const handleShareWhatsApp = () => {
    if (wishlistProducts.length === 0) return;
    const itemsList = wishlistProducts
      .map(
        (p) =>
          `• ${p.name} - R$ ${(p.isPromo && p.promoPrice ? p.promoPrice : p.price)
            .toFixed(2)
            .replace('.', ',')}`
      )
      .join('\n');

    const text = encodeURIComponent(
      `🔥 Minha Lista de Desejos na loja:\n\n${itemsList}\n\nConfira as peças disponíveis!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleAddAllToCart = () => {
    if (wishlistProducts.length === 0) return;
    let addedCount = 0;
    wishlistProducts.forEach((product) => {
      if (product.stock > 0) {
        addToCart(product, product.colors[0]?.name || 'Padrão', product.sizes[0] || 'M', 1);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      addToast(
        'Itens adicionados ao carrinho!',
        `${addedCount} peça(s) da sua lista de desejos foram para o carrinho.`,
        'success'
      );
      setIsWishlistOpen(false);
      setIsCartOpen(true);
    } else {
      addToast('Aviso', 'Nenhum dos itens favoritados possui estoque disponível.', 'warning');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={() => setIsWishlistOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#12151e] border-l border-zinc-800 text-white flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between bg-[#151924]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white leading-tight flex items-center gap-2">
                  Lista de Desejos
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-amber-400 border border-zinc-700">
                    {wishlistProducts.length}
                  </span>
                </h2>
                <p className="text-[11px] text-zinc-400">Suas peças salvas para comprar depois</p>
              </div>
            </div>

            <button
              onClick={() => setIsWishlistOpen(false)}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              aria-label="Fechar favoritos"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Bar (Share & Clear) */}
          {wishlistProducts.length > 0 && (
            <div className="px-5 py-2.5 bg-zinc-900/60 border-b border-zinc-800/60 flex items-center justify-between text-xs">
              <button
                onClick={handleShareWhatsApp}
                className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                Compartilhar Lista
              </button>
              <button
                onClick={clearWishlist}
                className="flex items-center gap-1 text-zinc-400 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpar Lista
              </button>
            </div>
          )}

          {/* Products List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3.5 divide-y divide-zinc-800/40">
            {wishlistProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
                <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 border border-zinc-700/60 flex items-center justify-center text-zinc-500 mb-4">
                  <Heart className="w-8 h-8 text-zinc-600" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">
                  Sua lista de desejos está vazia
                </h3>
                <p className="text-xs text-zinc-400 max-w-xs mb-6">
                  Navegue pelo catálogo e clique no ícone de coração para salvar suas peças favoritas e acompanhar promoções.
                </p>
                <button
                  onClick={() => setIsWishlistOpen(false)}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold rounded-xl transition-all shadow-md"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              wishlistProducts.map((product) => {
                const effectivePrice =
                  product.isPromo && product.promoPrice ? product.promoPrice : product.price;
                const isOutOfStock = product.stock <= 0;

                return (
                  <div key={product.id} className="pt-3.5 first:pt-0 flex gap-3.5 group">
                    {/* Thumbnail */}
                    <div
                      onClick={() => {
                        setSelectedProduct(product);
                        setIsWishlistOpen(false);
                      }}
                      className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-950 shrink-0 border border-zinc-800 cursor-pointer relative"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {product.isPromo && (
                        <span className="absolute top-1 left-1 bg-amber-400 text-black text-[9px] font-black px-1 rounded">
                          PROMO
                        </span>
                      )}
                    </div>

                    {/* Info & Actions */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsWishlistOpen(false);
                            }}
                            className="text-xs font-bold text-white hover:text-amber-400 transition-colors line-clamp-1 cursor-pointer"
                          >
                            {product.name}
                          </h4>
                          <button
                            onClick={() => toggleWishlist(product)}
                            className="text-zinc-500 hover:text-rose-400 p-1 -mr-1"
                            title="Remover dos favoritos"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-2 mt-0.5">
                          {product.isPromo && product.promoPrice && (
                            <span className="text-[10px] text-zinc-500 line-through">
                              R$ {product.price.toFixed(2).replace('.', ',')}
                            </span>
                          )}
                          <span className="text-sm font-extrabold text-amber-400">
                            R$ {effectivePrice.toFixed(2).replace('.', ',')}
                          </span>
                        </div>

                        {/* Sizes */}
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-zinc-400">
                          <span>Tam:</span>
                          {product.sizes.map((s) => (
                            <span
                              key={s}
                              className="px-1 py-0.2 bg-zinc-800 rounded border border-zinc-700 font-semibold"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Bottom actions */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => {
                            if (isOutOfStock) return;
                            addToCart(
                              product,
                              product.colors[0]?.name || 'Padrão',
                              product.sizes[0] || 'M',
                              1
                            );
                            addToast(
                              'Adicionado ao carrinho!',
                              `"${product.name}" foi adicionado com sucesso.`,
                              'success'
                            );
                          }}
                          disabled={isOutOfStock}
                          className={`flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 border transition-all ${
                            isOutOfStock
                              ? 'bg-zinc-800 text-zinc-500 border-zinc-800 cursor-not-allowed'
                              : 'bg-zinc-800 hover:bg-amber-400 hover:text-black text-amber-400 border-amber-400/40 hover:border-amber-400'
                          }`}
                        >
                          <ShoppingBag className="w-3 h-3" />
                          {isOutOfStock ? 'Esgotado' : 'Mover p/ Carrinho'}
                        </button>

                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsWishlistOpen(false);
                          }}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Action */}
          {wishlistProducts.length > 0 && (
            <div className="p-5 border-t border-zinc-800/80 bg-[#151924] space-y-2">
              <button
                onClick={handleAddAllToCart}
                className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                Adicionar Todas as Peças ao Carrinho
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
