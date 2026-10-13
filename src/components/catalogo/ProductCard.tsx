import React from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Heart, Scale, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const CATEGORIAS: Record<string, string> = {
  times: 'Camisa de time',
  polo: 'Camisa polo',
  bermuda: 'Bermuda',
  regata: 'Camisa regata',
};

const reais = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

/** Cartao de produto: foto, nome, preco e uma acao principal. Sem excesso de botoes sobre a imagem. */
export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    setSelectedProduct,
    isProductInComparison,
    toggleProductComparison,
    isInWishlist,
    toggleWishlist,
    getProductRating,
  } = useStore();

  const esgotado = product.stock <= 0;
  const poucasUnidades = !esgotado && product.stock <= 5;
  const emPromocao = product.isPromo && !!product.promoPrice;
  const precoAtual = emPromocao ? product.promoPrice! : product.price;
  const comparando = isProductInComparison(product.id);
  const favorito = isInWishlist(product.id);
  const avaliacao = getProductRating(product.id);

  const abrir = () => setSelectedProduct(product);

  return (
    <article
      onClick={abrir}
      className={`group relative flex flex-col h-full cursor-pointer rounded-2xl bg-[#0f1d3b] border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 ${
        comparando ? 'border-amber-400/70' : 'border-zinc-800 hover:border-zinc-700'
      }`}
    >
      {/* Foto */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-2xl bg-[#0a1528]">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
              esgotado ? 'grayscale opacity-50' : ''
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
            Sem foto
          </div>
        )}

        {/* Um selo por vez, do mais importante para o menos */}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {esgotado ? (
            <span className="rounded-md bg-zinc-900/90 px-2 py-1 text-[11px] font-bold text-zinc-200">Esgotado</span>
          ) : emPromocao ? (
            <span className="rounded-md bg-amber-400 px-2 py-1 text-[11px] font-extrabold text-black">Promoção</span>
          ) : poucasUnidades ? (
            <span className="rounded-md bg-zinc-900/90 px-2 py-1 text-[11px] font-bold text-amber-300">
              Restam {product.stock}
            </span>
          ) : null}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
            favorito
              ? 'border-rose-400 bg-rose-500 text-white'
              : 'border-zinc-700 bg-[#0a1528]/80 text-zinc-300 hover:text-rose-300'
          }`}
          aria-label={favorito ? `Remover ${product.name} dos favoritos` : `Favoritar ${product.name}`}
          aria-pressed={favorito}
        >
          <Heart className={`h-4 w-4 ${favorito ? 'fill-white' : ''}`} />
        </button>
      </div>

      {/* Informacoes */}
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          {CATEGORIAS[product.category] ?? product.category}
        </p>
        <h3 className="mt-1 line-clamp-2 min-h-[2.75rem] text-[15px] font-bold leading-snug text-white transition-colors group-hover:text-amber-300">
          {product.name}
        </h3>

        {avaliacao.count > 0 && (
          <div className="mt-1.5 flex items-center gap-1 text-xs text-zinc-400">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-zinc-200 tabular-nums">{avaliacao.average.toFixed(1)}</span>
            <span className="text-zinc-500">({avaliacao.count})</span>
          </div>
        )}

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-black tabular-nums text-white">{reais(precoAtual)}</span>
          {emPromocao && (
            <span className="text-xs tabular-nums text-zinc-500 line-through">{reais(product.price)}</span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
          <span className="flex items-center gap-1.5">
            {product.colors.slice(0, 4).map((c) => (
              <span
                key={c.name}
                className="h-3 w-3 rounded-full border border-zinc-600"
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
            <span>{product.colors.length > 1 ? `${product.colors.length} cores` : product.colors[0]?.name}</span>
          </span>
          <span className="text-zinc-600" aria-hidden="true">·</span>
          <span>{product.sizes.join(' · ')}</span>
        </div>

        {/* Acoes */}
        <div className="mt-auto flex items-center gap-2 pt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              abrir();
            }}
            disabled={esgotado}
            className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors ${
              esgotado
                ? 'cursor-not-allowed bg-zinc-800 text-zinc-500'
                : 'bg-amber-400 text-black hover:bg-amber-300'
            }`}
          >
            {esgotado ? 'Indisponível' : 'Escolher tamanho'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleProductComparison(product);
            }}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
              comparando
                ? 'border-amber-400 bg-amber-400/15 text-amber-300'
                : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
            }`}
            aria-label={comparando ? `Remover ${product.name} da comparação` : `Comparar ${product.name}`}
            aria-pressed={comparando}
            title="Comparar (até 3 peças)"
          >
            <Scale className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
};
