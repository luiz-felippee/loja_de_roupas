import React, { useState, useMemo } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { SidebarDrawer } from './components/SidebarDrawer';
import { CustomerProfileModal } from './components/CustomerProfileModal';
import { HeroBanner } from './components/HeroBanner';
import { PromoSlider } from './components/PromoSlider';
import { CategoryFilter, SortOption } from './components/CategoryFilter';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackingView } from './components/OrderTrackingView';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ProductComparisonBar } from './components/ProductComparisonBar';
import { ProductComparisonModal } from './components/ProductComparisonModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { VirtualFittingModal } from './components/VirtualFittingModal';
import { SizeGuideModal } from './components/SizeGuideModal';
import { VisualSearchModal } from './components/VisualSearchModal';
import { RecentlyViewedSection } from './components/RecentlyViewedSection';
import { ProductCategory, ProductSize } from './types';
import { PackageSearch, X, Shield, Shirt, Sparkles } from 'lucide-react';
import { VoiceSearchResult } from './utils/speechRecognition';

const MainContent: React.FC = () => {
  const { currentView, products, addToast } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'todas'>('todas');
  const [selectedSize, setSelectedSize] = useState<ProductSize | 'todos'>('todos');
  const [sortBy, setSortBy] = useState<SortOption>('recentes');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      todas: products.length,
      times: 0,
      polo: 0,
      bermuda: 0,
      regata: 0
    };
    products.forEach((p) => {
      if (counts[p.category] !== undefined) {
        counts[p.category]++;
      }
    });
    return counts;
  }, [products]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    const list = products.filter((p) => {
      const matchesCategory = selectedCategory === 'todas' || p.category === selectedCategory;
      const matchesSize = selectedSize === 'todos' || p.sizes.includes(selectedSize);
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.colors.some((c) => c.name.toLowerCase().includes(q));
      return matchesCategory && matchesSize && matchesSearch;
    });

    // Apply sorting
    if (sortBy === 'menor_preco') {
      return [...list].sort((a, b) => {
        const pA = a.isPromo && a.promoPrice ? a.promoPrice : a.price;
        const pB = b.isPromo && b.promoPrice ? b.promoPrice : b.price;
        return pA - pB;
      });
    }
    if (sortBy === 'maior_preco') {
      return [...list].sort((a, b) => {
        const pA = a.isPromo && a.promoPrice ? a.promoPrice : a.price;
        const pB = b.isPromo && b.promoPrice ? b.promoPrice : b.price;
        return pB - pA;
      });
    }
    if (sortBy === 'promocoes') {
      return [...list].sort((a, b) => (b.isPromo ? 1 : 0) - (a.isPromo ? 1 : 0));
    }
    return list;
  }, [products, selectedCategory, selectedSize, searchQuery, sortBy]);

  const handleOpenPromo = () => {
    const el = document.getElementById('promocoes-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const hasActiveFilters = selectedCategory !== 'todas' || selectedSize !== 'todos' || searchQuery !== '';

  const resetFilters = () => {
    setSelectedCategory('todas');
    setSelectedSize('todos');
    setSearchQuery('');
    setSortBy('recentes');
  };

  const handleVoiceSearch = (result: VoiceSearchResult) => {
    if (result.matchedCategory) {
      setSelectedCategory(result.matchedCategory);
    } else if (result.cleanedQuery) {
      // Se não especificou categoria, abre para todas para encontrar o produto em qualquer seção
      setSelectedCategory('todas');
    }

    setSearchQuery(result.cleanedQuery);

    addToast(
      '🎙️ Busca por voz reconhecida',
      result.feedbackMessage || `Pesquisando por: "${result.rawTranscript}"`,
      'info'
    );

    const el = document.getElementById('catalogo-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0c0e12] text-zinc-100">
      <Header onOpenPromo={handleOpenPromo} />

      <main className="flex-1 pb-16 md:pb-0">
        {currentView === 'shop' && (
          <div>
            {/* Hero Banner */}
            <HeroBanner />

            {/* Scrollable Promotions Slider */}
            <PromoSlider />

            {/* Quick Category Feature Cards (Organização Visual no Topo) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                {[
                  {
                    id: 'times' as ProductCategory,
                    title: 'Camisas de Times',
                    desc: 'Mantos oficiais & retrô',
                    icon: Shield,
                    count: categoryCounts.times
                  },
                  {
                    id: 'polo' as ProductCategory,
                    title: 'Camisas Polo',
                    desc: 'Piquet fino & casual chic',
                    icon: Shirt,
                    count: categoryCounts.polo
                  },
                  {
                    id: 'bermuda' as ProductCategory,
                    title: 'Bermudas',
                    desc: 'Dry fit com zíper & moletom',
                    icon: Sparkles,
                    count: categoryCounts.bermuda
                  },
                  {
                    id: 'regata' as ProductCategory,
                    title: 'Camisas Regatas',
                    desc: 'Treino & corte machão',
                    icon: Shirt,
                    count: categoryCounts.regata
                  }
                ].map((c) => {
                  const isSelected = selectedCategory === c.id;
                  const Icon = c.icon;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCategory(isSelected ? 'todas' : c.id);
                        const el = document.getElementById('catalogo-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#1e2333] border-amber-400 ring-1 ring-amber-400/30 shadow-lg shadow-amber-500/10'
                          : 'bg-[#141724] border-zinc-800 hover:border-zinc-700 hover:bg-[#181c2b]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            isSelected ? 'bg-amber-400 text-black' : 'bg-zinc-850 text-amber-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-bold text-zinc-400 tabular-nums">
                          {c.count} peças
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white leading-tight">
                          {c.title}
                        </h4>
                        <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                          {c.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Catalog Section */}
            <section id="catalogo-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
              <CategoryFilter
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                categoryCounts={categoryCounts}
                selectedSize={selectedSize}
                onSelectSize={setSelectedSize}
                sortBy={sortBy}
                onSortChange={setSortBy}
                onVoiceSearch={handleVoiceSearch}
              />

              {/* Active Filter Summary Bar */}
              <div className="mt-6 flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span>
                    Exibindo <strong className="text-white tabular-nums">{filteredProducts.length}</strong> de <strong className="text-zinc-300 tabular-nums">{products.length}</strong> produtos
                  </span>
                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="ml-2 text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <X className="w-3 h-3" />
                      Limpar todos os filtros
                    </button>
                  )}
                </div>

                <span className="text-[11px] text-zinc-500 hidden sm:inline">
                  Preços e estoque atualizados em tempo real
                </span>
              </div>

              {/* Product Grid */}
              <div className="mt-6">
                {filteredProducts.length === 0 ? (
                  <div className="bg-[#141620] border border-zinc-800 rounded-3xl p-12 text-center text-zinc-400 space-y-3">
                    <PackageSearch className="w-12 h-12 mx-auto text-zinc-600 mb-2" />
                    <h3 className="text-base font-bold text-white">Nenhum produto encontrado com estes filtros</h3>
                    <p className="text-xs max-w-sm mx-auto">
                      Experimente alterar a categoria, tamanho ou limpar a busca para visualizar as peças disponíveis.
                    </p>
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold rounded-xl transition-colors mt-2"
                    >
                      Limpar Filtros e Ver Catálogo
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Recently Viewed Products Carousel */}
            <RecentlyViewedSection />
          </div>
        )}

        {currentView === 'tracking' && <OrderTrackingView />}

        {currentView === 'admin' && <AdminPanel />}
      </main>

      <Footer />

      {/* Global Drawers & Modals */}
      <SidebarDrawer
        onSelectCategory={setSelectedCategory}
        onOpenPromo={handleOpenPromo}
      />
      <CustomerProfileModal />
      <ProductDetailModal />
      <CartDrawer onOpenCheckout={() => setIsCheckoutOpen(true)} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
      <ToastContainer />
      <ProductComparisonBar />
      <ProductComparisonModal />
      <WishlistDrawer />
      <VirtualFittingModal />
      <SizeGuideModal />
      <VisualSearchModal />
      <MobileBottomNav />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainContent />
    </StoreProvider>
  );
}
