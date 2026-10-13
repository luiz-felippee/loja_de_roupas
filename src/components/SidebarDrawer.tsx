import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  Package,
  Sparkles,
  ShoppingBag,
  Clock,
  User,
  ShieldCheck,
  MapPin,
  Phone,
  ChevronRight,
  Store,
  CreditCard,
  Scale,
  Heart,
  Ruler,
  Camera
} from 'lucide-react';
import { ProductCategory } from '../types';

interface SidebarDrawerProps {
  onSelectCategory: (cat: ProductCategory | 'todas') => void;
  onOpenPromo: () => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  onSelectCategory,
  onOpenPromo
}) => {
  const {
    isSidebarOpen,
    setIsSidebarOpen,
    customer,
    setIsProfileModalOpen,
    setIsCartOpen,
    cartCount,
    cartSubtotal,
    setCurrentView,
    products,
    settings,
    orders,
    comparedProducts,
    setIsComparisonModalOpen,
    wishlistProducts,
    setIsWishlistOpen,
    openVirtualFitting,
    setIsSizeGuideOpen,
    setIsVisualSearchOpen
  } = useStore();

  if (!isSidebarOpen) return null;

  const promoCount = products.filter((p) => p.isPromo).length;
  const clientOrdersCount = orders.filter((o) =>
    customer?.phone ? o.customer.phone === customer.phone : true
  ).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={() => setIsSidebarOpen(false)}
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pr-10">
        <div className="w-screen max-w-sm bg-[#11131c] border-r border-zinc-800 shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-300">
          
          {/* Header */}
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-[#141724]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-extrabold text-black text-base shadow-md shadow-amber-500/20">
                H
              </div>
              <div>
                <h3 className="text-sm font-extrabold tracking-tight text-white uppercase">
                  Henrique <span className="text-amber-400">Multimarcas</span>
                </h3>
                <span className="text-[10px] text-zinc-400 tracking-wider uppercase block">
                  Menu Principal
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* 1. Customer Identification Card */}
            <div className="bg-[#181c2b] border border-zinc-800/90 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  Dados do Cliente
                </span>
                <button
                  onClick={() => {
                    setIsSidebarOpen(false);
                    setIsProfileModalOpen(true);
                  }}
                  className="text-[11px] text-amber-400 hover:underline font-semibold"
                >
                  {customer ? 'Editar' : 'Cadastrar'}
                </button>
              </div>

              {customer ? (
                <div>
                  <h4 className="text-sm font-bold text-white truncate">
                    {customer.name}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {customer.phone}
                  </p>
                  <p className="text-[11px] text-zinc-500 truncate mt-1">
                    {customer.address} {customer.neighborhood ? `· ${customer.neighborhood}` : ''}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-zinc-300 font-medium">
                    Visitante (Sem cadastro)
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Seus dados serão solicitados na hora de comprar para entrega ou retirada.
                  </p>
                </div>
              )}
            </div>

            {/* 2. Categorias da Loja */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block px-1">
                Categorias de Roupas
              </span>

              <div className="space-y-1">
                {[
                  { id: 'todas', label: 'Ver Todo o Catálogo', count: products.length },
                  { id: 'times', label: 'Camisas de Times', count: products.filter((p) => p.category === 'times').length },
                  { id: 'polo', label: 'Camisas Polo', count: products.filter((p) => p.category === 'polo').length },
                  { id: 'bermuda', label: 'Bermudas Esportivas', count: products.filter((p) => p.category === 'bermuda').length },
                  { id: 'regata', label: 'Camisas Regatas', count: products.filter((p) => p.category === 'regata').length }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectCategory(item.id as ProductCategory | 'todas');
                      setCurrentView('shop');
                      setIsSidebarOpen(false);
                      const el = document.getElementById('catalogo-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800/70 text-xs font-semibold text-zinc-200 hover:text-white transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Package className="w-4 h-4 text-zinc-500 group-hover:text-amber-400" />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[10px] bg-zinc-800 text-zinc-400 group-hover:bg-amber-400 group-hover:text-black font-bold px-2 py-0.5 rounded-md transition-colors">
                      {item.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Promoções, Carrinho & Pedidos */}
            <div className="space-y-2 pt-2 border-t border-zinc-800/80">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block px-1">
                Atalhos Rápidos
              </span>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    setCurrentView('shop');
                    setIsSidebarOpen(false);
                    onOpenPromo();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800/70 text-xs font-semibold text-amber-300 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Promoções da Semana</span>
                  </div>
                  <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded font-bold">
                    {promoCount} em oferta
                  </span>
                </button>

                <button
                  onClick={() => {
                    setIsSidebarOpen(false);
                    setIsCartOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800/70 text-xs font-semibold text-zinc-200 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="w-4 h-4 text-zinc-400" />
                    <span>Carrinho de Compras</span>
                  </div>
                  {cartCount > 0 ? (
                    <span className="text-[10px] font-bold bg-amber-400 text-black px-2 py-0.5 rounded-md">
                      {cartCount} (R$ {cartSubtotal.toFixed(0)})
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-500">Vazio</span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setCurrentView('tracking');
                    setIsSidebarOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800/70 text-xs font-semibold text-zinc-200 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    <span>Acompanhar Pedidos</span>
                  </div>
                  <span className="text-[10px] bg-zinc-800 text-zinc-400 font-bold px-2 py-0.5 rounded-md">
                    {clientOrdersCount} pedidos
                  </span>
                </button>

                <button
                  onClick={() => {
                    setIsSidebarOpen(false);
                    setIsComparisonModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800/70 text-xs font-semibold text-zinc-200 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Scale className="w-4 h-4 text-amber-400" />
                    <span>Comparador de Peças</span>
                  </div>
                  <span className="text-[10px] bg-amber-400/15 text-amber-300 border border-amber-400/30 font-bold px-2 py-0.5 rounded-md">
                    {comparedProducts.length}/3 peças
                  </span>
                </button>

                <button
                  onClick={() => {
                    setIsSidebarOpen(false);
                    setIsWishlistOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800/70 text-xs font-semibold text-zinc-200 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Heart className={`w-4 h-4 ${wishlistProducts.length > 0 ? 'fill-rose-500 text-rose-500' : 'text-zinc-400'}`} />
                    <span>Lista de Desejos</span>
                  </div>
                  <span className="text-[10px] bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold px-2 py-0.5 rounded-md">
                    {wishlistProducts.length} salvos
                  </span>
                </button>

                <button
                  onClick={() => {
                    setIsSidebarOpen(false);
                    setIsVisualSearchOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800/70 text-xs font-semibold text-zinc-200 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span>Buscar por Foto / Câmera</span>
                  </div>
                  <span className="text-[10px] bg-amber-400 text-black font-extrabold px-1.5 py-0.2 rounded">
                    IA Match
                  </span>
                </button>

                <button
                  onClick={() => {
                    setIsSidebarOpen(false);
                    openVirtualFitting();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800/70 text-xs font-semibold text-zinc-200 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Provador Virtual Inteligente</span>
                  </div>
                  <span className="text-[10px] bg-amber-400 text-black font-extrabold px-1.5 py-0.2 rounded">
                    IA Fit
                  </span>
                </button>

                <button
                  onClick={() => {
                    setIsSidebarOpen(false);
                    setIsSizeGuideOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800/70 text-xs font-semibold text-zinc-200 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Ruler className="w-4 h-4 text-zinc-400" />
                    <span>Guia de Medidas em CM</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">P ao GG</span>
                </button>
              </div>
            </div>

            {/* 4. Loja Física & Formas de Pagamento */}
            <div className="space-y-3 pt-2 border-t border-zinc-800/80">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block px-1">
                Loja Física & Entrega
              </span>

              <div className="bg-[#151824] rounded-2xl p-3.5 space-y-2 text-xs border border-zinc-800">
                <div className="flex items-start gap-2 text-zinc-300">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white">Retirada no Balcão:</strong>
                    <span className="text-[11px] text-zinc-400">{settings.storeAddress}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-zinc-300 pt-2 border-t border-zinc-800/60">
                  <Store className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white">Taxa Fixa na Cidade:</strong>
                    <span className="text-[11px] text-zinc-400">
                      R$ {settings.deliveryFee.toFixed(2).replace('.', ',')} ou motoqueiro próprio
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-zinc-300 pt-2 border-t border-zinc-800/60">
                  <CreditCard className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white">Pagamentos:</strong>
                    <span className="text-[11px] text-zinc-400">Pix instantâneo, Cartão ou Dinheiro</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer of Sidebar: Staff Login Shortcut */}
          <div className="p-4 border-t border-zinc-800 bg-[#141724]">
            <button
              onClick={() => {
                setCurrentView('admin');
                setIsSidebarOpen(false);
              }}
              className="w-full py-2.5 px-3 bg-zinc-900 hover:bg-zinc-850 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Painel da Loja (Staff)</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
