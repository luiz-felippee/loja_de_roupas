import { OrderStatus } from '../../types';
import { ShoppingBag, Trash2, CheckCircle2, Clock, Truck, Store, ExternalLink, FileSpreadsheet } from 'lucide-react';
import type { AdminState } from './useAdminPanel';

export function OrdersTab({ a }: { a: AdminState }) {
  const { deleteOrder, exportTodayOrdersCSV, filteredOrders, finalizadoOrdersCount, newOrdersCount, orderSearchQuery, orderStatusFilter, orders, prontoOrdersCount, separacaoOrdersCount, setOrderSearchQuery, setOrderStatusFilter, updateOrderStatus } = a;
  return (
    <>
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
    </>
  );
}
