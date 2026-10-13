import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductSize, ProductColor } from '../../types';
import { getProductSpecs } from '../../utils/productSpecs';
import { CustomerReviewsSection } from '../home/CustomerReviewsSection';
import { ShippingCalculatorWidget } from '../compra/ShippingCalculatorWidget';
import {
  X,
  Check,
  ShoppingBag,
  Truck,
  Store,
  ArrowRight,
  Scale,
  Layers,
  Heart,
  Star,
  Sparkles,
  Ruler,
  Share2
} from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProduct,
    setSelectedProduct,
    addToCart,
    setIsCartOpen,
    isProductInComparison,
    toggleProductComparison,
    setIsComparisonModalOpen,
    comparedProducts,
    isInWishlist,
    toggleWishlist,
    openVirtualFitting,
    setIsSizeGuideOpen,
    getProductRating,
    addToast
  } = useStore();

  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
  const [selectedSize, setSelectedSize] = useState<ProductSize>('M');
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews' | 'shipping'>('specs');

  useEffect(() => {
    if (selectedProduct) {
      setSelectedColor(selectedProduct.colors[0] || null);
      setSelectedSize(selectedProduct.sizes[0] || 'M');
      setQuantity(1);
      setAddedSuccess(false);
      setActiveTab('specs');
    }
  }, [selectedProduct]);

  if (!selectedProduct) return null;

  const isOutOfStock = selectedProduct.stock <= 0;
  const effectivePrice =
    selectedProduct.isPromo && selectedProduct.promoPrice
      ? selectedProduct.promoPrice
      : selectedProduct.price;

  const isFavorited = isInWishlist(selectedProduct.id);
  const ratingInfo = getProductRating(selectedProduct.id);
  const isInComparison = isProductInComparison(selectedProduct.id);
  const specs = getProductSpecs(selectedProduct);

  const handleAddToCart = () => {
    if (!selectedColor || isOutOfStock) return;
    addToCart(selectedProduct, selectedColor.name, selectedSize, quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  const handleBuyNow = () => {
    if (!selectedColor || isOutOfStock) return;
    addToCart(selectedProduct, selectedColor.name, selectedSize, quantity);
    setSelectedProduct(null);
    setIsCartOpen(true);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🔥 Olha essa peça que encontrei na loja:\n*${selectedProduct.name}*\nPor apenas *R$ ${effectivePrice
        .toFixed(2)
        .replace('.', ',')}*\nConfira na loja!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast('Link copiado!', 'Link do produto copiado para a área de transferência.', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-3xl bg-[#14161f] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-4 sm:my-8 max-h-[92vh] flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Floating Controls */}
        <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
          {/* Wishlist Button */}
          <button
            onClick={() => toggleWishlist(selectedProduct)}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all shadow-md ${
              isFavorited
                ? 'bg-rose-500 text-white border-rose-400 scale-105'
                : 'bg-zinc-900/85 hover:bg-zinc-800 text-zinc-300 hover:text-rose-400 border-zinc-700/80'
            }`}
            title={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            aria-label="Favoritar"
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-white' : ''}`} />
          </button>

          {/* Share Button */}
          <button
            onClick={handleShareWhatsApp}
            className="w-9 h-9 rounded-full bg-zinc-900/85 hover:bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-zinc-300 hover:text-emerald-400 transition-colors shadow-md"
            title="Compartilhar no WhatsApp"
            aria-label="Compartilhar"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Close Button */}
          <button
            onClick={() => setSelectedProduct(null)}
            className="w-9 h-9 rounded-full bg-zinc-900/85 hover:bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-zinc-300 hover:text-white transition-colors shadow-md"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Left Column: Image with color overlay preview */}
        <div className="w-full md:w-5/12 bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden shrink-0 min-h-[260px] md:min-h-full">
          <img
            src={selectedProduct.image}
            alt={selectedProduct.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover max-h-[360px] md:max-h-full"
          />

          {selectedColor && (
            <div
              className="absolute inset-0 pointer-events-none mix-blend-color opacity-25 transition-all duration-300"
              style={{ backgroundColor: selectedColor.hex }}
            />
          )}

          {/* Promo Badge */}
          {selectedProduct.isPromo && (
            <div className="absolute top-3 left-3 z-10 bg-amber-400 text-black text-xs font-black px-2.5 py-1 rounded-lg shadow-md">
              PROMOÇÃO
            </div>
          )}

          {/* Color tag */}
          {selectedColor && (
            <div className="absolute bottom-3 left-3 z-10 bg-black/85 backdrop-blur-md border border-zinc-700 px-2.5 py-1 rounded-xl flex items-center gap-2 shadow-lg">
              <span
                className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-inner"
                style={{ backgroundColor: selectedColor.hex }}
              />
              <span className="text-[11px] font-semibold text-white">
                Cor: {selectedColor.name}
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Scrollable Information and Purchase Panel */}
        <div className="w-full md:w-7/12 p-5 sm:p-7 flex flex-col justify-between overflow-y-auto space-y-4 max-h-[75vh] md:max-h-[90vh]">
          <div className="space-y-4">
            {/* Category & Rating */}
            <div className="flex items-center justify-between text-xs pr-24">
              <span className="text-amber-400 font-semibold uppercase tracking-wider text-[11px]">
                {selectedProduct.category === 'times'
                  ? 'Camisas de Times'
                  : selectedProduct.category === 'polo'
                  ? 'Camisas Polo'
                  : selectedProduct.category === 'bermuda'
                  ? 'Bermudas'
                  : 'Camisas Regatas'}
              </span>

              {/* Star Rating summary button */}
              <button
                onClick={() => setActiveTab('reviews')}
                className="flex items-center gap-1 text-amber-400 hover:underline font-bold"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{ratingInfo.count > 0 ? ratingInfo.average.toFixed(1) : '5.0'}</span>
                <span className="text-zinc-500 font-normal">
                  ({ratingInfo.count > 0 ? `${ratingInfo.count} avaliações` : 'Novo'})
                </span>
              </button>
            </div>

            {/* Title */}
            <h2 className="text-lg sm:text-2xl font-black text-white leading-snug">
              {selectedProduct.name}
            </h2>

            {/* Price */}
            <div className="flex items-baseline gap-2.5 flex-wrap">
              {selectedProduct.isPromo && selectedProduct.promoPrice && (
                <span className="text-sm text-zinc-500 line-through tabular-nums">
                  R$ {selectedProduct.price.toFixed(2).replace('.', ',')}
                </span>
              )}
              <span className="text-2xl sm:text-3xl font-black text-amber-400 tabular-nums">
                R$ {effectivePrice.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-xs text-zinc-400 font-medium">
                em até 3x sem juros ou à vista no Pix
              </span>
            </div>

            {/* Colors */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-zinc-200">Cores Disponíveis:</span>
                <span className="text-amber-400 font-semibold">{selectedColor?.name}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {selectedProduct.colors.map((color) => {
                  const isSelected = selectedColor?.name === color.name;
                  return (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-zinc-800 border-amber-400 shadow-md shadow-amber-500/10 text-white'
                          : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded-full border shadow-inner flex items-center justify-center ${
                          isSelected ? 'border-amber-300 ring-1 ring-amber-400/40' : 'border-zinc-600'
                        }`}
                        style={{ backgroundColor: color.hex }}
                      >
                        {isSelected && (
                          <Check
                            className={`w-2 h-2 ${
                              color.hex === '#f8fafc' || color.hex === '#ffffff'
                                ? 'text-black'
                                : 'text-white'
                            }`}
                          />
                        )}
                      </span>
                      <span className="text-xs font-medium">{color.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sizes Selector with Virtual Fitting Room & Size Guide Buttons */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5 flex-wrap gap-1">
                <span className="font-bold text-zinc-200">Escolha o Tamanho:</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openVirtualFitting(selectedProduct)}
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 hover:underline"
                  >
                    <Sparkles className="w-3 h-3" />
                    Provador Virtual
                  </button>
                  <span className="text-zinc-600">·</span>
                  <button
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white hover:underline"
                  >
                    <Ruler className="w-3 h-3" />
                    Guia de Medidas
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {selectedProduct.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 rounded-xl font-extrabold text-xs transition-all border ${
                        isSelected
                          ? 'bg-amber-400 text-black border-amber-300 shadow-md shadow-amber-500/20 scale-105'
                          : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stock & Quantity */}
            <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
              <span className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOutOfStock ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                />
                {isOutOfStock ? (
                  <span className="text-rose-400 font-semibold">Produto Esgotado</span>
                ) : (
                  <span>
                    Estoque:{' '}
                    <strong className="text-white">{selectedProduct.stock} unidades</strong>
                  </span>
                )}
              </span>

              {!isOutOfStock && (
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="text-xs font-bold text-white px-1 tabular-nums">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(selectedProduct.stock, q + 1))}
                    className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    disabled={quantity >= selectedProduct.stock}
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            {/* Tabs (Ficha Técnica / Avaliações / Frete) */}
            <div className="pt-2">
              <div className="flex border-b border-zinc-800 text-xs gap-4 pb-1">
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`pb-1.5 font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
                    activeTab === 'specs'
                      ? 'border-amber-400 text-amber-400'
                      : 'border-transparent text-zinc-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Ficha Técnica
                </button>

                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-1.5 font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
                    activeTab === 'reviews'
                      ? 'border-amber-400 text-amber-400'
                      : 'border-transparent text-zinc-400 hover:text-white'
                  }`}
                >
                  <Star className="w-3.5 h-3.5" />
                  Avaliações ({ratingInfo.count})
                </button>

                <button
                  onClick={() => setActiveTab('shipping')}
                  className={`pb-1.5 font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
                    activeTab === 'shipping'
                      ? 'border-amber-400 text-amber-400'
                      : 'border-transparent text-zinc-400 hover:text-white'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  Calcular Frete
                </button>
              </div>

              {/* Tab Contents */}
              <div className="pt-3">
                {activeTab === 'specs' && (
                  <div className="space-y-3">
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {selectedProduct.description}
                    </p>

                    <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl grid grid-cols-2 gap-2 text-[11px] text-zinc-400">
                      <div>
                        <span className="text-zinc-500 block text-[10px]">Tecido:</span>
                        <span className="text-zinc-200 font-medium">{specs.material}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px]">Modelagem:</span>
                        <span className="text-zinc-200 font-medium">{specs.fit}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px]">Respirabilidade:</span>
                        <span className="text-zinc-200 font-medium">{specs.breathability}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px]">Garantia:</span>
                        <span className="text-zinc-200 font-medium">{specs.warranty}</span>
                      </div>
                    </div>

                    {/* Comparar Peça */}
                    <button
                      onClick={() => toggleProductComparison(selectedProduct)}
                      className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                        isInComparison
                          ? 'bg-amber-400/15 border-amber-400 text-amber-300'
                          : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-300 hover:border-amber-400/50'
                      }`}
                    >
                      <Scale className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        {isInComparison
                          ? `Peça no Comparador (${comparedProducts.length}/3) — Remover`
                          : `Comparar Lado a Lado (${comparedProducts.length}/3)`}
                      </span>
                      {comparedProducts.length > 0 && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProduct(null);
                            setIsComparisonModalOpen(true);
                          }}
                          className="ml-auto underline text-[10px] text-amber-400"
                        >
                          Ver Comparativo &rarr;
                        </span>
                      )}
                    </button>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <CustomerReviewsSection product={selectedProduct} />
                )}

                {activeTab === 'shipping' && (
                  <ShippingCalculatorWidget subtotal={effectivePrice * quantity} />
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-zinc-800/80">
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  isOutOfStock
                    ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                    : addedSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-900 hover:bg-zinc-850 text-amber-400 border border-amber-500/40 hover:border-amber-400'
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    Adicionado!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    Adicionar ao Carrinho
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  isOutOfStock
                    ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black shadow-lg shadow-amber-500/20 active:scale-98'
                }`}
              >
                <span>Comprar Agora</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Delivery highlights */}
            <div className="flex items-center justify-center gap-4 text-[11px] text-zinc-400 pt-1">
              <span className="flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-amber-400" />
                Retirada grátis na loja
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                Entrega expressa ou Correios
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
