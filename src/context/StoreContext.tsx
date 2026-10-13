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
import { validarCupom } from '../utils/coupons';
import { INITIAL_PRODUCTS, INITIAL_STORE_SETTINGS } from '../data/initialProducts';
import { INITIAL_REVIEWS } from '../data/initialReviews';
import { soundEffects } from '../utils/audio';
import { readStorage, writeStorage } from '../utils/storage';
import { loadOrders } from '../data/sampleOrders';
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
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  deleteOrder: (orderId: string) => void;

  // Cupons
  coupons: Coupon[];
  addCoupon: (data: Omit<Coupon, 'id' | 'uses'>) => boolean;
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
  staffLogin: (password: string) => boolean;
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
  const [products, setProducts] = useState<Product[]>(() => readStorage('hm_products', INITIAL_PRODUCTS));

  // Settings
  const [settings, setSettings] = useState<StoreSettings>(() => readStorage('hm_settings', INITIAL_STORE_SETTINGS));

  // Customer
  const [customer, setCustomer] = useState<Customer | null>(() => readStorage('hm_customer', null));

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => readStorage('hm_cart', []));

  // Orders
  const [orders, setOrders] = useState<Order[]>(loadOrders);

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
  const [isStaffLoggedIn, setIsStaffLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('hm_staff_auth') === 'true';
    } catch {
      return false;
    }
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // LocalStorage sync
  useEffect(() => {
    writeStorage('hm_products', products);
  }, [products]);

  useEffect(() => {
    writeStorage('hm_settings', settings);
  }, [settings]);

  useEffect(() => {
    writeStorage('hm_orders', orders);
  }, [orders]);

  useEffect(() => {
    writeStorage('hm_cart', cart);
  }, [cart]);

  useEffect(() => {
    if (customer) {
      writeStorage('hm_customer', customer);
    }
  }, [customer]);

  useEffect(() => {
    localStorage.setItem('hm_staff_auth', isStaffLoggedIn ? 'true' : 'false');
  }, [isStaffLoggedIn]);

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
  const { coupons, addCoupon, updateCoupon, removeCoupon, registerCouponUse } = useCoupons(addToast);
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
        const storedOrders = readStorage<Order[] | null>('hm_orders', null);
          if (storedOrders) setOrders(storedOrders);

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
        const storedOrders = readStorage<Order[] | null>('hm_orders', null);
          if (storedOrders) setOrders(storedOrders);
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

  // Products actions
  const addProduct = (prodData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...prodData,
      id: `prod-${Date.now()}`
    };
    setProducts((prev) => [newProduct, ...prev]);
    addToast('Produto cadastrado com sucesso!', newProduct.name, 'success');
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
    addToast('Produto atualizado', 'As alterações foram salvas.', 'success');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addToast('Produto removido', 'Item excluído do catálogo.', 'info');
  };

  const updateStock = (id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newStock = Math.max(0, p.stock + delta);
          return { ...p, stock: newStock };
        }
        return p;
      })
    );
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

  // Order actions
  const createOrder = (orderData: {
    customer: Customer;
    paymentMethod: PaymentMethod;
    cashChangeFor?: number;
    deliveryType: DeliveryType;
    couponCode?: string;
  }): Order => {
    saveCustomer(orderData.customer);

    const deliveryFee = orderData.deliveryType === 'entrega_loja' ? settings.deliveryFee : 0;
    const subtotal = cartSubtotal;
    // Cupom e revalidado aqui para o total gravado bater com o que o cliente viu
    const cupom = orderData.couponCode ? validarCupom(coupons, orderData.couponCode, subtotal) : null;
    const discount = cupom?.ok ? cupom.discount : 0;
    const total = Math.round((subtotal - discount + deliveryFee) * 100) / 100;

    // Gera código sequencial amigável
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `HM-${randomSuffix}`;

    const newOrder: Order = {
      id: orderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer: orderData.customer,
      items: cart.map(({ id: _id, ...item }) => ({ ...item })),
      paymentMethod: orderData.paymentMethod,
      cashChangeFor: orderData.cashChangeFor,
      deliveryType: orderData.deliveryType,
      deliveryFee,
      subtotal,
      couponCode: cupom?.ok ? cupom.coupon.code : undefined,
      discount: discount || undefined,
      total,
      status: 'novo'
    };

    if (cupom?.ok) registerCouponUse(cupom.coupon.code);

    // Decrement stock for ordered products
    newOrder.items.forEach((item) => {
      updateStock(item.productId, -item.quantity);
    });

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();

    // Toca som de novo pedido da loja!
    soundEffects.playNewOrderAlert();

    // Broadcast across tabs/devices
    try {
      if (typeof window !== 'undefined') {
        const payload = {
          type: 'NEW_ORDER_CREATED',
          orderId
        };
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel('hm_store_events');
          bc.postMessage(payload);
          bc.close();
        }
        writeStorage('hm_last_order_status_event', payload);
      }
    } catch {
      // ignore
    }

    addToast(`Pedido ${orderId} realizado com sucesso!`, 'A loja já foi notificada para separação.', 'success');

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    let targetOrder: Order | undefined;

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updated = {
            ...ord,
            status,
            updatedAt: new Date().toISOString()
          };
          targetOrder = updated;
          return updated;
        }
        return ord;
      })
    );

    // Toca som suave de atualização de etapa do cliente!
    soundEffects.playStatusUpdateAlert();

    const statusTitleMap: Record<OrderStatus, string> = {
      novo: 'Novo Pedido Recebido',
      separacao: 'Em Separação no Estoque',
      pronto: 'Pronto para Retirada / Entrega',
      finalizado: 'Pedido Finalizado'
    };

    const currentOrder = targetOrder || orders.find((o) => o.id === orderId);

    const getStatusDescription = () => {
      if (status === 'separacao') {
        return 'A equipe da Henrique Multimarcas já está separando suas peças (cores e tamanhos conferidos)!';
      }
      if (status === 'pronto') {
        if (currentOrder?.deliveryType === 'retirada') {
          return 'Suas peças já estão prontas no balcão da loja! Você já pode passar para retirar.';
        }
        if (currentOrder?.deliveryType === 'motoqueiro_cliente') {
          return 'Seu pedido está embalado e pronto! Você já pode solicitar seu motoqueiro para buscar no balcão.';
        }
        return 'Seu pedido está pronto e saiu com o entregador da loja para o seu endereço!';
      }
      if (status === 'finalizado') {
        return 'Pedido concluído e entregue com sucesso! Muito obrigado pela preferência.';
      }
      return 'Pedido registrado na fila de atendimento da loja.';
    };

    const title = `Pedido #${orderId}: ${statusTitleMap[status]}`;
    const desc = getStatusDescription();

    // 1. Notificação Toast Visual no dispositivo do cliente
    addToast(
      title,
      desc,
      'order_update',
      {
        label: 'Acompanhar Pedido',
        onClick: () => {
          setTrackingOrderId(orderId);
          setCurrentView('tracking');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      },
      8000
    );

    // 2. Broadcast para abas/dispositivos do cliente
    try {
      if (typeof window !== 'undefined') {
        const payload = {
          type: 'ORDER_STATUS_CHANGED',
          orderId,
          status,
          title,
          description: desc,
          timestamp: Date.now()
        };
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel('hm_store_events');
          bc.postMessage(payload);
          bc.close();
        }
        writeStorage('hm_last_order_status_event', payload);
      }
    } catch {
      // ignore
    }
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    addToast('Pedido removido', `O pedido ${orderId} foi excluído.`, 'info');
  };

  // Settings
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addToast('Configurações salvas', 'Parâmetros da loja atualizados.', 'success');
  };

  const resetToDefaults = () => {
    setProducts(INITIAL_PRODUCTS);
    setSettings(INITIAL_STORE_SETTINGS);
    addToast('Dados restaurados', 'Catálogo inicial carregado.', 'info');
  };

  // Staff Auth
  const staffLogin = (password: string): boolean => {
    if (password === settings.staffPassword) {
      setIsStaffLoggedIn(true);
      addToast('Login realizado!', 'Bem-vindo ao Painel da Loja Henrique Multimarcas.', 'success');
      return true;
    }
    addToast('Senha incorreta', 'Verifique a senha informada.', 'alert');
    return false;
  };

  const staffLogout = () => {
    setIsStaffLoggedIn(false);
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
