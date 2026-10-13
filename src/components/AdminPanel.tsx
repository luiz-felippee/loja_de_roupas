import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, OrderStatus, ProductCategory, ProductSize } from '../types';
import { audioManager, soundEffects, AudioManager } from '../utils/audio';
import {
  ShieldCheck,
  Package,
  ShoppingBag,
  Settings,
  Plus,
  Volume2,
  Trash2,
  Edit,
  CheckCircle2,
  Clock,
  Truck,
  Store,
  ExternalLink,
  Lock,
  ArrowRight,
  LogOut,
  RefreshCw,
  Sparkles,
  FileSpreadsheet,
  QrCode,
  Copy,
  Check
} from 'lucide-react';
import { generatePixPayload, generatePixQRCode } from '../utils/pix';
import { DailyRevenueChart } from './DailyRevenueChart';

export const AdminPanel: React.FC = () => {
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
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'settings'>('orders');

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

  // If not logged in, show simple password screen
  if (!isStaffLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-[#141724] border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-black flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-white">Painel da Loja</h2>
            <p className="text-xs text-zinc-400">
              Acesso exclusivo para o dono e funcionários da Henrique Multimarcas.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              staffLogin(passwordInput);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Senha de Acesso da Equipe
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Digite a senha..."
                className="w-full bg-[#1b1f2e] border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                autoFocus
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] text-zinc-500">
                  Senha padrão da equipe: <strong className="text-amber-400">1234</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setPasswordInput('1234')}
                  className="text-[11px] text-amber-400 hover:underline font-semibold"
                >
                  Preencher 1234
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-sm rounded-xl transition-all shadow-md shadow-amber-500/20"
            >
              Entrar no Painel
            </button>
          </form>

          <div className="pt-4 border-t border-zinc-800 text-center">
            <button
              onClick={() => setCurrentView('shop')}
              className="text-xs text-zinc-400 hover:text-white transition-colors"
            >
              ← Voltar para a Loja Virtual
            </button>
          </div>
        </div>
      </div>
    );
  }

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
    });
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

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
      {/* Top Bar for Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></span>
            <h1 className="text-lg sm:text-2xl font-black text-white">
              Painel de Operações da Loja
            </h1>
            <span className="text-[10px] sm:text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
              Dono & Equipe
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-zinc-400 mt-1">
            Gestão unificada de novos pedidos, estoque, preços e aviso sonoro para a equipe.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <button
            onClick={exportTodayOrdersCSV}
            className="flex-1 sm:flex-initial px-3 sm:px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98 min-h-[40px]"
            title="Gera e baixa um arquivo CSV com código, valor total e forma de pagamento dos pedidos do dia"
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => setCurrentView('shop')}
            className="flex-1 sm:flex-initial px-3 sm:px-3.5 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-xs font-semibold rounded-xl border border-zinc-800 transition-colors flex items-center justify-center min-h-[40px]"
          >
            Ver Loja
          </button>

          <button
            onClick={staffLogout}
            className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors min-h-[40px]"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>

      {/* 4 Executive KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 my-4 sm:my-6">
        <div className="bg-[#141724] border border-zinc-800 rounded-xl sm:rounded-2xl p-3 sm:p-4">
          <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider block truncate">
            Faturamento Total
          </span>
          <div className="text-base sm:text-2xl font-black text-white mt-1 tabular-nums truncate">
            R$ {totalRevenue.toFixed(2).replace('.', ',')}
          </div>
          <span className="text-[10px] text-zinc-500 mt-0.5 block truncate">
            {orders.length} pedidos registrados
          </span>
        </div>

        <div className="bg-[#141724] border border-zinc-800 rounded-xl sm:rounded-2xl p-3 sm:p-4">
          <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider block truncate">
            Novos Pedidos
          </span>
          <div className="text-base sm:text-2xl font-black text-amber-400 mt-1 tabular-nums flex items-center gap-2 truncate">
            {newOrdersCount}
            {newOrdersCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
            )}
          </div>
          <span className="text-[10px] text-zinc-500 mt-0.5 block truncate">
            Aguardando separação
          </span>
        </div>

        <div className="bg-[#141724] border border-zinc-800 rounded-xl sm:rounded-2xl p-3 sm:p-4">
          <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider block truncate">
            Em Andamento
          </span>
          <div className="text-base sm:text-2xl font-black text-blue-400 mt-1 tabular-nums truncate">
            {pendingCount}
          </div>
          <span className="text-[10px] text-zinc-500 mt-0.5 block truncate">
            Novos ou separação
          </span>
        </div>

        <div className="bg-[#141724] border border-zinc-800 rounded-xl sm:rounded-2xl p-3 sm:p-4">
          <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider block truncate">
            Alerta Estoque
          </span>
          <div className="text-base sm:text-2xl font-black text-rose-400 mt-1 tabular-nums truncate">
            {lowStockCount}
          </div>
          <span className="text-[10px] text-zinc-500 mt-0.5 block truncate">
            Estoque ≤ 5 peças
          </span>
        </div>
      </div>

      {/* Gráfico de Barras Recharts: Faturamento Diário dos Últimos 7 Dias */}
      <DailyRevenueChart orders={orders} />

      {/* Audio Test & Notification Bar */}
      <div className="my-6 p-4 rounded-2xl bg-[#171b28] border border-amber-500/30 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              AudioManager Ativo (Howler.js)
              {newOrdersCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                  {newOrdersCount} NOVO(S) PEDIDO(S)
                </span>
              )}
            </h4>
            <p className="text-[11px] text-zinc-400">
              Notificação sonora instantânea ativada via <code className="text-amber-400 font-mono text-[10px]">AudioManager</code> sempre que um novo pedido é detectado no estado da fila.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSimulateNewOrder}
            className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center gap-1.5"
            title="Simula a criação de um pedido para testar o alerta sonoro em tempo real"
          >
            <Sparkles className="w-3.5 h-3.5 text-black" />
            Simular Chegada de Pedido
          </button>

          <button
            onClick={() => audioManager.playNewOrderAlert()}
            className="px-3 py-2 bg-zinc-900 hover:bg-zinc-850 text-amber-300 border border-amber-400/30 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
            title="Testa o toque de pedido recebido na loja"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            Testar Som Pedido Novo
          </button>

          <button
            onClick={() => audioManager.playStatusUpdateAlert()}
            className="px-3 py-2 bg-zinc-900 hover:bg-zinc-850 text-emerald-300 border border-emerald-400/30 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
            title="Testa o toque de atualização de etapa do cliente"
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            Testar Som Atualização
          </button>
        </div>
      </div>


      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'orders'
              ? 'bg-amber-400 text-black shadow-md shadow-amber-500/10'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Fila de Pedidos</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === 'orders' ? 'bg-black text-amber-300' : 'bg-zinc-800 text-zinc-300'
            }`}
          >
            {orders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'products'
              ? 'bg-amber-400 text-black shadow-md shadow-amber-500/10'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Catálogo & Estoque</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === 'products' ? 'bg-black text-amber-300' : 'bg-zinc-800 text-zinc-300'
            }`}
          >
            {products.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-amber-400 text-black shadow-md shadow-amber-500/10'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Configurações da Loja</span>
        </button>
      </div>

      {/* ===================== TAB 1: PEDIDOS ===================== */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Order Search & Stage Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#131622] p-3.5 rounded-2xl border border-zinc-800">
            {/* Stage filter buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {[
                { id: 'all', label: 'Todos', count: orders.length },
                { id: 'novo', label: 'Novos', count: newOrdersCount },
                { id: 'separacao', label: 'Em Separação', count: separacaoOrdersCount },
                { id: 'pronto', label: 'Prontos', count: prontoOrdersCount },
                { id: 'finalizado', label: 'Finalizados', count: finalizadoOrdersCount }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setOrderStatusFilter(f.id as OrderStatus | 'all')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    orderStatusFilter === f.id
                      ? 'bg-amber-400 text-black border-amber-300 font-bold shadow'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  <span>{f.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-black ${
                      orderStatusFilter === f.id
                        ? 'bg-black/20 text-black'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {f.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Action buttons and search */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-60">
                <input
                  type="text"
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  placeholder="Buscar por #código, nome..."
                  className="w-full bg-[#191d2c] border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
                {orderSearchQuery && (
                  <button
                    onClick={() => setOrderSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                onClick={exportTodayOrdersCSV}
                className="px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
                title="Exportar resumo de pedidos em formato CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">CSV do Dia</span>
              </button>
            </div>
          </div>

          {/* Orders Cards Grid */}
          {filteredOrders.length === 0 ? (
            <div className="bg-[#141724] border border-zinc-800 rounded-3xl p-12 text-center text-zinc-400 space-y-2">
              <ShoppingBag className="w-10 h-10 mx-auto text-zinc-600 mb-2" />
              <p className="text-sm font-bold text-white">Nenhum pedido nesta etapa</p>
              <p className="text-xs">Os pedidos feitos pelos clientes aparecem aqui instantaneamente.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredOrders.map((order) => {
                const isNovo = order.status === 'novo';
                const isSeparacao = order.status === 'separacao';
                const isPronto = order.status === 'pronto';
                const isFinalizado = order.status === 'finalizado';

                return (
                  <div
                    key={order.id}
                    className={`bg-[#151824] rounded-3xl border p-6 transition-all shadow-xl space-y-5 ${
                      isNovo
                        ? 'border-amber-400 ring-2 ring-amber-400/20'
                        : isSeparacao
                        ? 'border-blue-500/40'
                        : isPronto
                        ? 'border-emerald-500/40'
                        : 'border-zinc-800 opacity-80'
                    }`}
                  >
                    {/* Header of Order Card */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-lg font-black text-amber-400">
                            #{order.id}
                          </span>
                          <span
                            className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                              isNovo
                                ? 'bg-amber-400 text-black animate-pulse'
                                : isSeparacao
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : isPronto
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {order.status === 'novo' && 'Novo Pedido'}
                            {order.status === 'separacao' && 'Em Separação'}
                            {order.status === 'pronto' && 'Pronto'}
                            {order.status === 'finalizado' && 'Finalizado'}
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-500 mt-1 block">
                          Recebido às {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} ({new Date(order.createdAt).toLocaleDateString('pt-BR')})
                        </span>
                      </div>

                      {/* Total and Delete */}
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <span className="text-[10px] text-zinc-500 block uppercase">Total</span>
                          <span className="text-base font-extrabold text-white tabular-nums">
                            R$ {order.total.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteOrder(order.id)}
                          className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                          title="Excluir pedido"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Customer Private Data (Visible only to the store context) */}
                    <div className="bg-[#1a1e2d] border border-zinc-800/80 rounded-2xl p-4 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">
                          {order.customer.name}
                        </span>
                        <a
                          href={`https://wa.me/${order.customer.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                        >
                          {order.customer.phone}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <div className="text-zinc-300 text-[11px]">
                        <strong>Endereço:</strong> {order.customer.address}
                        {order.customer.neighborhood && ` · Bairro: ${order.customer.neighborhood}`}
                        {order.customer.reference && ` (${order.customer.reference})`}
                      </div>

                      <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px]">
                        <span className="text-zinc-400 flex items-center gap-1">
                          {order.deliveryType === 'retirada' ? (
                            <Store className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <Truck className="w-3.5 h-3.5 text-amber-400" />
                          )}
                          {order.deliveryType === 'retirada' && 'Retirada no Balcão'}
                          {order.deliveryType === 'entrega_loja' && 'Entrega pela Loja'}
                          {order.deliveryType === 'motoqueiro_cliente' && 'Motoqueiro do Cliente'}
                        </span>

                        <span className="text-zinc-300 font-semibold uppercase">
                          Pagamento: {order.paymentMethod}
                          {order.cashChangeFor && ` (Troco p/ R$ ${order.cashChangeFor.toFixed(2)})`}
                        </span>
                      </div>
                    </div>

                    {/* Products to Pick (Itens para separar) */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                        Peças para Separação ({order.items.length}):
                      </span>

                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800/80 p-2.5 rounded-xl text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={item.image}
                                alt={item.name}
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 rounded-lg object-cover bg-zinc-950 shrink-0"
                              />
                              <div>
                                <span className="font-bold text-white block">{item.name}</span>
                                <span className="text-[11px] text-amber-300">
                                  Cor: <strong>{item.color}</strong> · Tamanho: <strong>{item.size}</strong>
                                </span>
                              </div>
                            </div>

                            <span className="font-extrabold text-sm text-white px-2 py-1 bg-zinc-800 rounded-lg">
                              x{item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stage Transition Action Buttons */}
                    <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                      <div className="flex items-center gap-2">
                        {isNovo && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'separacao')}
                            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow"
                          >
                            <Clock className="w-4 h-4" />
                            Avançar para: Em Separação
                          </button>
                        )}

                        {isSeparacao && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'pronto')}
                            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Avançar para: Pronto p/ Entrega/Retirada
                          </button>
                        )}

                        {isPronto && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'finalizado')}
                            className="flex-1 py-2.5 bg-zinc-100 hover:bg-white text-black text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Concluir e Finalizar Pedido
                          </button>
                        )}

                        {isFinalizado && (
                          <div className="flex-1 py-2 text-xs text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            Pedido entregue e concluído
                          </div>
                        )}
                      </div>

                      {/* Manual stage override for corrections */}
                      <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                        <span>Alterar etapa manualmente:</span>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-[11px] text-zinc-300 focus:outline-none focus:border-amber-400"
                        >
                          <option value="novo">Novo Pedido</option>
                          <option value="separacao">Em Separação</option>
                          <option value="pronto">Pronto p/ Entrega ou Retirada</option>
                          <option value="finalizado">Finalizado</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 2: PRODUTOS & ESTOQUE ===================== */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Catálogo de Roupas & Estoque</h3>
              <p className="text-xs text-zinc-400">
                Cadastre novas peças, ajuste estoque instantaneamente ou crie promoções.
              </p>
            </div>

            <button
              onClick={handleOpenNewProduct}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Cadastrar Novo Produto
            </button>
          </div>

          {/* Table / List Container */}
          <div className="bg-[#141724] border border-zinc-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl">
            {/* Desktop Table View (hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#191d2c] border-b border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Produto</th>
                    <th className="py-3.5 px-4">Categoria</th>
                    <th className="py-3.5 px-4">Preço Normal</th>
                    <th className="py-3.5 px-4">Promoção</th>
                    <th className="py-3.5 px-4 text-center">Estoque</th>
                    <th className="py-3.5 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-zinc-850/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-lg object-cover bg-zinc-950 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-white block text-sm">{prod.name}</span>
                            <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-0.5">
                              <span>{prod.colors.map((c) => c.name).join(', ')}</span>
                              <span>·</span>
                              <span>{prod.sizes.join(', ')}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-zinc-300">
                        <span className="capitalize font-semibold">
                          {prod.category === 'times' ? 'Camisas de Times' : prod.category === 'polo' ? 'Polo' : prod.category === 'bermuda' ? 'Bermuda' : 'Regata'}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-zinc-200 tabular-nums">
                        R$ {prod.price.toFixed(2).replace('.', ',')}
                      </td>

                      <td className="py-3 px-4">
                        {prod.isPromo ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-amber-400 font-mono font-extrabold tabular-nums">
                              R$ {(prod.promoPrice ?? prod.price).toFixed(2).replace('.', ',')}
                            </span>
                            <button
                              onClick={() => updateProduct(prod.id, { isPromo: false })}
                              className="text-[10px] bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/20 hover:bg-amber-500/20"
                              title="Desativar promoção"
                            >
                              Ativa
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              updateProduct(prod.id, {
                                isPromo: true,
                                promoPrice: Math.round(prod.price * 0.85)
                              })
                            }
                            className="text-[11px] text-zinc-500 hover:text-amber-400 font-semibold"
                          >
                            + Criar Promo
                          </button>
                        )}
                      </td>

                      {/* Stock Quick Stepper */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => updateStock(prod.id, -1)}
                            className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold flex items-center justify-center"
                          >
                            -
                          </button>
                          <span
                            className={`w-10 text-center font-mono font-extrabold tabular-nums ${
                              prod.stock === 0
                                ? 'text-rose-400'
                                : prod.stock <= 5
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {prod.stock}
                          </span>
                          <button
                            onClick={() => updateStock(prod.id, 1)}
                            className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditProduct(prod)}
                            className="p-1.5 text-zinc-400 hover:text-amber-400 transition-colors"
                            title="Editar produto"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteProduct(prod.id)}
                            className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                            title="Excluir produto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Touch Cards View (visible strictly on mobile) */}
            <div className="md:hidden divide-y divide-zinc-800/80 p-3 space-y-3">
              {products.map((prod) => (
                <div key={prod.id} className="pt-3 first:pt-0 space-y-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-xl object-cover bg-zinc-950 shrink-0 border border-zinc-800"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-bold text-white text-sm line-clamp-1">
                          {prod.name}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleOpenEditProduct(prod)}
                            className="p-1.5 text-zinc-400 hover:text-amber-400 bg-zinc-900 border border-zinc-800 rounded-lg active:scale-95"
                            title="Editar produto"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteProduct(prod.id)}
                            className="p-1.5 text-zinc-500 hover:text-rose-400 bg-zinc-900 border border-zinc-800 rounded-lg active:scale-95"
                            title="Excluir produto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                        <span className="capitalize text-zinc-300 font-medium">
                          {prod.category === 'times' ? 'Times' : prod.category === 'polo' ? 'Polo' : prod.category === 'bermuda' ? 'Bermuda' : 'Regata'}
                        </span>
                        <span>·</span>
                        <span className="truncate">{prod.sizes.join(', ')}</span>
                      </div>

                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="font-mono font-bold text-white text-xs tabular-nums">
                          R$ {prod.price.toFixed(2).replace('.', ',')}
                        </span>
                        {prod.isPromo && prod.promoPrice && (
                          <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                            Promo: R$ {prod.promoPrice.toFixed(2).replace('.', ',')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Stock Stepper & Quick Promo Toggle */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800/60 bg-[#161a27] p-2.5 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-zinc-400 font-medium">Estoque:</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateStock(prod.id, -1)}
                          className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-90 text-white font-bold flex items-center justify-center text-sm"
                          aria-label="Diminuir estoque"
                        >
                          -
                        </button>
                        <span
                          className={`w-8 text-center font-mono font-black text-xs tabular-nums ${
                            prod.stock === 0
                              ? 'text-rose-400'
                              : prod.stock <= 5
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {prod.stock}
                        </span>
                        <button
                          onClick={() => updateStock(prod.id, 1)}
                          className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-90 text-white font-bold flex items-center justify-center text-sm"
                          aria-label="Aumentar estoque"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div>
                      {prod.isPromo ? (
                        <button
                          onClick={() => updateProduct(prod.id, { isPromo: false })}
                          className="text-[10px] bg-amber-500/15 text-amber-300 font-bold px-2 py-1 rounded-lg border border-amber-500/30 active:scale-95"
                        >
                          Promoção Ativa ✓
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            updateProduct(prod.id, {
                              isPromo: true,
                              promoPrice: Math.round(prod.price * 0.85)
                            })
                          }
                          className="text-[10px] text-zinc-400 hover:text-amber-300 font-semibold px-2 py-1 bg-zinc-800/80 rounded-lg border border-zinc-700 active:scale-95"
                        >
                          + Ativar Promo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 3: CONFIGURAÇÕES DA LOJA ===================== */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-[#141724] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Configurações da Henrique Multimarcas</h3>
            <p className="text-xs text-zinc-400">
              Ajuste taxa de entrega, chave Pix para pagamentos, contato e senha de equipe.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Taxa Fixa de Entrega na Cidade (R$)
              </label>
              <input
                type="number"
                step="0.5"
                value={deliveryFeeInput}
                onChange={(e) => setDeliveryFeeInput(e.target.value)}
                className="w-full bg-[#1b1f2e] border border-zinc-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Valor cobrado caso o cliente selecione Entrega da Loja.
              </span>
            </div>

            {/* Bloco Dedicado de Configuração do Pix */}
            <div className="p-5 rounded-2xl bg-[#191d2c] border border-amber-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Pagamento Pix Instantâneo
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Gera automaticamente QR Code e código Copia e Cola no checkout com o valor final do pedido.
                    </p>
                  </div>
                </div>
                {pixKeyInput.trim() ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Chave Ativa
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    Chave Pendente
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Tipo de Chave Pix *
                  </label>
                  <select
                    value={pixKeyTypeInput}
                    onChange={(e) =>
                      setPixKeyTypeInput(e.target.value as 'celular' | 'cpf_cnpj' | 'email' | 'aleatoria')
                    }
                    className="w-full bg-[#141622] border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="celular">Celular (com DDD)</option>
                    <option value="cpf_cnpj">CPF ou CNPJ</option>
                    <option value="email">E-mail</option>
                    <option value="aleatoria">Chave Aleatória (EVP)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Chave Pix da Loja *
                  </label>
                  <input
                    type="text"
                    value={pixKeyInput}
                    onChange={(e) => setPixKeyInput(e.target.value)}
                    placeholder={
                      pixKeyTypeInput === 'celular'
                        ? 'Ex: 11987654321'
                        : pixKeyTypeInput === 'cpf_cnpj'
                        ? 'Ex: 12345678000199'
                        : pixKeyTypeInput === 'email'
                        ? 'Ex: pix@henriquemultimarcas.com.br'
                        : 'Ex: 123e4567-e89b-12d3-a456-426614174000'
                    }
                    className="w-full bg-[#141622] border border-zinc-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Nome do Titular / Razão Social *
                  </label>
                  <input
                    type="text"
                    value={pixNameInput}
                    onChange={(e) => setPixNameInput(e.target.value)}
                    placeholder="Ex: Henrique Multimarcas ME"
                    className="w-full bg-[#141622] border border-zinc-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Cidade do Titular (Padrão BACEN EMV)
                  </label>
                  <input
                    type="text"
                    value={pixCityInput}
                    onChange={(e) => setPixCityInput(e.target.value)}
                    placeholder="Ex: SAO PAULO"
                    className="w-full bg-[#141622] border border-zinc-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Prévia em Tempo Real do Pix da Loja */}
              {testPixQR ? (
                <div className="mt-2 pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center gap-4 bg-[#11131c] p-3.5 rounded-xl border border-zinc-800">
                  <div className="bg-white p-2 rounded-xl shrink-0 shadow-md">
                    <img
                      src={testPixQR}
                      alt="Prévia do QR Code Pix"
                      className="w-24 h-24 object-contain block"
                    />
                  </div>
                  <div className="flex-1 space-y-1.5 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span className="text-xs font-bold text-white">Prévia do QR Code Dinâmico</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300">
                        Valor Teste: R$ 50,00
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      O cliente escaneia ou clica em copiar no checkout e o valor final já vem calculado automaticamente.
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (testPixCode) {
                            navigator.clipboard.writeText(testPixCode);
                            setCopiedTestPix(true);
                            addToast('Código Pix de teste copiado!', 'EMV padrão gerado com sucesso.', 'info');
                            setTimeout(() => setCopiedTestPix(false), 2500);
                          }
                        }}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        {copiedTestPix ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                        {copiedTestPix ? 'Copiado!' : 'Testar Copiar Código EMV'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-zinc-500 italic p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/60">
                  Preencha a chave Pix e titular para visualizar o QR Code de teste gerado em tempo real.
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                WhatsApp da Loja (com DDD, somente números)
              </label>
              <input
                type="text"
                value={whatsappInput}
                onChange={(e) => setWhatsappInput(e.target.value)}
                className="w-full bg-[#1b1f2e] border border-zinc-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Endereço da Loja Física (para Retirada no Balcão)
              </label>
              <input
                type="text"
                value={storeAddressInput}
                onChange={(e) => setStoreAddressInput(e.target.value)}
                className="w-full bg-[#1b1f2e] border border-zinc-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Senha de Acesso da Equipe (Dono e Funcionários)
              </label>
              <input
                type="text"
                value={newStaffPasswordInput}
                onChange={(e) => setNewStaffPasswordInput(e.target.value)}
                className="w-full bg-[#1b1f2e] border border-zinc-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white"
              />
            </div>

            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
              <button
                type="button"
                onClick={resetToDefaults}
                className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Restaurar Dados Padrão
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold rounded-xl transition-colors shadow-md"
              >
                Salvar Configurações
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===================== MODAL DE CADASTRO/EDIÇÃO DE PRODUTO ===================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl bg-[#141620] border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 my-6 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">
                {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nome da Peça *
                </label>
                <input
                  type="text"
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  placeholder="Ex: Camisa de Time Dry Pro"
                  className="w-full bg-[#1b1f2e] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value as ProductCategory)}
                    className="w-full bg-[#1b1f2e] border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white"
                  >
                    <option value="times">Camisas de Times</option>
                    <option value="polo">Camisas Polo</option>
                    <option value="bermuda">Bermudas</option>
                    <option value="regata">Camisas Regatas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Quantidade em Estoque *
                  </label>
                  <input
                    type="number"
                    value={pStock}
                    onChange={(e) => setPStock(e.target.value)}
                    className="w-full bg-[#1b1f2e] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Preço Normal (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    placeholder="130.00"
                    className="w-full bg-[#1b1f2e] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Preço Promocional (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={pPromoPrice}
                    onChange={(e) => setPPromoPrice(e.target.value)}
                    placeholder="115.00"
                    className="w-full bg-[#1b1f2e] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* Promo Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="promoCheck"
                  checked={pIsPromo}
                  onChange={(e) => setPIsPromo(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-amber-500"
                />
                <label htmlFor="promoCheck" className="text-xs font-semibold text-amber-400">
                  Ativar no Carrossel de Promoções da Semana
                </label>
              </div>

              {/* Photo Selector */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Foto do Produto
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={pImage}
                    onChange={(e) => setPImage(e.target.value)}
                    placeholder="/src/assets/images/..."
                    className="flex-1 bg-[#1b1f2e] border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                  />
                  <img
                    src={pImage || '/src/assets/images/polo_shirt_black_gold_1791857251704.jpg'}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-lg object-cover bg-zinc-900 shrink-0 border border-zinc-700"
                  />
                </div>
              </div>

              {/* Colors editor */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Cores Disponíveis
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {pColors.map((c, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200"
                    >
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.hex }} />
                      <span>{c.name}</span>
                      <button
                        type="button"
                        onClick={() => setPColors(pColors.filter((_, idx) => idx !== i))}
                        className="text-zinc-500 hover:text-rose-400 ml-1"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    placeholder="Nome da cor (ex: Rosa Choque)"
                    className="flex-1 bg-[#1b1f2e] border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-10 h-8 rounded-xl bg-transparent border-0 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newColorName.trim()) {
                        setPColors([...pColors, { name: newColorName.trim(), hex: newColorHex }]);
                        setNewColorName('');
                      }
                    }}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white rounded-xl"
                  >
                    + Cor
                  </button>
                </div>
              </div>

              {/* Sizes Selector */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Tamanhos Disponíveis
                </label>
                <div className="flex gap-2">
                  {(['P', 'M', 'G', 'GG'] as ProductSize[]).map((sz) => {
                    const isIncluded = pSizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          if (isIncluded) {
                            setPSizes(pSizes.filter((s) => s !== sz));
                          } else {
                            setPSizes([...pSizes, sz]);
                          }
                        }}
                        className={`w-10 h-9 rounded-xl text-xs font-bold border transition-colors ${
                          isIncluded
                            ? 'bg-amber-400 text-black border-amber-300'
                            : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Descrição
                </label>
                <textarea
                  value={pDescription}
                  onChange={(e) => setPDescription(e.target.value)}
                  rows={2}
                  placeholder="Informações sobre tecido, acabamento ou caimento..."
                  className="w-full bg-[#1b1f2e] border border-zinc-800 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-zinc-900 text-zinc-400 text-xs font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold rounded-xl shadow-md"
                >
                  Salvar Peça no Catálogo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
