import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Customer,
  OrderItem,
  Order,
  OrderStatus,
  StoreSettings,
  ToastMessage,
  ProductSize,
  PaymentMethod,
  DeliveryType,
  ProductReview,
  Coupon,
  CashSession,
  CashMovementKind
} from '../types';
import { useCoupons } from './slices/coupons';
import { useCash } from './slices/cash';
import { INITIAL_PRODUCTS, INITIAL_STORE_SETTINGS } from '../data/initialProducts';
import { INITIAL_REVIEWS } from '../data/initialReviews';
import { soundEffects } from '../utils/audio';
import { readStorage, writeStorage } from '../utils/storage';
import { api } from '../lib/api';
import { useComparison } from './slices/comparison';
import { useWishlist } from './slices/wishlist';
import { useReviews } from './slices/reviews';
import { useRecentlyViewed } from './slices/recentlyViewed';

interface CartItem extends OrderItem {
  id: string; // unique item key composed of productId + color + size
}

interface StoreContextType {
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateStock: (id: string, delta: number) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, color: string, size: ProductSize, quantity?: number) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Customer Profile
  customer: Customer | null;
  saveCustomer: (customer: Customer) => void;

  // Orders
  orders: Order[];
  createOrder: (orderData: {
    customer: Customer;
    paymentMethod: PaymentMethod;
    cashChangeFor?: number;
    deliveryType: DeliveryType;
    couponCode?: string;
  }) => Promise<{ id: string; total: number }>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  deleteOrder: (orderId: string) => void;

  // Cupons
  coupons: Coupon[];
  addCoupon: (data: Omit<Coupon, 'id' | 'uses'>) => Promise<boolean>;
  updateCoupon: (id: string, data: Partial<Omit<Coupon, 'id' | 'uses'>>) => void;
  removeCoupon: (id: string) => void;

  // Caixa
  cashSessions: CashSession[];
  currentCashSession: CashSession | null;
  openCash: (openingFloat: number) => void;
  addCashMovement: (kind: CashMovementKind, amount: number, note: string) => void;
  closeCash: (countedAmount: number) => void;

  // View Navigation & Drawers
  currentView: 'shop' | 'tracking' | 'admin';
  setCurrentView: (view: 'shop' | 'tracking' | 'admin') => void;
  trackingOrderId: string | null;
  setTrackingOrderId: (id: string | null) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;

  // Product Comparison (Até 3 peças lado a lado)
  comparedProductIds: string[];
  comparedProducts: Product[];
  toggleProductComparison: (product: Product) => void;
  addToComparison: (product: Product) => boolean;
  removeFromComparison: (productId: string) => void;
  clearComparison: () => void;
  isProductInComparison: (productId: string) => boolean;
  isComparisonModalOpen: boolean;
  setIsComparisonModalOpen: (open: boolean) => void;

  // Lista de Desejos / Favoritos (Wishlist)
  wishlistProductIds: string[];
  wishlistProducts: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;

  // Avaliações dos Clientes (Customer Reviews)
  reviews: ProductReview[];
  addReview: (review: Omit<ProductReview, 'id' | 'createdAt'>) => void;
  getProductReviews: (productId: string) => ProductReview[];
  getProductRating: (productId: string) => { average: number; count: number };

  // Provador Virtual & Guia de Medidas
  isVirtualFittingOpen: boolean;
  setIsVirtualFittingOpen: (open: boolean) => void;
  virtualFittingProduct: Product | null;
  openVirtualFitting: (product?: Product) => void;
  isSizeGuideOpen: boolean;
  setIsSizeGuideOpen: (open: boolean) => void;

  // Busca Visual por Câmera / Foto
  isVisualSearchOpen: boolean;
  setIsVisualSearchOpen: (open: boolean) => void;

  // Produtos Vistos Recentemente
  recentlyViewedIds: string[];
  recentlyViewedProducts: Product[];
  addToRecentlyViewed: (productId: string) => void;
  clearRecentlyViewed: () => void;

  // Admin & Settings
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  isStaffLoggedIn: boolean;
  staffLogin: (password: string) => Promise<boolean>;
  staffLogout: () => void;
  resetToDefaults: () => void;

  // Notifications
  toasts: ToastMessage[];
  addToast: (
    title: string,
    description?: string,
    type?: ToastMessage['type'],
    action?: { label: string; onClick: () => void },
    duration?: number
  ) => void;
  removeToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Products
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  // Settings
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_STORE_SETTINGS);

  // Customer
  const [customer, setCustomer] = useState<Customer | null>(() => readStorage('hm_customer', null));

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => readStorage('hm_cart', []));

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);

  // Navigation & Modals
  const [currentView, setCurrentView] = useState<'shop' | 'tracking' | 'admin'>('shop');
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);




  // Provador Virtual & Guia de Medidas
  const [isVirtualFittingOpen, setIsVirtualFittingOpen] = useState(false);
  const [virtualFittingProduct, setVirtualFittingProduct] = useState<Product | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);

  const openVirtualFitting = (product?: Product) => {
    setVirtualFittingProduct(product || selectedProduct || products[0]);
    setIsVirtualFittingOpen(true);
  };


  // Interceptador para registrar em vistos recentemente
  const handleSetSelectedProduct = (product: Product | null) => {
    setSelectedProduct(product);
    if (product) {
      addToRecentlyViewed(product.id);
    }
  };

  // Staff Authentication
  const [isStaffLoggedIn, setIsStaffLoggedIn] = useState<boolean>(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // LocalStorage sync
  useEffect(() => {
    writeStorage('hm_cart', cart);
  }, [cart]);

  useEffect(() => {
    if (customer) {
      writeStorage('hm_customer', customer);
    }
  }, [customer]);

  // Toast Helpers
  const addToast = (
    title: string,
    description?: string,
    type: ToastMessage['type'] = 'info',
    action?: { label: string; onClick: () => void },
    duration = 5000
  ) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, title, description, type, action }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fatias de estado (hooks em src/context/slices)
  const { addToComparison, clearComparison, comparedProductIds, comparedProducts, isComparisonModalOpen, isProductInComparison, removeFromComparison, setComparedProductIds, setIsComparisonModalOpen, toggleProductComparison } = useComparison(products, addToast);
  const { clearWishlist, isInWishlist, isWishlistOpen, setIsWishlistOpen, setWishlistProductIds, toggleWishlist, wishlistProductIds, wishlistProducts } = useWishlist(products, addToast);
  const { addReview, getProductRating, getProductReviews, reviews, setReviews } = useReviews(addToast);
  const { addToRecentlyViewed, clearRecentlyViewed, recentlyViewedIds, recentlyViewedProducts, setRecentlyViewedIds } = useRecentlyViewed(products);

  // Cupons e caixa (fatias em src/context/slices)
  const { coupons, addCoupon, updateCoupon, removeCoupon } = useCoupons(addToast, isStaffLoggedIn);
  const { cashSessions, currentCashSession, openCash, addCashMovement, closeCash } = useCash(addToast);

  // Cross-Tab & Device Event Listener for Real-Time Client/Staff Notifications
  useEffect(() => {
    const handleRemoteEvent = (eventData: {
      type: string;
      orderId?: string;
      status?: OrderStatus;
      title?: string;
      description?: string;
    }) => {
      if (eventData?.type === 'ORDER_STATUS_CHANGED' && eventData.orderId && eventData.title) {
        // Refresh local orders from localStorage
        refreshOrders();

        // Toca o som de atualização no dispositivo/aba do cliente
        soundEffects.playStatusUpdateAlert();

        // Dispara o Toast visual no cliente
        addToast(
          eventData.title,
          eventData.description,
          'order_update',
          {
            label: 'Acompanhar Pedido',
            onClick: () => {
              if (eventData.orderId) {
                setTrackingOrderId(eventData.orderId);
                setCurrentView('tracking');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }
          },
          8000
        );
      } else if (eventData?.type === 'NEW_ORDER_CREATED') {
        refreshOrders();
        soundEffects.playNewOrderAlert();
      }
    };

    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel('hm_store_events');
      bc.onmessage = (event) => {
        handleRemoteEvent(event.data);
      };
    }

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'hm_last_order_status_event' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          handleRemoteEvent(parsed);
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('storage', handleStorageEvent);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  // Products actions (o catalogo vem do servidor; a equipe altera pela API)
  const refreshProducts = async () => {
    try {
      const lista = await api<Product[]>(isStaffLoggedIn ? '/admin/products' : '/products');
      setProducts(lista);
    } catch {
      // Sem conexao: a tela mantem o catalogo que ja esta carregado
    }
  };

  const corpoProduto = (dados: Partial<Product>) => {
    const corpo: Record<string, unknown> = {};
    for (const campo of ['name', 'category', 'description', 'image', 'price', 'colors', 'sizes', 'stock', 'specs'] as const) {
      if (dados[campo] !== undefined) corpo[campo] = dados[campo];
    }
    if ('promoPrice' in dados) corpo.promoPrice = dados.promoPrice ?? null;
    return corpo;
  };

  const addProduct = async (prodData: Omit<Product, 'id'>) => {
    try {
      await api('/admin/products', { body: corpoProduto(prodData) });
      await refreshProducts();
      addToast('Produto cadastrado com sucesso!', prodData.name, 'success');
    } catch (e) {
      addToast('Não foi possível salvar o produto', e instanceof Error ? e.message : 'Erro inesperado.', 'error');
    }
  };

  const updateProduct = async (id: string, updated: Partial<Product>) => {
    try {
      await api(`/admin/products/${id}`, { method: 'PATCH', body: corpoProduto(updated) });
      await refreshProducts();
      addToast('Produto atualizado', 'As alterações foram salvas.', 'success');
    } catch (e) {
      addToast('Não foi possível atualizar', e instanceof Error ? e.message : 'Erro inesperado.', 'error');
    }
  };

  // Remover e desativar: o produto some da vitrine e continua no historico
  const deleteProduct = async (id: string) => {
    try {
      await api(`/admin/products/${id}`, { method: 'PATCH', body: { active: false } });
      await refreshProducts();
      addToast('Produto removido', 'Item excluído do catálogo.', 'info');
    } catch (e) {
      addToast('Não foi possível remover', e instanceof Error ? e.message : 'Erro inesperado.', 'error');
    }
  };

  const updateStock = async (id: string, delta: number) => {
    const produto = products.find((p) => p.id === id);
    if (!produto) return;
    const novoEstoque = Math.max(0, produto.stock + delta);
    try {
      await api(`/admin/products/${id}`, { method: 'PATCH', body: { stock: novoEstoque } });
      await refreshProducts();
    } catch (e) {
      addToast('Não foi possível atualizar o estoque', e instanceof Error ? e.message : 'Erro inesperado.', 'error');
    }
  };

  // Cart actions
  const addToCart = (product: Product, color: string, size: ProductSize, quantity = 1) => {
    const effectivePrice = product.isPromo && product.promoPrice ? product.promoPrice : product.price;
    const itemKey = `${product.id}-${color}-${size}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === itemKey);
      if (existing) {
        return prev.map((item) =>
          item.id === itemKey
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      const newItem: CartItem = {
        id: itemKey,
        productId: product.id,
        name: product.name,
        image: product.image,
        color,
        size,
        price: effectivePrice,
        quantity
      };
      return [...prev, newItem];
    });

    addToast('Adicionado ao carrinho!', `${product.name} (${color} - ${size})`, 'success');
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Customer actions
  const saveCustomer = (c: Customer) => {
    setCustomer(c);
  };

  // Order actions (os pedidos ficam no servidor)
  const refreshOrders = async () => {
    if (!isStaffLoggedIn) return;
    try {
      setOrders(await api<Order[]>('/admin/orders'));
    } catch {
      // Sem conexao: a lista atual continua na tela
    }
  };

  const createOrder = async (orderData: {
    customer: Customer;
    paymentMethod: PaymentMethod;
    cashChangeFor?: number;
    deliveryType: DeliveryType;
    couponCode?: string;
  }): Promise<{ id: string; total: number }> => {
    saveCustomer(orderData.customer);

    // O servidor recalcula preco, promocao, cupom e frete, e confere o estoque
    const pedido = await api<{ id: string; total: number }>('/orders', {
      body: {
        customer: orderData.customer,
        paymentMethod: orderData.paymentMethod,
        cashChangeFor: orderData.cashChangeFor,
        deliveryType: orderData.deliveryType,
        couponCode: orderData.couponCode,
        items: cart.map(({ productId, color, size, quantity }) => ({ productId, color, size, quantity })),
      },
    });

    clearCart();
    await refreshProducts();
    addToast(`Pedido ${pedido.id} realizado com sucesso!`, 'A loja já foi notificada para separação.', 'success');
    return { id: pedido.id, total: pedido.total };
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await api(`/admin/orders/${orderId}`, { method: 'PATCH', body: { status } });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o)));
    } catch (e) {
      addToast('Não foi possível atualizar a etapa', e instanceof Error ? e.message : 'Erro inesperado.', 'error');
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      await api(`/admin/orders/${orderId}`, { method: 'DELETE' });
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      addToast('Pedido removido', `O pedido ${orderId} foi excluído.`, 'info');
    } catch (e) {
      addToast('Não foi possível excluir', e instanceof Error ? e.message : 'Erro inesperado.', 'error');
    }
  };

  // Settings e equipe (fonte: servidor)
  const updateSettings = async (novos: Partial<StoreSettings>) => {
    // A senha da equipe nao e alterada pelo site
    const { staffPassword: _ignorada, ...semSenha } = novos;
    try {
      const salvo = await api<Omit<StoreSettings, 'staffPassword'>>('/admin/settings', { method: 'PATCH', body: semSenha });
      setSettings((prev) => ({ ...prev, ...salvo }));
      addToast('Configurações salvas', 'Parâmetros da loja atualizados.', 'success');
    } catch (e) {
      addToast('Não foi possível salvar', e instanceof Error ? e.message : 'Erro inesperado.', 'error');
    }
  };

  const resetToDefaults = () => {
    refreshProducts();
    api<Omit<StoreSettings, 'staffPassword'>>('/settings')
      .then((s) => setSettings((prev) => ({ ...prev, ...s })))
      .catch(() => undefined);
    addToast('Dados atualizados', 'Catálogo e configurações recarregados do servidor.', 'info');
  };

  // Ao abrir o site: catalogo e configuracoes vem do servidor
  useEffect(() => {
    api<Omit<StoreSettings, 'staffPassword'>>('/settings')
      .then((s) => setSettings((prev) => ({ ...prev, ...s })))
      .catch(() => undefined);
    refreshProducts();
    // refreshProducts muda de comportamento quando a equipe entra; a carga inicial e sempre a publica
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ao abrir: verifica se a equipe ja esta logada (cookie de sessao)
  useEffect(() => {
    api<{ ok: boolean }>('/staff/session')
      .then((r) => setIsStaffLoggedIn(r.ok))
      .catch(() => setIsStaffLoggedIn(false));
  }, []);

  // Quando a equipe entra: pedidos e catalogo completo, atualizados a cada 10 s
  useEffect(() => {
    if (!isStaffLoggedIn) return;
    refreshOrders();
    refreshProducts();
    const intervalo = setInterval(refreshOrders, 10000);
    return () => clearInterval(intervalo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStaffLoggedIn]);

  // Staff Auth
  const staffLogin = async (password: string): Promise<boolean> => {
    try {
      await api('/staff/login', { body: { password } });
      setIsStaffLoggedIn(true);
      addToast('Login realizado!', 'Bem-vindo ao Painel da Loja Henrique Multimarcas.', 'success');
      return true;
    } catch (e) {
      addToast('Acesso negado', e instanceof Error ? e.message : 'Verifique a senha informada.', 'alert');
      return false;
    }
  };

  const staffLogout = async () => {
    await api('/staff/logout', { method: 'POST' }).catch(() => undefined);
    setIsStaffLoggedIn(false);
    setOrders([]);
    addToast('Sessão encerrada', 'Você saiu do Painel da Loja.', 'info');
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        customer,
        saveCustomer,
        orders,
        createOrder,
        updateOrderStatus,
        deleteOrder,
        coupons,
        addCoupon,
        updateCoupon,
        removeCoupon,
        cashSessions,
        currentCashSession,
        openCash,
        addCashMovement,
        closeCash,
        currentView,
        setCurrentView,
        trackingOrderId,
        setTrackingOrderId,
        selectedProduct,
        setSelectedProduct: handleSetSelectedProduct,
        isSidebarOpen,
        setIsSidebarOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
        comparedProductIds,
        comparedProducts,
        toggleProductComparison,
        addToComparison,
        removeFromComparison,
        clearComparison,
        isProductInComparison,
        isComparisonModalOpen,
        setIsComparisonModalOpen,
        wishlistProductIds,
        wishlistProducts,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        isWishlistOpen,
        setIsWishlistOpen,
        reviews,
        addReview,
        getProductReviews,
        getProductRating,
        isVirtualFittingOpen,
        setIsVirtualFittingOpen,
        virtualFittingProduct,
        openVirtualFitting,
        isSizeGuideOpen,
        setIsSizeGuideOpen,
        isVisualSearchOpen,
        setIsVisualSearchOpen,
        recentlyViewedIds,
        recentlyViewedProducts,
        addToRecentlyViewed,
        clearRecentlyViewed,
        settings,
        updateSettings,
        isStaffLoggedIn,
        staffLogin,
        staffLogout,
        resetToDefaults,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
