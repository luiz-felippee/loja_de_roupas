import { CheckCircle2, RefreshCw, QrCode, Copy, Check } from 'lucide-react';
import type { AdminState } from './useAdminPanel';

export function SettingsTab({ a }: { a: AdminState }) {
  const { addToast, copiedTestPix, deliveryFeeInput, handleSaveSettings, newStaffPasswordInput, pixCityInput, pixKeyInput, pixKeyTypeInput, pixNameInput, resetToDefaults, setCopiedTestPix, setDeliveryFeeInput, setNewStaffPasswordInput, setPixCityInput, setPixKeyInput, setPixKeyTypeInput, setPixNameInput, setStoreAddressInput, setWhatsappInput, storeAddressInput, testPixCode, testPixQR, whatsappInput } = a;
  return (
    <>
      <div className="max-w-2xl bg-[#0f1d3b] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
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
              className="w-full bg-[#142a52] border border-zinc-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white"
            />
            <span className="text-[10px] text-zinc-500 mt-1 block">
              Valor cobrado caso o cliente selecione Entrega da Loja.
            </span>
          </div>

          {/* Bloco Dedicado de Configuração do Pix */}
          <div className="p-5 rounded-2xl bg-[#142a52] border border-amber-500/30 space-y-4">
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
                  className="w-full bg-[#0f1d3b] border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white"
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
                  className="w-full bg-[#0f1d3b] border border-zinc-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
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
                  className="w-full bg-[#0f1d3b] border border-zinc-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-white"
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
                  className="w-full bg-[#0f1d3b] border border-zinc-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>
            </div>

            {/* Prévia em Tempo Real do Pix da Loja */}
            {testPixQR ? (
              <div className="mt-2 pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center gap-4 bg-[#0a1528] p-3.5 rounded-xl border border-zinc-800">
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
              className="w-full bg-[#142a52] border border-zinc-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white"
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
              className="w-full bg-[#142a52] border border-zinc-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white"
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
    </>
  );
}
