import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { calculateVirtualFit } from '../utils/fittingAndSizes';
import { Sparkles, X, Check, ArrowRight, Ruler, HelpCircle, Activity } from 'lucide-react';
import { ProductSize } from '../types';

export const VirtualFittingModal: React.FC = () => {
  const {
    isVirtualFittingOpen,
    setIsVirtualFittingOpen,
    virtualFittingProduct,
    setSelectedProduct,
    setIsSizeGuideOpen,
    addToast
  } = useStore();

  const [height, setHeight] = useState<number>(176);
  const [weight, setWeight] = useState<number>(78);
  const [fitPreference, setFitPreference] = useState<'slim' | 'regular' | 'oversized'>('regular');

  if (!isVirtualFittingOpen) return null;

  const product = virtualFittingProduct;
  const result = calculateVirtualFit(
    height,
    weight,
    fitPreference,
    product?.category || 'times'
  );

  const handleApplySize = (size: ProductSize) => {
    addToast(
      'Tamanho selecionado com sucesso!',
      `Tamanho ${size} configurado com base no seu perfil (${height}cm, ${weight}kg).`,
      'success'
    );
    setIsVirtualFittingOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-xl bg-[#131622] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800/80 bg-[#161a29] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Provador Virtual Inteligente
                </h3>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-400 text-black">
                  IA Fit
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {product ? `Calculando caimento para: ${product.name}` : 'Descubra sua numeração ideal em segundos'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsVirtualFittingOpen(false)}
            className="w-9 h-9 rounded-full bg-zinc-800/80 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            aria-label="Fechar provador virtual"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Sliders Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Height Slider */}
            <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-zinc-300">Sua Altura</span>
                <span className="text-sm font-extrabold text-amber-400 tabular-nums">
                  {height} cm <span className="text-[10px] text-zinc-500 font-normal">({(height / 100).toFixed(2)}m)</span>
                </span>
              </div>
              <input
                type="range"
                min="150"
                max="205"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                <span>1,50m</span>
                <span>1,75m</span>
                <span>2,05m</span>
              </div>
            </div>

            {/* Weight Slider */}
            <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-zinc-300">Seu Peso</span>
                <span className="text-sm font-extrabold text-amber-400 tabular-nums">
                  {weight} kg
                </span>
              </div>
              <input
                type="range"
                min="48"
                max="135"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                <span>48 kg</span>
                <span>80 kg</span>
                <span>135 kg</span>
              </div>
            </div>
          </div>

          {/* Fit Preference Selection */}
          <div>
            <label className="text-xs font-bold text-zinc-200 block mb-2.5">
              Como você prefere o caimento da peça no corpo?
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                {
                  id: 'slim' as const,
                  label: 'Justo / Slim Fit',
                  desc: 'Mais colado aos braços e peitoral'
                },
                {
                  id: 'regular' as const,
                  label: 'Normal / Regular',
                  desc: 'Caimento padrão confortável'
                },
                {
                  id: 'oversized' as const,
                  label: 'Solto / Oversized',
                  desc: 'Despojado com ombros caídos'
                }
              ].map((opt) => {
                const isSelected = fitPreference === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setFitPreference(opt.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-amber-400/15 border-amber-400 text-white ring-1 ring-amber-400/40 shadow-md'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${isSelected ? 'text-amber-300' : 'text-zinc-200'}`}>
                        {opt.label}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-tight">
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recommendation Result Card */}
          <div className="p-5 bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-950 border border-amber-400/40 rounded-3xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  Recomendação Personalizada
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-white">
                    Tamanho {result.recommendedSize}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {result.confidence}% de compatibilidade
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed pt-1">
                  {result.tip}
                </p>
              </div>

              {/* Apply Button */}
              <button
                onClick={() => handleApplySize(result.recommendedSize)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-amber-500/20 transition-all active:scale-98"
              >
                <span>Usar Tamanho {result.recommendedSize}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Estimated Measurements Summary */}
            <div className="mt-4 pt-3.5 border-t border-zinc-800/80 grid grid-cols-2 gap-3 text-[11px] text-zinc-400">
              <div>
                <span className="text-zinc-500 block">Tórax Estimado:</span>
                <span className="font-semibold text-zinc-200">{result.chestRecommendation}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Comprimento Ideal:</span>
                <span className="font-semibold text-zinc-200">{result.lengthRecommendation}</span>
              </div>
            </div>
          </div>

          {/* Quick link to Size Guide */}
          <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
            <button
              onClick={() => {
                setIsVirtualFittingOpen(false);
                setIsSizeGuideOpen(true);
              }}
              className="flex items-center gap-1.5 text-amber-400 hover:underline font-semibold"
            >
              <Ruler className="w-3.5 h-3.5" />
              Ver Tabela de Medidas Completa em Centímetros
            </button>

            <span className="text-[11px] text-zinc-500 hidden sm:inline flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              Troca grátis na primeira compra
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
