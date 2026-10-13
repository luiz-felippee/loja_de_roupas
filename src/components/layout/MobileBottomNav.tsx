import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Store, Truck, ShoppingCart, ShieldCheck, Heart } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    cartCount,
    setIsCartOpen,
    wishlistProducts,
    setIsWishlistOpen
  } = useStore();

  return (
    <nav
      aria-label="Navegação mobile inferior"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c0e14]/95 backdrop-blur-lg border-t border-zinc-800/90 md:hidden shadow-2xl safe-area-bottom"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {/* Tab 1: Loja / Catálogo */}
        <button
          onClick={() => {
            setCurrentView('shop');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center h-full py-1 transition-all ${
            currentView === 'shop'
              ? 'text-amber-400 font-bold'
              : 'text-zinc-400 hover:text-zinc-200 font-medium'
          }`}
        >
          <div className="relative">
            <Store className={`w-5 h-5 ${currentView === 'shop' ? 'scale-110 text-amber-400' : ''}`} />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Loja</span>
        </button>

        {/* Tab 2: Favoritos */}
        <button
          onClick={() => setIsWishlistOpen(true)}
          className="flex flex-col items-center justify-center h-full py-1 text-zinc-400 hover:text-zinc-200 font-medium transition-all"
        >
          <div className="relative">
            <Heart
              className={`w-5 h-5 ${
                wishlistProducts.length > 0 ? 'fill-rose-500 text-rose-500' : 'text-zinc-400'
              }`}
            />
            {wishlistProducts.length > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-md">
                {wishlistProducts.length}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Favoritos</span>
        </button>

        {/* Tab 3: Carrinho com Badge */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center h-full py-1 text-zinc-400 hover:text-zinc-200 font-medium transition-all"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5 text-amber-400/90" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-amber-400 text-black text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-md animate-pulse">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Carrinho</span>
        </button>

        {/* Tab 4: Rastreio de Pedidos */}
        <button
          onClick={() => {
            setCurrentView('tracking');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center h-full py-1 transition-all ${
            currentView === 'tracking'
              ? 'text-amber-400 font-bold'
              : 'text-zinc-400 hover:text-zinc-200 font-medium'
          }`}
        >
          <div className="relative">
            <Truck className={`w-5 h-5 ${currentView === 'tracking' ? 'scale-110 text-amber-400' : ''}`} />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Rastreio</span>
        </button>

        {/* Tab 5: Painel da Loja (Admin) */}
        <button
          onClick={() => {
            setCurrentView('admin');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center h-full py-1 transition-all ${
            currentView === 'admin'
              ? 'text-amber-400 font-bold'
              : 'text-zinc-400 hover:text-zinc-200 font-medium'
          }`}
        >
          <div className="relative">
            <ShieldCheck className={`w-5 h-5 ${currentView === 'admin' ? 'scale-110 text-amber-400' : ''}`} />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Painel</span>
        </button>
      </div>
    </nav>
  );
};
