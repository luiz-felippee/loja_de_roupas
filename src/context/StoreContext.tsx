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
  ProductReview
} from '../types';
import { INITIAL_PRODUCTS, INITIAL_STORE_SETTINGS } from '../data/initialProducts';
import { INITIAL_REVIEWS } from '../data/initialReviews';
import { soundEffects } from '../utils/audio';
import { readStorage, writeStorage } from '../lib/storage';
import { loadOrders } from '../data/sampleOrders';

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
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  deleteOrder: (orderId: string) => void;

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

  // Product Comparison (Até 3 peças lado a lado)
  const [comparedProductIds, setComparedProductIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('hm_compared_product_ids');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed.slice(0, 3);
      }
    } catch {
      // fallback
    }
    return [];
  });
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  useEffect(() => {
    writeStorage('hm_compared_product_ids', comparedProductIds);
  }, [comparedProductIds]);

  const comparedProducts = React.useMemo(() => {
    return comparedProductIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));
  }, [comparedProductIds, products]);

  const isProductInComparison = (productId: string) => {
    return comparedProductIds.includes(productId);
  };

  const addToComparison = (product: Product): boolean => {
    if (comparedProductIds.includes(product.id)) {
      return true;
    }
    if (comparedProductIds.length >= 3) {
      addToast(
        'Limite de comparação atingido',
        'Você já selecionou o limite máximo de 3 peças para comparação. Remova uma para adicionar outra.',
        'warning'
      );
      return false;
    }
    setComparedProductIds((prev) => [...prev, product.id]);
    addToast(
      'Peça adicionada ao comparador',
      `"${product.name}" pronta para comparação (${comparedProductIds.length + 1} de 3 peças).`,
      'info',
      {
        label: 'Ver Comparativo',
        onClick: () => setIsComparisonModalOpen(true)
      }
    );
    return true;
  };

  const removeFromComparison = (productId: string) => {
    setComparedProductIds((prev) => prev.filter((id) => id !== productId));
  };

  const toggleProductComparison = (product: Product) => {
    if (comparedProductIds.includes(product.id)) {
      removeFromComparison(product.id);
      addToast('Peça removida', `"${product.name}" removida da comparação.`, 'info');
    } else {
      addToComparison(product);
    }
  };

  const clearComparison = () => {
    setComparedProductIds([]);
    addToast('Comparador limpo', 'Todas as peças foram removidas da lista de comparação.', 'info');
  };

  // Lista de Desejos / Favoritos (Wishlist)
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>(() => readStorage('hm_wishlist_ids', []));
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  useEffect(() => {
    writeStorage('hm_wishlist_ids', wishlistProductIds);
  }, [wishlistProductIds]);

  const wishlistProducts = React.useMemo(() => {
    return wishlistProductIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));
  }, [wishlistProductIds, products]);

  const isInWishlist = (productId: string) => wishlistProductIds.includes(productId);

  const toggleWishlist = (product: Product) => {
    if (wishlistProductIds.includes(product.id)) {
      setWishlistProductIds((prev) => prev.filter((id) => id !== product.id));
      addToast('Removido dos favoritos', `"${product.name}" foi removido da sua lista de desejos.`, 'info');
    } else {
      setWishlistProductIds((prev) => [...prev, product.id]);
      soundEffects.playCash();
      addToast(
        '❤️ Salvo nos favoritos!',
        `"${product.name}" adicionado à sua lista de desejos.`,
        'success',
        {
          label: 'Ver Favoritos',
          onClick: () => setIsWishlistOpen(true)
        }
      );
    }
  };

  const clearWishlist = () => {
    setWishlistProductIds([]);
    addToast('Favoritos limpos', 'Todos os itens foram removidos da sua lista.', 'info');
  };

  // Avaliações de Clientes (Reviews & Ratings)
  const [reviews, setReviews] = useState<ProductReview[]>(() => readStorage('hm_product_reviews', INITIAL_REVIEWS));

  useEffect(() => {
    writeStorage('hm_product_reviews', reviews);
  }, [reviews]);

  const addReview = (newReview: Omit<ProductReview, 'id' | 'createdAt'>) => {
    const created: ProductReview = {
      ...newReview,
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    setReviews((prev) => [created, ...prev]);
    soundEffects.playSuccess();
    addToast(
      '⭐ Avaliação publicada!',
      'Obrigado pelo seu feedback! Sua avaliação ajuda outros clientes na escolha das peças.',
      'success'
    );
  };

  const getProductReviews = (productId: string) => {
    return reviews.filter((r) => r.productId === productId);
  };

  const getProductRating = (productId: string) => {
    const list = reviews.filter((r) => r.productId === productId);
    if (list.length === 0) return { average: 5.0, count: 0 };
    const sum = list.reduce((acc, r) => acc + r.rating, 0);
    return {
      average: Number((sum / list.length).toFixed(1)),
      count: list.length
    };
  };

  // Provador Virtual & Guia de Medidas
  const [isVirtualFittingOpen, setIsVirtualFittingOpen] = useState(false);
  const [virtualFittingProduct, setVirtualFittingProduct] = useState<Product | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);

  const openVirtualFitting = (product?: Product) => {
    setVirtualFittingProduct(product || selectedProduct || products[0]);
    setIsVirtualFittingOpen(true);
  };

  // Produtos Vistos Recentemente
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => readStorage('hm_recently_viewed_ids', []));

  useEffect(() => {
    writeStorage('hm_recently_viewed_ids', recentlyViewedIds);
  }, [recentlyViewedIds]);

  const recentlyViewedProducts = React.useMemo(() => {
    return recentlyViewedIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));
  }, [recentlyViewedIds, products]);

  const addToRecentlyViewed = (productId: string) => {
    setRecentlyViewedIds((prev) => {
      const filtered = prev.filter((id) => id !== productId);
      return [productId, ...filtered].slice(0, 8);
    });
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewedIds([]);
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
  }): Order => {
    saveCustomer(orderData.customer);

    const deliveryFee = orderData.deliveryType === 'entrega_loja' ? settings.deliveryFee : 0;
    const subtotal = cartSubtotal;
    const total = subtotal + deliveryFee;

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
      total,
      status: 'novo'
    };

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
