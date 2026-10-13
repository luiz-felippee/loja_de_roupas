import { api } from '../../lib/api';
import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { DeliveryType, PaymentMethod, Customer } from '../../types';
import {
  X,
  Store,
  Truck,
  Bike,
  QrCode,
  CreditCard,
  Banknote,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { generatePixPayload, generatePixQRCode } from '../../utils/pix';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const {
    cart,
    cartSubtotal,
    settings,
    customer,
    createOrder,
    setCurrentView,
    setTrackingOrderId,
    addToast
  } = useStore();

  // Form states
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Dados, 2: Recebimento, 3: Pagamento & Resumo
  const [name, setName] = useState(customer?.name || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [address, setAddress] = useState(customer?.address || '');
  const [neighborhood, setNeighborhood] = useState(customer?.neighborhood || '');
  const [reference, setReference] = useState(customer?.reference || '');

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('retirada');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [needChange, setNeedChange] = useState(false);
  const [cashChangeFor, setCashChangeFor] = useState<string>('');

  const [copiedPixPayload, setCopiedPixPayload] = useState(false);
  const [copiedRawPixKey, setCopiedRawPixKey] = useState(false);
  const [pixQRCodeUrl, setPixQRCodeUrl] = useState<string>('');
  const [pixPayloadCode, setPixPayloadCode] = useState<string>('');
  const [isGeneratingPix, setIsGeneratingPix] = useState(false);
  const [showRawKeyOption, setShowRawKeyOption] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);

  const deliveryFee = deliveryType === 'entrega_loja' ? settings.deliveryFee : 0;
  // O desconto vem do servidor, que valida o cupom e recalcula o total
  const discount = appliedCouponCode ? appliedDiscount : 0;
  const total = Math.round((cartSubtotal - discount + deliveryFee) * 100) / 100;

  const aplicarCupom = async () => {
    try {
      const r = await api<{ ok: boolean; code?: string; discount?: number; motivo?: string }>('/coupons/validate', {
        body: { code: couponInput, subtotal: cartSubtotal },
      });
      if (!r.ok || !r.code) {
        setCouponError(r.motivo ?? 'Cupom inválido.');
        setAppliedCouponCode(null);
        setAppliedDiscount(0);
        return;
      }
      setCouponError(null);
      setAppliedCouponCode(r.code);
      setAppliedDiscount(r.discount ?? 0);
    } catch {
      setCouponError('Não foi possível validar o cupom agora. Tente de novo.');
    }
  };

  // Se o subtotal mudar, o desconto e validado de novo no servidor
  useEffect(() => {
    if (!appliedCouponCode) return;
    api<{ ok: boolean; discount?: number; motivo?: string }>('/coupons/validate', {
      body: { code: appliedCouponCode, subtotal: cartSubtotal },
    })
      .then((r) => {
        if (r.ok) {
          setAppliedDiscount(r.discount ?? 0);
        } else {
          setAppliedCouponCode(null);
          setAppliedDiscount(0);
          setCouponError(r.motivo ?? 'Este cupom deixou de valer.');
        }
      })
      .catch(() => undefined);
  }, [cartSubtotal, appliedCouponCode]);

  // Gera automaticamente o código Pix Copia e Cola EMV e o QR Code dinâmico com o valor final exato
  useEffect(() => {
    if (settings.pixKey && total > 0) {
      try {
        setIsGeneratingPix(true);
        const payload = generatePixPayload({
          pixKey: settings.pixKey,
          merchantName: settings.pixName || 'HENRIQUE MULTIMARCAS',
          merchantCity: settings.pixCity || 'SAO PAULO',
          amount: total,
          txid: 'HM' + Date.now().toString().slice(-6),
          description: 'Pedido Henrique Multimarcas'
        });
        setPixPayloadCode(payload);
        generatePixQRCode(payload)
          .then((url) => {
            setPixQRCodeUrl(url);
            setIsGeneratingPix(false);
          })
          .catch((err) => {
            console.error('Erro ao renderizar QR Code Pix:', err);
            setIsGeneratingPix(false);
          });
      } catch (err) {
        console.error('Erro ao construir payload Pix:', err);
        setIsGeneratingPix(false);
      }
    }
  }, [total, settings.pixKey, settings.pixName, settings.pixCity, paymentMethod]);

  const handleCopyPixCopiaECola = () => {
    if (!pixPayloadCode) return;
    navigator.clipboard.writeText(pixPayloadCode);
    setCopiedPixPayload(true);
    addToast(
      'Código Pix Copia e Cola copiado!',
      `Valor de R$ ${total.toFixed(2).replace('.', ',')} configurado. Cole no aplicativo do seu banco.`,
      'success'
    );
    setTimeout(() => setCopiedPixPayload(false), 3000);
  };

  const handleCopyRawPixKey = () => {
    navigator.clipboard.writeText(settings.pixKey);
    setCopiedRawPixKey(true);
    addToast('Chave Pix copiada!', settings.pixKey, 'info');
    setTimeout(() => setCopiedRawPixKey(false), 3000);
  };

  const validateStep1 = () => {
    if (!name.trim()) {
      addToast('Atenção', 'Informe seu nome completo.', 'alert');
      return false;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 8) {
      addToast('Atenção', 'Informe um telefone ou WhatsApp válido.', 'alert');
      return false;
    }
    if (deliveryType !== 'retirada' && !address.trim()) {
      addToast('Atenção', 'Informe seu endereço para entrega.', 'alert');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!validateStep1()) return;
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleConfirmOrder = async () => {
    if (!name.trim() || !phone.trim()) {
      addToast('Atenção', 'Preencha seus dados de contato.', 'alert');
      setStep(1);
      return;
    }

    if (deliveryType !== 'retirada' && !address.trim()) {
      addToast('Atenção', 'Preencha o endereço de entrega.', 'alert');
      setStep(1);
      return;
    }

    setIsSubmitting(true);

    const customerData: Customer = {
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim() || 'Retirada no Balcão da Loja',
      neighborhood: neighborhood.trim() || undefined,
      reference: reference.trim() || undefined
    };

    let pedido: { id: string; total: number };
    try {
      pedido = await createOrder({
        customer: customerData,
        paymentMethod,
        cashChangeFor: needChange && cashChangeFor ? parseFloat(cashChangeFor) : undefined,
        deliveryType,
        couponCode: appliedCouponCode ?? undefined
      });
    } catch (e) {
      setIsSubmitting(false);
      addToast('Não foi possível concluir o pedido', e instanceof Error ? e.message : 'Erro inesperado.', 'error');
      return;
    }

    // Fire joyful celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#10b981', '#3b82f6']
      });
    } catch {
      // ignore
    }

    setIsSubmitting(false);
    onClose();
    setTrackingOrderId(pedido.id);
    setCurrentView('tracking');
  };

  // Retorno antecipado so depois de todos os hooks (regra dos hooks do React)
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-xl bg-[#141620] border border-zinc-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-[#161925] shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              Finalizar Pedido
              <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Etapa {step} de 3
              </span>
            </h3>
            <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
              {step === 1 && 'Identificação e endereço de entrega'}
              {step === 2 && 'Escolha a forma de recebimento na cidade'}
              {step === 3 && 'Forma de pagamento e confirmação'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="grid grid-cols-3 bg-zinc-900 border-b border-zinc-800 text-[10px] sm:text-[11px] font-semibold text-center py-2 shrink-0">
          <div className={step >= 1 ? 'text-amber-400' : 'text-zinc-500'}>
            1. Seus Dados
          </div>
          <div className={step >= 2 ? 'text-amber-400' : 'text-zinc-500'}>
            2. Recebimento
          </div>
          <div className={step === 3 ? 'text-amber-400' : 'text-zinc-500'}>
            3. Pagamento
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {/* STEP 1: DADOS DO CLIENTE */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full bg-[#1b1e2b] border border-zinc-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  WhatsApp ou Telefone *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: (11) 99876-5432"
                  className="w-full bg-[#1b1e2b] border border-zinc-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                  required
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Usado apenas para avisos sobre a separação e entrega do seu pedido.
                </span>
              </div>

              <div className="pt-2 border-t border-zinc-800/80">
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Endereço Completo (Rua e Número) *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex: Rua São Paulo, 250 - Casa 2"
                  className="w-full bg-[#1b1e2b] border border-zinc-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Bairro
                  </label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="Ex: Centro"
                    className="w-full bg-[#1b1e2b] border border-zinc-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Ponto de Referência
                  </label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Ex: Próximo à praça central"
                    className="w-full bg-[#1b1e2b] border border-zinc-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: FORMA DE RECEBIMENTO */}
          {step === 2 && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-zinc-200 mb-2">
                Como você prefere receber suas peças?
              </label>

              {/* Option 1: Retirada na Loja */}
              <div
                onClick={() => setDeliveryType('retirada')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  deliveryType === 'retirada'
                    ? 'bg-[#1e2230] border-amber-400 shadow-md shadow-amber-500/10'
                    : 'bg-[#181b26] border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${deliveryType === 'retirada' ? 'bg-amber-400 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                  <Store className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">Retirada no Balcão da Loja</h4>
                    <span className="text-xs font-bold text-emerald-400">Grátis</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Você retira na nossa loja física após a separação: <strong className="text-zinc-200">{settings.storeAddress}</strong>.
                  </p>
                </div>
              </div>

              {/* Option 2: Entrega da Loja */}
              <div
                onClick={() => setDeliveryType('entrega_loja')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  deliveryType === 'entrega_loja'
                    ? 'bg-[#1e2230] border-amber-400 shadow-md shadow-amber-500/10'
                    : 'bg-[#181b26] border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${deliveryType === 'entrega_loja' ? 'bg-amber-400 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                  <Truck className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">Entrega Padrão da Loja</h4>
                    <span className="text-xs font-bold text-amber-400 tabular-nums">
                      + R$ {settings.deliveryFee.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Nossa equipe envia diretamente para o endereço informado ({address || 'endereço cadastrado'}).
                  </p>
                </div>
              </div>

              {/* Option 3: Motoqueiro do Cliente */}
              <div
                onClick={() => setDeliveryType('motoqueiro_cliente')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  deliveryType === 'motoqueiro_cliente'
                    ? 'bg-[#1e2230] border-amber-400 shadow-md shadow-amber-500/10'
                    : 'bg-[#181b26] border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${deliveryType === 'motoqueiro_cliente' ? 'bg-amber-400 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                  <Bike className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">Vou Chamar Meu Próprio Motoqueiro</h4>
                    <span className="text-xs font-bold text-emerald-400">R$ 0,00 na loja</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Você solicita Uber Moto / 99 / motoboy particular para retirar na loja assim que o pedido estiver pronto.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: FORMA DE PAGAMENTO & RESUMO */}
          {step === 3 && (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-zinc-200">
                Forma de Pagamento
              </label>

              <div className="grid grid-cols-3 gap-2.5">
                {/* Pix */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    paymentMethod === 'pix'
                      ? 'bg-[#1e2230] border-amber-400 text-amber-300'
                      : 'bg-[#181b26] border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  <span className="text-xs font-bold">Pix</span>
                </button>

                {/* Cartão */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cartao')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    paymentMethod === 'cartao'
                      ? 'bg-[#1e2230] border-amber-400 text-amber-300'
                      : 'bg-[#181b26] border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs font-bold">Cartão</span>
                </button>

                {/* Dinheiro */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('dinheiro')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    paymentMethod === 'dinheiro'
                      ? 'bg-[#1e2230] border-amber-400 text-amber-300'
                      : 'bg-[#181b26] border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Banknote className="w-5 h-5" />
                  <span className="text-xs font-bold">Dinheiro</span>
                </button>
              </div>

              {/* Payment Details: PIX DINÂMICO COM QR CODE E COPIA E COLA */}
              {paymentMethod === 'pix' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#191d2c] border border-amber-500/40 space-y-4 shadow-xl shadow-amber-500/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-400 text-black flex items-center justify-center font-bold">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">
                          Pix Automático com Valor do Pedido
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          Beneficiário: <strong className="text-zinc-200">{settings.pixName}</strong>
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-400 block uppercase">Valor a Pagar</span>
                      <span className="text-sm font-black text-amber-400 tabular-nums">
                        R$ {total.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  {/* QR Code Container */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#11131c] p-4 rounded-2xl border border-zinc-800">
                    <div className="relative bg-white p-2.5 rounded-2xl shrink-0 shadow-lg border border-amber-400/30">
                      {isGeneratingPix ? (
                        <div className="w-36 h-36 flex flex-col items-center justify-center text-zinc-800 gap-2">
                          <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
                          <span className="text-[10px] font-semibold text-zinc-600">Gerando QR Code...</span>
                        </div>
                      ) : pixQRCodeUrl ? (
                        <img
                          src={pixQRCodeUrl}
                          alt="QR Code Pix do Pedido"
                          className="w-36 h-36 object-contain block rounded-lg"
                        />
                      ) : (
                        <div className="w-36 h-36 flex flex-col items-center justify-center text-zinc-800 text-center p-2">
                          <QrCode className="w-8 h-8 text-zinc-400 mb-1" />
                          <span className="text-[10px] text-zinc-500">Cadastre a chave Pix no painel da loja</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" /> QR Code Dinâmico Atualizado
                      </div>
                      <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                        Abra o app do seu banco, escolha <strong>Pix</strong> e aponte a câmera para escanear. O valor exato de <strong className="text-amber-400">R$ {total.toFixed(2).replace('.', ',')}</strong> já estará preenchido!
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {deliveryType === 'entrega_loja'
                          ? `(Peças: R$ ${cartSubtotal.toFixed(2).replace('.', ',')} + Frete: R$ ${settings.deliveryFee.toFixed(2).replace('.', ',')})`
                          : '(Sem taxa de entrega adicional)'}
                      </p>
                    </div>
                  </div>

                  {/* Pix Copia e Cola */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                        <Copy className="w-3.5 h-3.5 text-amber-400" />
                        Código Pix Copia e Cola (EMV)
                      </span>
                      <span className="text-[10px] text-zinc-400">Pague no celular sem câmera</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-black/70 px-3 py-2 rounded-xl text-xs font-mono text-amber-300 truncate border border-zinc-800 select-all">
                        {pixPayloadCode || settings.pixKey}
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyPixCopiaECola}
                        disabled={!pixPayloadCode}
                        className="px-4 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black text-xs font-black rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 shrink-0 active:scale-95"
                      >
                        {copiedPixPayload ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-950 stroke-[3]" />
                            <span>Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copiar Pix Copia e Cola</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Chave Pix Simples (Alternativa) */}
                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setShowRawKeyOption(!showRawKeyOption)}
                      className="text-[11px] text-zinc-400 hover:text-amber-400 underline underline-offset-2 transition-colors"
                    >
                      {showRawKeyOption ? 'Ocultar chave Pix simples' : 'Prefere pagar digitando a chave Pix manual?'}
                    </button>
                    {showRawKeyOption && (
                      <button
                        type="button"
                        onClick={handleCopyRawPixKey}
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                      >
                        {copiedRawPixKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedRawPixKey ? 'Chave Copiada!' : `Copiar chave: ${settings.pixKey}`}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {paymentMethod === 'cartao' && (
                <div className="p-4 rounded-2xl bg-[#1b1f2b] border border-zinc-800 text-xs text-zinc-300 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    Maquininha Presencial
                  </div>
                  <p className="text-zinc-400">
                    Aceitamos débito e crédito (Visa, Mastercard, Elo, Hipercard). Levamos a maquininha na entrega ou passamos no balcão da loja.
                  </p>
                </div>
              )}

              {paymentMethod === 'dinheiro' && (
                <div className="p-4 rounded-2xl bg-[#1b1f2b] border border-zinc-800 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="changeCheckbox"
                      checked={needChange}
                      onChange={(e) => setNeedChange(e.target.checked)}
                      className="rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-0"
                    />
                    <label htmlFor="changeCheckbox" className="font-semibold text-zinc-200">
                      Vou precisar de troco em dinheiro
                    </label>
                  </div>

                  {needChange && (
                    <div className="pt-2">
                      <label className="block text-[11px] text-zinc-400 mb-1">
                        Troco para quanto em dinheiro?
                      </label>
                      <input
                        type="number"
                        value={cashChangeFor}
                        onChange={(e) => setCashChangeFor(e.target.value)}
                        placeholder={`Ex: R$ ${(total + 20).toFixed(0)}`}
                        className="w-full bg-black/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Order Summary Receipt Box */}
              <div className="p-4 rounded-2xl bg-black/40 border border-zinc-800/90 space-y-2 text-xs">
                <div className="font-bold text-zinc-200 pb-1 border-b border-zinc-800/80">
                  Resumo do Pedido ({cart.length} itens)
                </div>

                <div className="space-y-1 text-zinc-400">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span className="truncate max-w-[240px]">
                        {item.quantity}x {item.name} ({item.color} - {item.size})
                      </span>
                      <span className="tabular-nums text-zinc-300">
                        R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Cupom de desconto"
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400/60"
                      aria-label="Código do cupom"
                    />
                    <button
                      type="button"
                      onClick={aplicarCupom}
                      disabled={!couponInput.trim()}
                      className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl"
                    >
                      Aplicar
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] text-rose-400">{couponError}</p>}
                </div>

                <div className="pt-2 border-t border-zinc-800/80 space-y-1">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal das peças:</span>
                    <span className="tabular-nums">R$ {cartSubtotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Cupom {appliedCouponCode ?? ''}:</span>
                      <span className="tabular-nums">- R$ {discount.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-zinc-400">
                    <span>Frete / Recebimento:</span>
                    <span className="tabular-nums">
                      {deliveryFee === 0 ? 'Grátis' : `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-amber-400 pt-1 border-t border-zinc-800">
                    <span>Valor Total:</span>
                    <span className="tabular-nums">R$ {total.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-3.5 sm:p-5 border-t border-zinc-800 bg-[#161925] flex items-center justify-between gap-2 shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as 1 | 2)}
              className="px-3 sm:px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl border border-zinc-800 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
          ) : (
            <div className="text-[10px] sm:text-[11px] text-zinc-500 flex items-center gap-1 truncate">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">Compra Segura</span>
            </div>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-4 sm:px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 shrink-0 ml-auto"
            >
              <span>Avançar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirmOrder}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-extrabold rounded-xl transition-all shadow-lg shadow-amber-500/30 flex items-center gap-1.5 sm:gap-2 active:scale-98 shrink-0 ml-auto"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="truncate">Confirmar (R$ {total.toFixed(2).replace('.', ',')})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
