import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductSize } from '../../types';
import { Star, CheckCircle, ThumbsUp, MessageSquarePlus, X, Send } from 'lucide-react';

interface CustomerReviewsSectionProps {
  product: Product;
}

export const CustomerReviewsSection: React.FC<CustomerReviewsSectionProps> = ({ product }) => {
  const { getProductReviews, getProductRating, addReview } = useStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [author, setAuthor] = useState('');
  const [purchasedSize, setPurchasedSize] = useState<ProductSize>('G');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [recommends, setRecommends] = useState(true);

  const reviews = getProductReviews(product.id);
  const { average, count } = getProductRating(product.id);

  // Distribution
  const countsByStar = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    total: reviews.filter((r) => r.rating === s).length
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !comment.trim()) return;

    addReview({
      productId: product.id,
      author: author.trim(),
      rating,
      title: title.trim() || 'Ótima qualidade',
      comment: comment.trim(),
      purchasedSize,
      recommends,
      isVerifiedPurchase: true
    });

    setIsFormOpen(false);
    setAuthor('');
    setTitle('');
    setComment('');
  };

  return (
    <div className="space-y-4 pt-2 border-t border-zinc-800/80">
      {/* Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="text-3xl font-black text-amber-400 tabular-nums">
            {count > 0 ? average.toFixed(1) : '5.0'}
          </div>
          <div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(average)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-zinc-600'
                  }`}
                />
              ))}
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {count > 0
                ? `${count} ${count === 1 ? 'avaliação de cliente' : 'avaliações verificadas'}`
                : '100% de satisfação dos compradores'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-amber-300 border border-zinc-700/80 hover:border-amber-400/50 text-xs font-bold flex items-center gap-2 self-start sm:self-auto transition-all"
        >
          <MessageSquarePlus className="w-3.5 h-3.5" />
          <span>{isFormOpen ? 'Cancelar Avaliação' : 'Avaliar este Produto'}</span>
        </button>
      </div>

      {/* Rating Breakdown Bars */}
      <div className="space-y-1.5 p-3 bg-zinc-900/60 border border-zinc-800 rounded-2xl">
        {countsByStar.map(({ star, total }) => {
          const percent = count > 0 ? (total / count) * 100 : star === 5 ? 100 : 0;
          return (
            <div key={star} className="flex items-center gap-2 text-[10px] text-zinc-400">
              <span className="w-6 tabular-nums">{star} ★</span>
              <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="w-6 text-right tabular-nums text-zinc-500">{total}</span>
            </div>
          );
        })}
      </div>

      {/* Review Submission Form Modal / Card */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="p-4 bg-zinc-900/90 border border-amber-400/40 rounded-2xl space-y-3 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              Sua Avaliação para {product.name}
            </h4>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-zinc-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Star selector */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
              Nota geral:
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${
                      s <= (hoverRating || rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-zinc-600'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-amber-400 ml-2">
                {rating === 5
                  ? 'Excelente!'
                  : rating === 4
                  ? 'Muito bom'
                  : rating === 3
                  ? 'Bom'
                  : 'Regular'}
              </span>
            </div>
          </div>

          {/* Name & Purchased Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                Seu Nome:
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Ex: Carlos Andrade"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                Tamanho Comprado:
              </label>
              <select
                value={purchasedSize}
                onChange={(e) => setPurchasedSize(e.target.value as ProductSize)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              >
                {product.sizes.map((s) => (
                  <option key={s} value={s}>
                    Tamanho {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title & Comment */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
              Título da avaliação:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Caimento perfeito e tecido muito confortável"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
              Comentário / Detalhes do Caimento:
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte como a peça ficou no corpo, acabamento dos tecidos e sua experiência com a entrega..."
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          {/* Recommends checkbox */}
          <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs text-zinc-300">
            <input
              type="checkbox"
              checked={recommends}
              onChange={(e) => setRecommends(e.target.checked)}
              className="rounded accent-amber-400"
            />
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-3.5 h-3.5 text-amber-400" />
              Recomendo este produto para outros compradores
            </span>
          </label>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md mt-2"
          >
            <Send className="w-3.5 h-3.5" />
            Publicar Avaliação
          </button>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl text-center text-xs text-zinc-400">
            Seja o primeiro a avaliar esta peça e ajude outros compradores!
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-3.5 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{rev.author}</span>
                  {rev.isVerifiedPurchase && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle className="w-3 h-3" />
                      Compra Verificada
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3 h-3 ${
                        s <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                <span>Comprou Tam: <strong className="text-zinc-300">{rev.purchasedSize}</strong></span>
                {rev.recommends && (
                  <>
                    <span>·</span>
                    <span className="text-amber-400/90 flex items-center gap-1">
                      <ThumbsUp className="w-2.5 h-2.5" /> Recomenda o produto
                    </span>
                  </>
                )}
              </div>

              {rev.title && (
                <h5 className="text-xs font-semibold text-zinc-200">{rev.title}</h5>
              )}

              <p className="text-xs text-zinc-400 leading-relaxed">{rev.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
