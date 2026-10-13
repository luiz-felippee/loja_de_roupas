import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductSize } from '../../types';
import { getProductSpecs, getComparisonHighlights } from '../../utils/productSpecs';
import {
  Scale,
  X,
  Plus,
  ShoppingBag,
  Check,
  Share2,
  Trash2,
  Tag,
  Sparkles,
  Info,
  CheckCircle2,
  XCircle,
  Shirt,
  Wind,
  Layers,
  Activity,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export const ProductComparisonModal: React.FC = () => {
  const {
    comparedProducts,
    products,
    removeFromComparison,
    clearComparison,
    addToComparison,
    isComparisonModalOpen,
    setIsComparisonModalOpen,
    addToCart,
    setIsCartOpen,
    setSelectedProduct,
    addToast
  } = useStore();

  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, ProductSize>>({});
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});
  const [addedItemSuccess, setAddedItemSuccess] = useState<string | null>(null);

  if (!isComparisonModalOpen) return null;

  const allSizes: ProductSize[] = ['P', 'M', 'G', 'GG'];
  const maxSlots = 3;
  const highlights = getComparisonHighlights(comparedProducts);

  // Produtos que ainda não estão no comparador para o picker
  const availableToAdd = products.filter(
    (p) => !comparedProducts.some((cp) => cp.id === p.id)
  );

  const handleAddAndBuy = (product: Product) => {
    const size = selectedSizes[product.id] || product.sizes[0] || 'M';
    const color = selectedColors[product.id] || product.colors[0]?.name || 'Padrão';

    if (product.stock <= 0) {
      addToast('Produto esgotado', 'Esta peça não possui unidades no momento.', 'alert');
      return;
    }

    addToCart(product, color, size, 1);
    setAddedItemSuccess(product.id);
    setTimeout(() => setAddedItemSuccess(null), 2000);
  };

  const handleShareWhatsApp = () => {
    if (comparedProducts.length === 0) return;

    let msg = `*Comparativo Henrique Multimarcas*\n\n`;
    comparedProducts.forEach((p, idx) => {
      const price = p.isPromo && p.promoPrice ? p.promoPrice : p.price;
      const specs = getProductSpecs(p);
      msg += `*${idx + 1}. ${p.name}*\n`;
      msg += `• Preço: R$ ${price.toFixed(2).replace('.', ',')}\n`;
      msg += `• Tamanhos: ${p.sizes.join(', ')}\n`;
      msg += `• Material: ${specs.material}\n`;
      msg += `• Caimento: ${specs.fit}\n\n`;
    });
    msg += `Confira na loja virtual da Henrique Multimarcas!`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={() => setIsComparisonModalOpen(false)}
    >
      <div
        className="relative w-full max-w-6xl bg-[#0f121b] border border-zinc-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-6 border-b border-zinc-800 bg-[#0f1d3b] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black shadow-md shadow-amber-500/20">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Comparativo de Produtos
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-400/15 text-amber-300 border border-amber-400/30">
                  {comparedProducts.length} de 3 peças
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 hidden sm:block">
                Visualize especificações técnicas, preços, caimento e tamanhos disponíveis lado a lado.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {comparedProducts.length > 0 && (
              <>
                <button
                  onClick={handleShareWhatsApp}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-[#25D366]/20 text-zinc-300 hover:text-[#25D366] border border-zinc-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors hidden sm:flex"
                  title="Compartilhar resumo no WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Compartilhar</span>
                </button>

                <button
                  onClick={clearComparison}
                  className="px-3 py-1.5 bg-zinc-800/80 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 border border-zinc-700/80 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Limpar todos os produtos"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Limpar</span>
                </button>
              </>
            )}

            <button
              onClick={() => setIsComparisonModalOpen(false)}
              className="w-9 h-9 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
              aria-label="Fechar comparador"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Highlights Bar */}
        {comparedProducts.length > 1 && (
          <div className="bg-[#151926] px-4 sm:px-6 py-2.5 border-b border-zinc-800/80 flex items-center gap-3 overflow-x-auto text-[11px] scrollbar-none shrink-0">
            <span className="font-bold text-amber-400 flex items-center gap-1 shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
              Destaques:
            </span>

            {highlights.lowestPriceId && (
              <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2.5 py-1 rounded-full whitespace-nowrap">
                🏷️ Menor preço:{' '}
                <strong>
                  {comparedProducts.find((p) => p.id === highlights.lowestPriceId)?.name.split(' ')[0]}
                </strong>
              </span>
            )}

            {highlights.highestDiscountId && (
              <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2.5 py-1 rounded-full whitespace-nowrap">
                ⚡ Maior desconto:{' '}
                <strong>
                  {comparedProducts.find((p) => p.id === highlights.highestDiscountId)?.name.split(' ')[0]}
                </strong>
              </span>
            )}

            {highlights.mostColorsId && (
              <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2.5 py-1 rounded-full whitespace-nowrap">
                🎨 Mais opções de cores:{' '}
                <strong>
                  {comparedProducts.find((p) => p.id === highlights.mostColorsId)?.colors.length} cores
                </strong>
              </span>
            )}

            {highlights.mostStockId && (
              <span className="inline-flex items-center gap-1 bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-full whitespace-nowrap">
                📦 Maior disponibilidade em estoque
              </span>
            )}
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {comparedProducts.length === 0 ? (
            /* Empty State */
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-[#0f1d3b] border border-zinc-800 flex items-center justify-center mx-auto text-amber-400 shadow-xl">
                <Scale className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-lg font-bold text-white">Nenhum produto selecionado</h3>
                <p className="text-xs text-zinc-400">
                  Navegue pela loja e marque até 3 peças com o botão &ldquo;Comparar&rdquo; para ver as especificações técnicas, preços e tamanhos lado a lado.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsComparisonModalOpen(false);
                  const el = document.getElementById('catalogo-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5"
              >
                <span>Explorar Catálogo da Loja</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Comparative Grid with Touch-friendly Horizontal Scroll */
            <div className="overflow-x-auto pb-4 scrollbar-thin">
              <div className="min-w-[650px] sm:min-w-[760px] md:min-w-full">
                {/* 1. Header / Product Cards Columns */}
                <div
                  className="grid gap-4"
                  style={{
                    gridTemplateColumns: `repeat(${Math.max(comparedProducts.length + (comparedProducts.length < maxSlots ? 1 : 0), 2)}, minmax(240px, 1fr))`
                  }}
                >
                  {comparedProducts.map((product, idx) => {
                    const effectivePrice = product.isPromo && product.promoPrice ? product.promoPrice : product.price;
                    const discount = product.isPromo && product.promoPrice ? product.price - product.promoPrice : 0;
                    const isOutOfStock = product.stock <= 0;
                    const isLowStock = product.stock > 0 && product.stock <= 5;
                    const currentColor = selectedColors[product.id] || product.colors[0]?.name;
                    const currentSize = selectedSizes[product.id] || product.sizes[0] || 'M';

                    return (
                      <div
                        key={product.id}
                        className="bg-[#0f1d3b] border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between relative group hover:border-amber-400/40 transition-all shadow-lg"
                      >
                        {/* Top Slot Badge & Remove */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                            Peça {idx + 1}
                          </span>
                          <button
                            onClick={() => removeFromComparison(product.id)}
                            className="text-zinc-500 hover:text-rose-400 p-1 rounded-lg hover:bg-zinc-800 transition-colors"
                            title="Remover do comparativo"
                            aria-label={`Remover ${product.name} do comparativo`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Image Thumbnail */}
                        <div
                          onClick={() => {
                            setSelectedProduct(product);
                          }}
                          className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#0a1528] mb-3 cursor-pointer group/img"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                          />
                          {product.isPromo && (
                            <span className="absolute top-2 left-2 bg-amber-400 text-black text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow">
                              PROMO
                            </span>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-xs font-semibold text-white">
                            Ver Detalhes
                          </div>
                        </div>

                        {/* Title and Category */}
                        <div className="mb-3">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">
                            {product.category}
                          </span>
                          <h4
                            onClick={() => setSelectedProduct(product)}
                            className="text-sm font-bold text-white hover:text-amber-400 transition-colors cursor-pointer line-clamp-2"
                          >
                            {product.name}
                          </h4>
                        </div>

                        {/* Price Display */}
                        <div className="p-3 bg-[#181d2c] rounded-xl border border-zinc-800/80 mb-3">
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-black text-amber-400 tabular-nums">
                              R$ {effectivePrice.toFixed(2).replace('.', ',')}
                            </span>
                            {product.isPromo && product.promoPrice && (
                              <span className="text-xs text-zinc-500 line-through tabular-nums">
                                R$ {product.price.toFixed(2).replace('.', ',')}
                              </span>
                            )}
                          </div>
                          {discount > 0 && (
                            <span className="text-[10px] font-bold text-emerald-400 block mt-0.5">
                              Economia de R$ {discount.toFixed(2).replace('.', ',')} ({Math.round((discount / product.price) * 100)}% OFF)
                            </span>
                          )}
                        </div>

                        {/* Stock indicator */}
                        <div className="mb-4 text-[11px]">
                          {isOutOfStock ? (
                            <span className="text-rose-400 font-bold flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" />
                              Esgotado no momento
                            </span>
                          ) : isLowStock ? (
                            <span className="text-amber-400 font-semibold flex items-center gap-1">
                              <Info className="w-3.5 h-3.5" />
                              Estoque baixo: {product.stock} disponíveis
                            </span>
                          ) : (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Em estoque ({product.stock} unidades)
                            </span>
                          )}
                        </div>

                        {/* Quick Selection & Add to Cart Action */}
                        <div className="space-y-2 pt-2 border-t border-zinc-800">
                          {/* Color select pill */}
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-zinc-400 font-medium">Cor:</span>
                            <div className="flex items-center gap-1">
                              {product.colors.map((c) => (
                                <button
                                  key={c.name}
                                  onClick={() =>
                                    setSelectedColors((prev) => ({ ...prev, [product.id]: c.name }))
                                  }
                                  className={`w-4 h-4 rounded-full border transition-transform ${
                                    currentColor === c.name
                                      ? 'scale-125 border-amber-400 ring-1 ring-amber-400/50'
                                      : 'border-zinc-700 opacity-70 hover:opacity-100'
                                  }`}
                                  style={{ backgroundColor: c.hex }}
                                  title={c.name}
                                  aria-label={`Selecionar cor ${c.name}`}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Size selector pills */}
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-zinc-400 font-medium">Tam:</span>
                            <div className="flex items-center gap-1">
                              {product.sizes.map((sz) => (
                                <button
                                  key={sz}
                                  onClick={() =>
                                    setSelectedSizes((prev) => ({ ...prev, [product.id]: sz }))
                                  }
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                                    currentSize === sz
                                      ? 'bg-amber-400 text-black shadow-sm'
                                      : 'bg-zinc-850 text-zinc-300 hover:bg-zinc-800 border border-zinc-750'
                                  }`}
                                >
                                  {sz}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Add to Cart button */}
                          <button
                            onClick={() => handleAddAndBuy(product)}
                            disabled={isOutOfStock}
                            className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md ${
                              addedItemSuccess === product.id
                                ? 'bg-emerald-500 text-white'
                                : isOutOfStock
                                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black hover:shadow-amber-500/20 active:scale-95'
                            }`}
                          >
                            {addedItemSuccess === product.id ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Adicionado!</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>Comprar Esta Peça</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty Slot Card to Invite Adding Product up to 3 */}
                  {comparedProducts.length < maxSlots && (
                    <div className="bg-[#121520]/60 border-2 border-dashed border-zinc-800 hover:border-amber-400/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3 transition-colors min-h-[360px]">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-850 border border-zinc-750 flex items-center justify-center text-amber-400">
                        <Plus className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white">
                          Adicionar {comparedProducts.length === 1 ? '2ª Peça' : '3ª Peça'}
                        </h4>
                        <p className="text-xs text-zinc-400 max-w-[190px]">
                          Compare especificações de até 3 produtos lado a lado.
                        </p>
                      </div>
                      <button
                        onClick={() => setIsProductPickerOpen(true)}
                        className="px-4 py-2 bg-zinc-800 hover:bg-amber-400 text-zinc-200 hover:text-black text-xs font-bold rounded-xl border border-zinc-700 transition-all flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Escolher Peça</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Technical Specifications Detailed Rows */}
                <div className="mt-8 space-y-6">
                  {/* Section Title */}
                  <div className="border-b border-zinc-800 pb-2 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-400" />
                      Especificações Técnicas Comparadas
                    </h3>
                    <span className="text-xs text-zinc-500">
                      Dados técnicos certificados pela Henrique Multimarcas
                    </span>
                  </div>

                  {/* Spec Row Item Component */}
                  {[
                    {
                      label: 'Tamanhos Disponíveis',
                      icon: Shirt,
                      render: (product: Product) => (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {allSizes.map((sz) => {
                            const isAvailable = product.sizes.includes(sz);
                            return (
                              <span
                                key={sz}
                                className={`px-2 py-1 rounded text-xs font-bold border ${
                                  isAvailable
                                    ? 'bg-amber-400/15 text-amber-300 border-amber-400/40'
                                    : 'bg-zinc-900/60 text-zinc-600 border-zinc-850 line-through'
                                }`}
                                title={isAvailable ? `Tamanho ${sz} disponível` : `Tamanho ${sz} indisponível`}
                              >
                                {sz}
                              </span>
                            );
                          })}
                        </div>
                      )
                    },
                    {
                      label: 'Opções de Cores',
                      icon: Sparkles,
                      render: (product: Product) => (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {product.colors.map((c) => (
                              <div
                                key={c.name}
                                className="w-4 h-4 rounded-full border border-zinc-700 shadow-inner"
                                style={{ backgroundColor: c.hex }}
                                title={c.name}
                              />
                            ))}
                          </div>
                          <p className="text-[11px] text-zinc-300 font-medium">
                            {product.colors.map((c) => c.name).join(' • ')}
                          </p>
                        </div>
                      )
                    },
                    {
                      label: 'Composição & Tecido',
                      icon: Layers,
                      getValue: (p: Product) => getProductSpecs(p).material
                    },
                    {
                      label: 'Modelagem & Caimento',
                      icon: Shirt,
                      getValue: (p: Product) => getProductSpecs(p).fit
                    },
                    {
                      label: 'Gola & Acabamento',
                      icon: Tag,
                      getValue: (p: Product) => getProductSpecs(p).collarOrCut
                    },
                    {
                      label: 'Transpirabilidade & Secagem',
                      icon: Wind,
                      getValue: (p: Product) => getProductSpecs(p).breathability
                    },
                    {
                      label: 'Gramatura / Peso',
                      icon: Activity,
                      getValue: (p: Product) => getProductSpecs(p).fabricWeight
                    },
                    {
                      label: 'Indicação de Uso',
                      icon: Activity,
                      getValue: (p: Product) => getProductSpecs(p).usage
                    },
                    {
                      label: 'Cuidados & Lavagem',
                      icon: Info,
                      getValue: (p: Product) => getProductSpecs(p).care
                    },
                    {
                      label: 'Origem & Garantia',
                      icon: ShieldCheck,
                      getValue: (p: Product) => `${getProductSpecs(p).origin} — ${getProductSpecs(p).warranty}`
                    }
                  ].map((row, rIdx) => {
                    const Icon = row.icon;
                    return (
                      <div
                        key={row.label}
                        className={`rounded-2xl p-4 border transition-colors ${
                          rIdx % 2 === 0
                            ? 'bg-[#121522] border-zinc-800/80'
                            : 'bg-[#151928] border-zinc-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className="w-4 h-4 text-amber-400 shrink-0" />
                          <h4 className="text-xs font-bold text-zinc-200 tracking-wide uppercase">
                            {row.label}
                          </h4>
                        </div>

                        <div
                          className="grid gap-4"
                          style={{
                            gridTemplateColumns: `repeat(${Math.max(comparedProducts.length + (comparedProducts.length < maxSlots ? 1 : 0), 2)}, minmax(240px, 1fr))`
                          }}
                        >
                          {comparedProducts.map((product) => (
                            <div
                              key={`${product.id}-${row.label}`}
                              className="text-xs text-zinc-300 leading-relaxed font-normal bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/50"
                            >
                              {row.render ? row.render(product) : row.getValue ? row.getValue(product) : null}
                            </div>
                          ))}

                          {/* Placeholder for empty slot */}
                          {comparedProducts.length < maxSlots && (
                            <div className="text-xs text-zinc-500 italic p-3 rounded-xl border border-dashed border-zinc-800/60 flex items-center justify-center">
                              Slot aguardando produto
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-zinc-800 bg-[#0f1d3b] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-zinc-400 text-center sm:text-left">
            <span>Dúvidas sobre caimento ou medidas? Chame no WhatsApp da loja: </span>
            <strong className="text-amber-400"> (11) 98765-4321</strong>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {comparedProducts.length < maxSlots && (
              <button
                onClick={() => setIsProductPickerOpen(true)}
                className="flex-1 sm:flex-initial px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl border border-zinc-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Peça</span>
              </button>
            )}

            <button
              onClick={() => {
                setIsComparisonModalOpen(false);
                setIsCartOpen(true);
              }}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-extrabold rounded-xl transition-all shadow-md shadow-amber-500/10 flex items-center justify-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Ver Meu Carrinho</span>
            </button>
          </div>
        </div>

        {/* Inline Modal Picker to Add Product to Comparator */}
        {isProductPickerOpen && (
          <div
            className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
            onClick={() => setIsProductPickerOpen(false)}
          >
            <div
              className="bg-[#0f1d3b] border border-zinc-700 rounded-2xl w-full max-w-lg p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Escolha uma peça para comparar
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Selecione uma peça disponível para preencher o slot ({comparedProducts.length + 1}/3)
                  </p>
                </div>
                <button
                  onClick={() => setIsProductPickerOpen(false)}
                  className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {availableToAdd.length === 0 ? (
                  <p className="text-xs text-zinc-400 text-center py-6">
                    Todos os produtos do catálogo já foram adicionados ao comparador.
                  </p>
                ) : (
                  availableToAdd.map((product) => {
                    const price = product.isPromo && product.promoPrice ? product.promoPrice : product.price;
                    return (
                      <div
                        key={product.id}
                        onClick={() => {
                          addToComparison(product);
                          setIsProductPickerOpen(false);
                        }}
                        className="flex items-center justify-between p-2.5 bg-zinc-900/70 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-400/50 rounded-xl transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg bg-[#0a1528] shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                              <span className="capitalize">{product.category}</span>
                              <span>•</span>
                              <span className="text-amber-400 font-bold tabular-nums">
                                R$ {price.toFixed(2).replace('.', ',')}
                              </span>
                              <span>•</span>
                              <span>{product.stock} un.</span>
                            </div>
                          </div>
                        </div>

                        <button
                          className="px-3 py-1.5 bg-zinc-800 group-hover:bg-amber-400 text-zinc-300 group-hover:text-black rounded-lg text-xs font-bold transition-all shrink-0 ml-2"
                        >
                          Selecionar
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="pt-2 border-t border-zinc-800 flex justify-end">
                <button
                  onClick={() => setIsProductPickerOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
