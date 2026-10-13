import React from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { ShippingCalculatorWidget } from './ShippingCalculatorWidget';

interface CartDrawerProps {
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenCheckout }) => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
    cartSubtotal,
    cartCount
  } = useStore();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#13151e] border-l border-zinc-800 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Seu Carrinho</h3>
                <p className="text-xs text-zinc-400">
                  {cartCount} {cartCount === 1 ? 'item selecionado' : 'itens selecionados'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/80 transition-colors"
              aria-label="Fechar carrinho"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-600">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-white">Seu carrinho está vazio</h4>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Navegue pelas camisas polo, camisas de times, bermudas e regatas para adicionar seus produtos favoritos.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold rounded-xl transition-colors"
                >
                  Ver Catálogo de Produtos
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#181b26] border border-zinc-800/80 rounded-2xl p-3.5 flex gap-3.5 relative group"
                >
                  {/* Photo */}
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-xl object-cover bg-zinc-950 shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-2 leading-tight">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400">
                        <span>Cor: <strong className="text-zinc-200">{item.color}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>Tam: <strong className="text-zinc-200">{item.size}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/60">
                      {/* Price */}
                      <span className="text-xs font-bold text-amber-400 tabular-nums">
                        R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                      </span>

                      {/* Stepper */}
                      <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-white rounded hover:bg-zinc-800 text-xs"
                          aria-label="Diminuir quantidade"
                        >
                          -
                        </button>
                        <span className="text-xs font-semibold text-white px-1 tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-white rounded hover:bg-zinc-800 text-xs"
                          aria-label="Aumentar quantidade"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                    title="Remover produto"
                    aria-label="Remover produto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer with Checkout options */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-zinc-800 bg-[#161823] space-y-3.5">
              {/* Shipping Estimator */}
              <ShippingCalculatorWidget subtotal={cartSubtotal} />

              <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                <span>Subtotal dos itens:</span>
                <span className="text-base font-bold text-white tabular-nums">
                  R$ {cartSubtotal.toFixed(2).replace('.', ',')}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="flex-1 py-3 px-3 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-xs font-semibold rounded-xl border border-zinc-800 transition-colors"
                >
                  Continuar Comprando
                </button>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onOpenCheckout();
                  }}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Fechar Pedido</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[10px] text-center text-zinc-500">
                Taxa de frete e formas de pagamento calculadas na próxima etapa.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
