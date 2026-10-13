import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ShoppingBag, ShieldCheck, Menu, Package, Tag, PhoneCall, Sparkles, User, Scale, Heart, Camera } from 'lucide-react';

interface HeaderProps {
  onOpenPromo: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenPromo }) => {
  const {
    cartCount,
    setIsCartOpen,
    currentView,
    setCurrentView,
    customer,
    isStaffLoggedIn,
    setIsSidebarOpen,
    setIsProfileModalOpen,
    comparedProducts,
    setIsComparisonModalOpen,
    wishlistProducts,
    setIsWishlistOpen,
    openVirtualFitting,
    setIsVisualSearchOpen
  } = useStore();

  return (
    <header className="sticky top-0 z-40 bg-[#0f1117]/95 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-6 md:gap-8">
          
          {/* Zone 1: Sidebar Toggle + Brand Wordmark */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink sm:shrink-0">
            {/* Sidebar Drawer trigger button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-zinc-300 hover:text-amber-400 bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 rounded-xl transition-all flex items-center gap-1.5 focus:outline-none"
              title="Abrir Menu Lateral"
              aria-label="Abrir Menu Lateral"
            >
              <Menu className="w-4 h-4" />
              <span className="text-xs font-semibold hidden sm:inline">Menu</span>
            </button>

            {/* Brand Logo & Name */}
            <button
              onClick={() => {
                setCurrentView('shop');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 sm:gap-2.5 text-left group sm:whitespace-nowrap shrink min-w-0 sm:shrink-0 focus:outline-none"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-extrabold text-[#0c0e12] text-lg shadow-md shadow-amber-500/10 group-hover:scale-105 transition-transform">
                H
              </div>
              <div className="flex flex-col">
                <span className="text-sm leading-tight sm:text-lg font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors uppercase">
                  Henrique <span className="text-amber-400">Multimarcas</span>
                </span>
                <span className="hidden sm:block text-[10px] text-zinc-400 tracking-wider uppercase font-medium">
                  Moda Esportiva & Casual
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (single-line, concise) */}
          <nav className="hidden lg:flex flex-1 min-w-0 overflow-x-auto items-center gap-7 text-sm font-medium text-zinc-300 [scrollbar-width:none]">
            <button
              onClick={() => {
                setCurrentView('shop');
                const el = document.getElementById('catalogo-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                currentView === 'shop' ? 'text-amber-400' : ''
              }`}
            >
              <Package className="w-4 h-4 text-zinc-400" />
              Catálogo
            </button>

            <button
              onClick={() => {
                setCurrentView('shop');
                onOpenPromo();
              }}
              className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 text-amber-300/90"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Promoções
            </button>

            <button
              onClick={() => setCurrentView('tracking')}
              className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                currentView === 'tracking' ? 'text-amber-400' : ''
              }`}
            >
              <Tag className="w-4 h-4 text-zinc-400" />
              Acompanhar Pedido
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('contato-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 text-zinc-400"
            >
              <PhoneCall className="w-4 h-4 text-zinc-500" />
              Loja Física
            </button>

            <button
              onClick={() => setIsVisualSearchOpen(true)}
              className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 text-zinc-300"
              title="Buscar por Foto ou Câmera (IA Color & Shape)"
            >
              <Camera className="w-4 h-4 text-amber-400" />
              <span>Buscar por Foto</span>
            </button>

            <button
              onClick={() => openVirtualFitting()}
              className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 text-zinc-300"
              title="Provador Virtual Inteligente"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Provador Virtual</span>
            </button>

            <button
              onClick={() => setIsComparisonModalOpen(true)}
              className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 text-zinc-300 relative"
              title="Comparador de Peças"
            >
              <Scale className="w-4 h-4 text-amber-400" />
              <span>Comparar</span>
              {comparedProducts.length > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-extrabold bg-amber-400 text-black rounded-full tabular-nums shadow-sm">
                  {comparedProducts.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsWishlistOpen(true)}
              className="hover:text-rose-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 text-zinc-300 relative"
              title="Lista de Desejos / Favoritos"
            >
              <Heart className={`w-4 h-4 ${wishlistProducts.length > 0 ? 'fill-rose-500 text-rose-500' : 'text-zinc-400'}`} />
              <span>Favoritos</span>
              {wishlistProducts.length > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-extrabold bg-rose-500 text-white rounded-full tabular-nums shadow-sm">
                  {wishlistProducts.length}
                </span>
              )}
            </button>
          </nav>

          {/* Zone 3: Primary Actions (Camera search, Customer profile, Wishlist button, Compare button, Admin button, Cart) */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Visual Search button */}
            <button
              onClick={() => setIsVisualSearchOpen(true)}
              className="p-2 text-xs font-semibold text-zinc-300 hover:text-amber-400 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-amber-400/50 rounded-lg shadow-sm flex items-center gap-1"
              title="Buscar por Foto / Câmera (IA Color & Shape)"
              aria-label="Buscar por Foto / Câmera"
            >
              <Camera className="w-4 h-4 text-amber-400" />
              <span className="hidden xl:inline text-[11px] text-zinc-300">Foto</span>
            </button>

            {/* Wishlist button */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="hidden sm:block relative p-2 text-xs font-semibold text-zinc-300 hover:text-rose-400 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-rose-500/50 rounded-lg shadow-sm flex items-center gap-1"
              title="Abrir Favoritos"
              aria-label="Abrir Favoritos"
            >
              <Heart className={`w-4 h-4 ${wishlistProducts.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
              {wishlistProducts.length > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-extrabold bg-rose-500 text-white rounded-full">
                  {wishlistProducts.length}
                </span>
              )}
            </button>

            {/* Quick compare button */}
            {comparedProducts.length > 0 && (
              <button
                onClick={() => setIsComparisonModalOpen(true)}
                className="relative p-2 text-xs font-semibold text-amber-400 bg-zinc-900 hover:bg-zinc-850 border border-amber-400/50 rounded-lg shadow-sm flex items-center gap-1"
                title="Abrir Comparativo"
                aria-label="Abrir Comparativo"
              >
                <Scale className="w-4 h-4" />
                <span className="px-1.5 py-0.2 text-[10px] font-extrabold bg-amber-400 text-black rounded-full">
                  {comparedProducts.length}
                </span>
              </button>
            )}
            {/* Customer profile trigger */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-zinc-300 bg-zinc-900/80 hover:bg-zinc-850 px-2.5 py-1.5 rounded-lg border border-zinc-800 hover:border-amber-400/40 transition-colors"
              title="Ver e editar dados do cliente"
            >
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-medium max-w-[100px] truncate">
                {customer ? customer.name.split(' ')[0] : 'Meu Perfil'}
              </span>
            </button>

            {/* Painel da Loja (Staff Access) */}
            <button
              onClick={() => setCurrentView(currentView === 'admin' ? 'shop' : 'admin')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                currentView === 'admin'
                  ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20'
                  : 'bg-zinc-900/90 text-zinc-300 border-zinc-700/80 hover:border-amber-500/50 hover:text-amber-300'
              }`}
              title="Acesso exclusivo para Dono e Funcionários"
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden sm:inline">
                {currentView === 'admin' ? 'Sair do Painel' : isStaffLoggedIn ? 'Painel Loja' : 'Acesso Loja'}
              </span>
            </button>

            {/* Cart Button with Counter */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative px-3 sm:px-3.5 py-2 text-xs font-semibold text-[#0c0e12] bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-md shadow-amber-500/10 transition-all flex items-center gap-2 whitespace-nowrap shrink-0 active:scale-95"
              aria-label="Abrir carrinho de compras"
            >
              <ShoppingBag className="w-4 h-4 text-zinc-950" />
              <span className="hidden md:inline font-bold">Carrinho</span>
              {cartCount > 0 && (
                <span className="px-1.5 py-0.5 text-[11px] font-extrabold bg-black text-amber-300 rounded-md">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
