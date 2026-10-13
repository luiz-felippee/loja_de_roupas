import React from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { ShoppingBag, Eye, Scale, Check, Heart, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    setSelectedProduct,
    isProductInComparison,
    toggleProductComparison,
    isInWishlist,
    toggleWishlist,
    getProductRating
  } = useStore();

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const effectivePrice = product.isPromo && product.promoPrice ? product.promoPrice : product.price;
  const isInComparison = isProductInComparison(product.id);
  const isFavorited = isInWishlist(product.id);
  const ratingInfo = getProductRating(product.id);

  const categoryLabels: Record<string, string> = {
    times: 'Camisa de Time',
    polo: 'Camisa Polo',
    bermuda: 'Bermuda',
    regata: 'Camisa Regata'
  };

  return (
    <div
      onClick={() => setSelectedProduct(product)}
      className={`group bg-[#151821] hover:bg-[#191d28] rounded-xl sm:rounded-2xl border p-3 sm:p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-md hover:shadow-xl ${
        isInComparison
          ? 'border-amber-400 ring-1 ring-amber-400/40 shadow-amber-500/10'
          : 'border-zinc-800/90 hover:border-amber-500/50 hover:shadow-amber-500/5'
      }`}
    >
      <div>
        {/* Product Image 4:3 */}
        <div className="relative aspect-[4/3] rounded-lg sm:rounded-xl overflow-hidden bg-zinc-950 mb-2.5 sm:mb-3.5">
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
              isOutOfStock ? 'grayscale opacity-60' : ''
            }`}
          />

          {/* Quick status overlays */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isPromo && (
              <span className="bg-amber-400 text-black text-[10px] sm:text-[11px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded shadow">
                PROMO
              </span>
            )}
            {isOutOfStock ? (
              <span className="bg-rose-500 text-white text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded shadow">
                ESGOTADO
              </span>
            ) : isLowStock ? (
              <span className="bg-amber-500/90 text-black text-[10px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded shadow">
                Últimas {product.stock}
              </span>
            ) : null}
          </div>

          {/* Action buttons (Wishlist & Compare) */}
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
            {/* Wishlist Heart Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(product);
              }}
              className={`p-1.5 rounded-lg border transition-all flex items-center justify-center shadow-md ${
                isFavorited
                  ? 'bg-rose-500/90 text-white border-rose-400 scale-105 shadow-rose-500/20'
                  : 'bg-black/75 hover:bg-black text-zinc-300 hover:text-rose-400 border-zinc-700/80 hover:border-rose-400/60'
              }`}
              title={isFavorited ? 'Remover dos favoritos' : 'Salvar na lista de desejos'}
              aria-label={`Favoritar ${product.name}`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  isFavorited ? 'fill-white text-white' : ''
                }`}
              />
            </button>

            {/* Compare Toggle Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleProductComparison(product);
              }}
              className={`px-2 py-1 rounded-lg text-[11px] sm:text-[11px] font-bold border transition-all flex items-center gap-1 shadow-md ${
                isInComparison
                  ? 'bg-amber-400 text-black border-amber-300 ring-2 ring-amber-400/50 scale-105'
                  : 'bg-black/75 hover:bg-black text-zinc-300 hover:text-white border-zinc-700/80 hover:border-amber-400/60'
              }`}
              title={
                isInComparison
                  ? 'Remover da comparação'
                  : 'Selecionar para comparar especificações (até 3 peças)'
              }
              aria-label={`Comparar ${product.name}`}
            >
              {isInComparison ? (
                <>
                  <Check className="w-3 h-3 text-black stroke-[3]" />
                  <span className="hidden sm:inline">Comparando</span>
                </>
              ) : (
                <>
                  <Scale className="w-3 h-3 text-amber-400" />
                  <span className="hidden sm:inline">Comparar</span>
                </>
              )}
            </button>
          </div>

          {/* Quick View Hover Button */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center p-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedProduct(product);
              }}
              className="bg-zinc-900/90 text-amber-300 border border-amber-400/40 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all hover:bg-black"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              Ver Opções
            </button>
          </div>
        </div>

        {/* Unboxed Metadata with · separator & Star rating */}
        <div className="flex items-center justify-between text-[11px] sm:text-[11px] text-zinc-400 font-medium uppercase tracking-wider mb-1">
          <div className="flex items-center gap-1 truncate">
            <span>{categoryLabels[product.category] || product.category}</span>
            <span aria-hidden="true">·</span>
            <span>{product.stock} un.</span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 shrink-0 text-amber-400 font-bold lowercase">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="tabular-nums">
              {ratingInfo.count > 0 ? ratingInfo.average.toFixed(1) : '5.0'}
            </span>
            {ratingInfo.count > 0 && (
              <span className="text-zinc-500 text-[10px]">({ratingInfo.count})</span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors leading-snug line-clamp-2">
          {product.name}
        </h3>

        {/* Color swatches preview */}
        <div className="flex items-center gap-1 sm:gap-1.5 mt-2">
          {product.colors.slice(0, 4).map((color, idx) => (
            <div
              key={idx}
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border border-zinc-700 shadow-inner shrink-0"
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
          <span className="text-[11px] sm:text-[11px] text-zinc-500 ml-0.5 truncate">
            {product.colors.length} {product.colors.length > 1 ? 'cores' : 'cor'}
          </span>
        </div>

        {/* Sizes indicators */}
        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
          <span className="text-[10px] sm:text-[10px] text-zinc-500 mr-0.5 uppercase">Tam:</span>
          {product.sizes.map((sz) => (
            <span
              key={sz}
              className="text-[10px] sm:text-[10px] font-semibold text-zinc-300 bg-zinc-900 border border-zinc-800 px-1 sm:px-1.5 py-0.2 rounded"
            >
              {sz}
            </span>
          ))}
        </div>
      </div>

      {/* Footer with Price and Add Button */}
      <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-1">
        <div className="min-w-0">
          {product.isPromo && product.promoPrice && (
            <span className="text-[11px] sm:text-[11px] text-zinc-500 line-through tabular-nums block truncate">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
          )}
          <span className="text-base sm:text-lg font-black text-amber-400 tabular-nums truncate block">
            R$ {effectivePrice.toFixed(2).replace('.', ',')}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedProduct(product);
          }}
          disabled={isOutOfStock}
          className={`p-2 sm:p-2.5 rounded-xl border transition-all flex items-center justify-center shrink-0 min-h-[36px] min-w-[36px] ${
            isOutOfStock
              ? 'bg-zinc-800 text-zinc-600 border-zinc-800 cursor-not-allowed'
              : 'bg-zinc-900 text-amber-400 border-zinc-700 hover:border-amber-400 hover:bg-amber-400 hover:text-black shadow-sm'
          }`}
          aria-label="Escolher opções e comprar"
        >
          <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
};
