import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { OrderStatus } from '../../types';
import {
  Search,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  Store,
  ExternalLink,
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  MapPin,
  Sparkles,
  QrCode,
  Copy,
  Check
} from 'lucide-react';
import { generatePixPayload, generatePixQRCode } from '../../utils/pix';

export const OrderTrackingView: React.FC = () => {
  const {
    orders,
    trackingOrderId,
    setTrackingOrderId,
    setCurrentView,
    settings,
    customer,
    addToast
  } = useStore();

  const [searchInput, setSearchInput] = useState(trackingOrderId || '');

  // Find currently selected order
  const currentOrder = orders.find(
    (o) => o.id.toLowerCase() === (trackingOrderId || searchInput).trim().toLowerCase()
  );

  // Recent orders for the user
  const recentOrders = orders.filter((o) => {
    if (!customer?.phone) return true;
    return o.customer.phone === customer.phone || o.id === trackingOrderId;
  });

  const [showPixDetails, setShowPixDetails] = useState(false);
  const [trackingPixQR, setTrackingPixQR] = useState('');
  const [trackingPixCode, setTrackingPixCode] = useState('');
  const [copiedTrackingPix, setCopiedTrackingPix] = useState(false);

  useEffect(() => {
    if (currentOrder && currentOrder.paymentMethod === 'pix' && settings.pixKey) {
      try {
        const payload = generatePixPayload({
          pixKey: settings.pixKey,
          merchantName: settings.pixName || 'HENRIQUE MULTIMARCAS',
          merchantCity: settings.pixCity || 'SAO PAULO',
          amount: currentOrder.total,
          txid: currentOrder.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 25),
          description: `Pedido ${currentOrder.id}`
        });
        setTrackingPixCode(payload);
        generatePixQRCode(payload)
          .then((url) => setTrackingPixQR(url))
          .catch(() => setTrackingPixQR(''));
      } catch {
        setTrackingPixCode('');
        setTrackingPixQR('');
      }
    }
  }, [currentOrder, settings.pixKey, settings.pixName, settings.pixCity]);

  const stages: { key: OrderStatus; label: string; desc: string }[] = [
    {
      key: 'novo',
      label: 'Novo Pedido',
      desc: 'Recebido pela Henrique Multimarcas'
    },
    {
      key: 'separacao',
      label: 'Em Separação',
      desc: 'Conferindo tamanho, cor e embalando'
    },
    {
      key: 'pronto',
      label: 'Pronto p/ Entrega/Retirada',
      desc: 'Disponível no balcão ou com o entregador'
    },
    {
      key: 'finalizado',
      label: 'Finalizado',
      desc: 'Entregue com sucesso ao cliente'
    }
  ];

  const getStageIndex = (status: OrderStatus) => {
    return stages.findIndex((s) => s.key === status);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setTrackingOrderId(searchInput.trim().toUpperCase());
    }
  };

  // WhatsApp pre-filled message link
  const getWhatsAppLink = (orderId: string, total: number) => {
    const text = encodeURIComponent(
      `Olá Henrique Multimarcas! Gostaria de falar sobre o meu pedido #${orderId} no valor de R$ ${total.toFixed(2).replace('.', ',')}.`
    );
    return `https://wa.me/${settings.whatsapp.replace(/\D/g, '')}?text=${text}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-12">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <button
          onClick={() => setCurrentView('shop')}
          className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors p-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para a Loja
        </button>

        <span className="text-[11px] sm:text-xs text-amber-400 font-semibold uppercase tracking-wider">
          Acompanhamento em Tempo Real
        </span>
      </div>

      {/* Search Order by Code Card */}
      <div className="bg-[#141722] border border-zinc-800 rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8 shadow-lg">
        <h2 className="text-sm sm:text-base font-bold text-white mb-1.5">
          Consultar Pedido por Código
        </h2>
        <p className="text-xs text-zinc-400 mb-4">
          Digite o código que você recebeu na finalização da compra (ex: <span className="font-mono text-amber-300">HM-1082</span>).
        </p>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
              placeholder="Digite o código (ex: HM-1082)"
              className="w-full bg-[#1b1f2e] border border-zinc-800 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white uppercase placeholder-zinc-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 sm:px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold rounded-xl transition-colors shrink-0"
          >
            Buscar
          </button>
        </form>

        {/* Quick Recent Order Chips */}
        {recentOrders.length > 0 && (
          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-zinc-500">Seus pedidos recentes:</span>
            {recentOrders.slice(0, 4).map((o) => (
              <button
                key={o.id}
                onClick={() => {
                  setSearchInput(o.id);
                  setTrackingOrderId(o.id);
                }}
                className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all ${
                  currentOrder?.id === o.id
                    ? 'bg-amber-400 text-black border-amber-300 font-bold'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                #{o.id}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Order Status Display */}
      {currentOrder ? (
        <div className="space-y-6">
          {/* Main Status Timeline Card */}
          <div className="bg-[#151824] border border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xl sm:text-2xl font-extrabold text-amber-400">
                    #{currentOrder.id}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
                    Etapa Atual
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Realizado em {new Date(currentOrder.createdAt).toLocaleDateString('pt-BR')} às {new Date(currentOrder.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {/* WhatsApp Support CTA */}
              <a
                href={getWhatsAppLink(currentOrder.id, currentOrder.total)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all self-start sm:self-auto"
              >
                <span>Falar no WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Stepper Progress Bar */}
            <div className="py-5 sm:py-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 relative">
                {stages.map((stage, idx) => {
                  const currentIdx = getStageIndex(currentOrder.status);
                  const isDone = idx < currentIdx;
                  const isCurrent = idx === currentIdx;
                  const isPending = idx > currentIdx;

                  return (
                    <div
                      key={stage.key}
                      className={`relative p-4 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'bg-[#1e2333] border-amber-400 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/30'
                          : isDone
                          ? 'bg-[#161a25] border-emerald-500/40 text-emerald-300'
                          : 'bg-[#12141c] border-zinc-850 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                          Passo 0{idx + 1}
                        </span>
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : isCurrent ? (
                          <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                        ) : (
                          <div className="w-3 h-3 rounded-full bg-zinc-800" />
                        )}
                      </div>

                      <h4
                        className={`text-sm font-bold leading-tight ${
                          isCurrent
                            ? 'text-white'
                            : isDone
                            ? 'text-emerald-200'
                            : 'text-zinc-400'
                        }`}
                      >
                        {stage.label}
                      </h4>
                      <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                        {stage.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Current Stage Guidance Message */}
            <div className="p-4 rounded-2xl bg-[#1b1f2e] border border-amber-500/20 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs leading-relaxed">
                <strong className="text-white block font-semibold">
                  {currentOrder.status === 'novo' && 'Pedido aguardando separação da equipe.'}
                  {currentOrder.status === 'separacao' && 'A equipe da Henrique Multimarcas está separando suas peças no estoque!'}
                  {currentOrder.status === 'pronto' && (
                    currentOrder.deliveryType === 'retirada'
                      ? 'Seu pedido já está pronto para retirada no balcão da loja!'
                      : 'Seu pedido está pronto e saiu com o entregador!'
                  )}
                  {currentOrder.status === 'finalizado' && 'Pedido concluído com sucesso. Obrigado pela preferência!'}
                </strong>
                <span className="text-zinc-400 mt-0.5 block">
                  Última atualização registrada: {new Date(currentOrder.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.
                </span>
              </div>
            </div>
          </div>

          {/* Order Details & Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Items Purchased */}
            <div className="bg-[#151824] border border-zinc-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                Peças Compradas ({currentOrder.items.length})
              </h3>

              <div className="space-y-3">
                {currentOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/60"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-lg object-cover bg-zinc-950 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Cor: {item.color} · Tam: {item.size}
                      </p>
                      <div className="flex justify-between items-center mt-1 text-xs">
                        <span className="text-zinc-400">Qtd: {item.quantity}</span>
                        <span className="font-bold text-amber-400 tabular-nums">
                          R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="pt-3 border-t border-zinc-800 space-y-1.5 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="tabular-nums">R$ {currentOrder.subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de Entrega:</span>
                  <span className="tabular-nums">
                    {currentOrder.deliveryFee === 0 ? 'Grátis' : `R$ ${currentOrder.deliveryFee.toFixed(2).replace('.', ',')}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-zinc-800">
                  <span>Total do Pedido:</span>
                  <span className="text-amber-400 tabular-nums">
                    R$ {currentOrder.total.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery & Payment Info */}
            <div className="bg-[#151824] border border-zinc-800 rounded-3xl p-6 space-y-5">
              {/* Delivery mode */}
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                  {currentOrder.deliveryType === 'retirada' ? (
                    <Store className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Truck className="w-4 h-4 text-amber-400" />
                  )}
                  Forma de Recebimento
                </h3>
                <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-xs space-y-1">
                  <div className="font-semibold text-white">
                    {currentOrder.deliveryType === 'retirada' && 'Retirada no Balcão da Loja'}
                    {currentOrder.deliveryType === 'entrega_loja' && 'Entrega da Loja Henrique Multimarcas'}
                    {currentOrder.deliveryType === 'motoqueiro_cliente' && 'Motoqueiro Próprio do Cliente'}
                  </div>
                  <p className="text-zinc-400">
                    {currentOrder.deliveryType === 'retirada'
                      ? settings.storeAddress
                      : `${currentOrder.customer.address} - ${currentOrder.customer.neighborhood || ''}`}
                  </p>
                  {currentOrder.customer.reference && (
                    <p className="text-[11px] text-zinc-500">
                      Ref: {currentOrder.customer.reference}
                    </p>
                  )}
                </div>
              </div>

              {/* Payment method */}
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  Forma de Pagamento
                </h3>
                <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white uppercase flex items-center gap-1.5">
                      {currentOrder.paymentMethod === 'pix' && <QrCode className="w-3.5 h-3.5 text-amber-400" />}
                      {currentOrder.paymentMethod}
                    </span>
                    {currentOrder.paymentMethod === 'pix' && trackingPixQR && (
                      <button
                        type="button"
                        onClick={() => setShowPixDetails(!showPixDetails)}
                        className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline"
                      >
                        {showPixDetails ? 'Ocultar Pix' : 'Ver QR Code / Copiar Pix'}
                      </button>
                    )}
                  </div>
                  <p className="text-zinc-400">
                    {currentOrder.paymentMethod === 'pix' && 'Pagamento via Pix instantâneo'}
                    {currentOrder.paymentMethod === 'cartao' && 'Maquininha de cartão na entrega ou retirada'}
                    {currentOrder.paymentMethod === 'dinheiro' && (
                      currentOrder.cashChangeFor
                        ? `Dinheiro (Troco para R$ ${currentOrder.cashChangeFor.toFixed(2).replace('.', ',')})`
                        : 'Dinheiro (sem troco)'
                    )}
                  </p>

                  {/* Detalhes do Pix se selecionado */}
                  {currentOrder.paymentMethod === 'pix' && showPixDetails && trackingPixQR && (
                    <div className="mt-3 pt-3 border-t border-zinc-800/80 space-y-3 bg-[#11131c] p-3 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-1.5 rounded-xl shrink-0 shadow">
                          <img
                            src={trackingPixQR}
                            alt="QR Code Pix do Pedido"
                            className="w-24 h-24 object-contain block"
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <span className="text-xs font-bold text-white block">
                            Pix deste Pedido
                          </span>
                          <span className="text-[11px] text-amber-400 font-black block tabular-nums">
                            R$ {currentOrder.total.toFixed(2).replace('.', ',')}
                          </span>
                          <p className="text-[10px] text-zinc-400">
                            Titular: {settings.pixName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-black/60 px-2.5 py-1.5 rounded-lg text-[11px] font-mono text-amber-300 truncate border border-zinc-800">
                          {trackingPixCode || settings.pixKey}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(trackingPixCode || settings.pixKey);
                            setCopiedTrackingPix(true);
                            addToast('Pix Copia e Cola copiado!', 'Cole no seu aplicativo do banco.', 'success');
                            setTimeout(() => setCopiedTrackingPix(false), 3000);
                          }}
                          className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-black text-[11px] font-bold rounded-lg flex items-center gap-1 shrink-0"
                        >
                          {copiedTrackingPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedTrackingPix ? 'Copiado!' : 'Copiar Pix'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer */}
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  Dados do Comprador
                </h3>
                <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-xs text-zinc-300">
                  <p><strong>Nome:</strong> {currentOrder.customer.name}</p>
                  <p><strong>WhatsApp:</strong> {currentOrder.customer.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#141722] border border-zinc-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-600">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white">Nenhum pedido selecionado</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Informe o código do seu pedido acima ou confira a lista de pedidos recentes para acompanhar a separação.
          </p>
          <button
            onClick={() => setCurrentView('shop')}
            className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl transition-colors"
          >
            Voltar às Compras
          </button>
        </div>
      )}
    </div>
  );
};
