import { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, OrderStatus, ProductCategory, ProductSize } from '../../types';
import { audioManager, soundEffects, AudioManager } from '../../utils/audio';
import { generatePixPayload, generatePixQRCode } from '../../utils/pix';

export function useAdminPanel() {
  const {
    isStaffLoggedIn,
    staffLogin,
    staffLogout,
    orders,
    updateOrderStatus,
    deleteOrder,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    settings,
    updateSettings,
    resetToDefaults,
    setCurrentView,
    createOrder,
    addToast
  } = useStore();

  // Auditory Notification: Integrate AudioManager into AdminPanel
  // Automatically detects when a new order arrives in the orders list state and triggers the auditory alert
  const knownOrderIdsRef = useRef<Set<string>>(new Set(orders.map((o) => o.id)));
  const isInitialMountRef = useRef<boolean>(true);

  useEffect(() => {
    // Avoid triggering on initial mount for existing orders
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      knownOrderIdsRef.current = new Set(orders.map((o) => o.id));
      return;
    }

    // Check if any order in current orders state was not previously known
    const hasNewOrder = orders.some((o) => !knownOrderIdsRef.current.has(o.id));

    if (hasNewOrder) {
      // Immediate auditory notification to the staff via AudioManager
      audioManager.playNewOrderAlert();
    }

    // Update the set of known order IDs
    knownOrderIdsRef.current = new Set(orders.map((o) => o.id));
  }, [orders]);

  // Login form state
  const [passwordInput, setPasswordInput] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'settings' | 'coupons' | 'cash' | 'reports'>('orders');

  // Order filters & search
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // Product modal (Create / Edit)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states for Product
  const [pName, setPName] = useState('');
  const [pCategory, setPCategory] = useState<ProductCategory>('times');
  const [pImage, setPImage] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pPromoPrice, setPPromoPrice] = useState('');
  const [pIsPromo, setPIsPromo] = useState(false);
  const [pStock, setPStock] = useState('10');
  const [pDescription, setPDescription] = useState('');
  const [pColors, setPColors] = useState<{ name: string; hex: string }[]>([
    { name: 'Preto', hex: '#18181b' },
    { name: 'Branco', hex: '#f8fafc' }
  ]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#f59e0b');
  const [pSizes, setPSizes] = useState<ProductSize[]>(['P', 'M', 'G', 'GG']);

  // Settings form states
  const [deliveryFeeInput, setDeliveryFeeInput] = useState(settings.deliveryFee.toString());
  const [pixKeyInput, setPixKeyInput] = useState(settings.pixKey);
  const [pixKeyTypeInput, setPixKeyTypeInput] = useState<'celular' | 'cpf_cnpj' | 'email' | 'aleatoria'>(
    settings.pixKeyType || 'celular'
  );
  const [pixNameInput, setPixNameInput] = useState(settings.pixName);
  const [pixCityInput, setPixCityInput] = useState(settings.pixCity || 'SAO PAULO');
  const [whatsappInput, setWhatsappInput] = useState(settings.whatsapp);
  const [storeAddressInput, setStoreAddressInput] = useState(settings.storeAddress);
  const [newStaffPasswordInput, setNewStaffPasswordInput] = useState(settings.staffPassword);

  // Pix preview and test states
  const [testPixQR, setTestPixQR] = useState<string>('');
  const [testPixCode, setTestPixCode] = useState<string>('');
  const [copiedTestPix, setCopiedTestPix] = useState(false);

  // Update Pix test preview whenever Pix parameters change
  useEffect(() => {
    if (pixKeyInput.trim()) {
      try {
        const payload = generatePixPayload({
          pixKey: pixKeyInput.trim(),
          merchantName: pixNameInput.trim() || 'HENRIQUE MULTIMARCAS',
          merchantCity: pixCityInput.trim() || 'SAO PAULO',
          amount: 50.00,
          description: 'Teste de Pagamento Pix'
        });
        setTestPixCode(payload);
        generatePixQRCode(payload)
          .then((url) => setTestPixQR(url))
          .catch(() => setTestPixQR(''));
      } catch {
        setTestPixCode('');
        setTestPixQR('');
      }
    } else {
      setTestPixCode('');
      setTestPixQR('');
    }
  }, [pixKeyInput, pixNameInput, pixCityInput]);

  // Handle open modal for creating new product
  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setPName('');
    setPCategory('times');
    setPImage('/src/assets/images/football_jersey_pink_white_1791857252502.jpg');
    setPPrice('');
    setPPromoPrice('');
    setPIsPromo(false);
    setPStock('12');
    setPDescription('');
    setPColors([
      { name: 'Preto', hex: '#18181b' },
      { name: 'Branco', hex: '#f8fafc' }
    ]);
    setPSizes(['P', 'M', 'G', 'GG']);
    setIsProductModalOpen(true);
  };

  // Handle open modal for editing existing product
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setPName(prod.name);
    setPCategory(prod.category);
    setPImage(prod.image);
    setPPrice(prod.price.toString());
    setPPromoPrice(prod.promoPrice?.toString() || '');
    setPIsPromo(prod.isPromo);
    setPStock(prod.stock.toString());
    setPDescription(prod.description);
    setPColors([...prod.colors]);
    setPSizes([...prod.sizes]);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim() || !pPrice) return;

    const priceNum = parseFloat(pPrice);
    const promoPriceNum = pPromoPrice ? parseFloat(pPromoPrice) : undefined;
    const stockNum = parseInt(pStock, 10) || 0;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: pName.trim(),
        category: pCategory,
        image: pImage.trim() || '/src/assets/images/polo_shirt_black_gold_1791857251704.jpg',
        price: priceNum,
        promoPrice: promoPriceNum,
        isPromo: pIsPromo,
        stock: stockNum,
        description: pDescription.trim(),
        colors: pColors,
        sizes: pSizes,
        specs: editingProduct.specs
      });
    } else {
      addProduct({
        name: pName.trim(),
        category: pCategory,
        image: pImage.trim() || '/src/assets/images/polo_shirt_black_gold_1791857251704.jpg',
        price: priceNum,
        promoPrice: promoPriceNum,
        isPromo: pIsPromo,
        stock: stockNum,
        description: pDescription.trim() || 'Produto autêntico Henrique Multimarcas.',
        colors: pColors,
        sizes: pSizes
      });
    }

    setIsProductModalOpen(false);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      deliveryFee: parseFloat(deliveryFeeInput) || 10,
      pixKey: pixKeyInput.trim(),
      pixKeyType: pixKeyTypeInput,
      pixName: pixNameInput.trim(),
      pixCity: pixCityInput.trim(),
      whatsapp: whatsappInput.trim(),
      storeAddress: storeAddressInput.trim(),
      staffPassword: newStaffPasswordInput.trim() || '1234'
    });
  };

  // Metrics calculations
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingCount = orders.filter((o) => o.status === 'novo' || o.status === 'separacao').length;
  const lowStockCount = products.filter((p) => p.stock <= 5).length;
  const newOrdersCount = orders.filter((o) => o.status === 'novo').length;
  const separacaoOrdersCount = orders.filter((o) => o.status === 'separacao').length;
  const prontoOrdersCount = orders.filter((o) => o.status === 'pronto').length;
  const finalizadoOrdersCount = orders.filter((o) => o.status === 'finalizado').length;

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    const q = orderSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      o.id.toLowerCase().includes(q) ||
      o.customer.name.toLowerCase().includes(q) ||
      o.customer.phone.includes(q) ||
      o.customer.address.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const handleSimulateNewOrder = () => {
    const randomNames = ['Rodrigo Lima', 'Matheus Oliveira', 'Bruno Souza', 'Felipe Santos'];
    const chosenName = randomNames[Math.floor(Math.random() * randomNames.length)];

    createOrder({
      customer: {
        name: chosenName,
        phone: '(11) 9' + Math.floor(10000000 + Math.random() * 90000000),
        address: 'Rua das Palmeiras, ' + Math.floor(10 + Math.random() * 900),
        neighborhood: 'Centro'
      },
      paymentMethod: 'pix',
      deliveryType: 'entrega_loja'
    }).catch((e) => addToast('Não foi possível simular o pedido', e instanceof Error ? e.message : 'Erro inesperado.', 'error'));
  };

  // Export CSV function for today's orders (código, valor total e forma de pagamento)
  const exportTodayOrdersCSV = () => {
    if (orders.length === 0) {
      addToast('Nenhum pedido encontrado', 'Não há pedidos para exportar no momento.', 'alert');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter((o) => {
      const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
      return orderDate === todayStr;
    });

    const ordersToExport = todayOrders.length > 0 ? todayOrders : orders;
    const isOnlyToday = todayOrders.length > 0;

    // Headers formatados para compatibilidade com Excel
    const headers = [
      'Código',
      'Data e Hora',
      'Cliente',
      'Telefone',
      'Valor Total (R$)',
      'Forma de Pagamento',
      'Troco Solicitado',
      'Tipo de Recebimento',
      'Status Atual'
    ];

    const statusMap: Record<OrderStatus, string> = {
      novo: 'Novo Pedido',
      separacao: 'Em Separação',
      pronto: 'Pronto para Retirada/Entrega',
      finalizado: 'Finalizado'
    };

    const deliveryMap: Record<string, string> = {
      retirada: 'Retirada no Balcão',
      entrega_loja: 'Entrega da Loja',
      motoqueiro_cliente: 'Motoqueiro do Cliente'
    };

    const paymentMap: Record<string, string> = {
      pix: 'PIX',
      cartao: 'CARTÃO',
      dinheiro: 'DINHEIRO'
    };

    const rows = ordersToExport.map((o) => {
      const dateFormatted = new Date(o.createdAt).toLocaleString('pt-BR');
      const totalFormatted = o.total.toFixed(2).replace('.', ',');
      const changeFormatted = o.cashChangeFor
        ? `R$ ${o.cashChangeFor.toFixed(2).replace('.', ',')}`
        : 'Não';
      const paymentFormatted = paymentMap[o.paymentMethod] || o.paymentMethod.toUpperCase();
      const statusFormatted = statusMap[o.status] || o.status;
      const deliveryFormatted = deliveryMap[o.deliveryType] || o.deliveryType;

      return [
        `"${o.id}"`,
        `"${dateFormatted}"`,
        `"${o.customer.name.replace(/"/g, '""')}"`,
        `"${o.customer.phone}"`,
        `"${totalFormatted}"`,
        `"${paymentFormatted}"`,
        `"${changeFormatted}"`,
        `"${deliveryFormatted}"`,
        `"${statusFormatted}"`
      ].join(';');
    });

    // Linha de totalização
    const totalSum = ordersToExport.reduce((acc, o) => acc + o.total, 0);
    const summaryRow = [
      '"TOTAL DO RESUMO"',
      `"${ordersToExport.length} pedidos"`,
      '""',
      '""',
      `"${totalSum.toFixed(2).replace('.', ',')}"`,
      '""',
      '""',
      '""',
      '""'
    ].join(';');

    // UTF-8 BOM (\uFEFF) para visualização correta de acentos no Excel
    const csvContent =
      '\uFEFF' + [headers.join(';'), ...rows, summaryRow].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filenameDate = new Date().toISOString().split('T')[0];
    link.download = `pedidos_${filenameDate}_henrique_multimarcas.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast(
      'Resumo CSV exportado!',
      `${ordersToExport.length} pedidos incluídos no relatório (${isOnlyToday ? 'pedidos de hoje' : 'todos os pedidos disponíveis'}).`,
      'success'
    );
  };


  return {
    activeTab,
    addProduct,
    addToast,
    copiedTestPix,
    createOrder,
    deleteOrder,
    deleteProduct,
    deliveryFeeInput,
    editingProduct,
    exportTodayOrdersCSV,
    filteredOrders,
    finalizadoOrdersCount,
    handleOpenEditProduct,
    handleOpenNewProduct,
    handleSaveProduct,
    handleSaveSettings,
    handleSimulateNewOrder,
    isInitialMountRef,
    isProductModalOpen,
    isStaffLoggedIn,
    knownOrderIdsRef,
    lowStockCount,
    newColorHex,
    newColorName,
    newOrdersCount,
    newStaffPasswordInput,
    orderSearchQuery,
    orderStatusFilter,
    orders,
    pCategory,
    pColors,
    pDescription,
    pImage,
    pIsPromo,
    pName,
    pPrice,
    pPromoPrice,
    pSizes,
    pStock,
    passwordInput,
    pendingCount,
    pixCityInput,
    pixKeyInput,
    pixKeyTypeInput,
    pixNameInput,
    products,
    prontoOrdersCount,
    resetToDefaults,
    separacaoOrdersCount,
    setActiveTab,
    setCopiedTestPix,
    setCurrentView,
    setDeliveryFeeInput,
    setEditingProduct,
    setIsProductModalOpen,
    setNewColorHex,
    setNewColorName,
    setNewStaffPasswordInput,
    setOrderSearchQuery,
    setOrderStatusFilter,
    setPCategory,
    setPColors,
    setPDescription,
    setPImage,
    setPIsPromo,
    setPName,
    setPPrice,
    setPPromoPrice,
    setPSizes,
    setPStock,
    setPasswordInput,
    setPixCityInput,
    setPixKeyInput,
    setPixKeyTypeInput,
    setPixNameInput,
    setStoreAddressInput,
    setTestPixCode,
    setTestPixQR,
    setWhatsappInput,
    settings,
    staffLogin,
    staffLogout,
    storeAddressInput,
    testPixCode,
    testPixQR,
    totalRevenue,
    updateOrderStatus,
    updateProduct,
    updateSettings,
    updateStock,
    whatsappInput,
  };
}

export type AdminState = ReturnType<typeof useAdminPanel>;
