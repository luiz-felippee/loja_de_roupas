import React from 'react';
import { useAdminPanel } from './admin/useAdminPanel';
import { AdminLogin } from './admin/AdminLogin';
import { OrdersTab } from './admin/OrdersTab';
import { ProductsTab } from './admin/ProductsTab';
import { SettingsTab } from './admin/SettingsTab';
import { ProductModal } from './admin/ProductModal';
import { DailyRevenueChart } from './DailyRevenueChart';
import { audioManager } from '../utils/audio';
import { Package, ShoppingBag, Settings, Volume2, LogOut, Sparkles, FileSpreadsheet } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const a = useAdminPanel();
  const { activeTab, exportTodayOrdersCSV, handleSimulateNewOrder, isProductModalOpen, isStaffLoggedIn, lowStockCount, newOrdersCount, orders, pendingCount, products, setActiveTab, setCurrentView, settings, staffLogout, totalRevenue } = a;

  if (!isStaffLoggedIn) {
    return <AdminLogin a={a} />;
  }

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

      {activeTab === 'orders' && <OrdersTab a={a} />}
      {activeTab === 'products' && <ProductsTab a={a} />}
      {activeTab === 'settings' && <SettingsTab a={a} />}

      {isProductModalOpen && <ProductModal a={a} />}
    </div>
  );
};
