import React from 'react';
import { HERO_BANNER_IMAGE } from '../../data/initialProducts';
import { Truck, Store, CreditCard, ArrowDown, Mic } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const scrollToCatalog = () => {
    const el = document.getElementById('catalogo-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative overflow-hidden bg-[#0c0e12] border-b border-zinc-800">
      {/* Background Image with Cinematic Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={HERO_BANNER_IMAGE}
          alt="Loja Henrique Multimarcas"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-35 filter contrast-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e12] via-[#0c0e12]/70 to-[#0c0e12]/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-3xl">
          {/* Natural human editorial kicker (Anti-slop compliant) */}
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold tracking-wider uppercase mb-3">
            <span>Coleção Atual</span>
            <span aria-hidden="true">·</span>
            <span>Estoque Disponível</span>
            <span aria-hidden="true">·</span>
            <span>Vendas Automáticas</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight text-balance">
            Estilo esportivo e casual direto no seu guarda-roupa.
          </h1>

          <p className="mt-4 text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl">
            Chega de esperar resposta no direct do Instagram ou no WhatsApp para saber valor, tamanho e cor. Escolha sua peça, confira o estoque ao vivo e garanta sua compra em menos de 1 minuto.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              onClick={scrollToCatalog}
              className="px-6 py-3.5 text-sm font-bold text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 hover:translate-y-[-1px] active:translate-y-0"
            >
              Explorar Catálogo
              <ArrowDown className="w-4 h-4" />
            </button>

            <button
              onClick={scrollToCatalog}
              className="px-4.5 py-3.5 text-sm font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 rounded-xl transition-all flex items-center gap-2"
              title="Fale o nome da peça ou categoria"
            >
              <Mic className="w-4 h-4 text-amber-400" />
              Buscar por Voz
            </button>

            <a
              href="#promocoes-section"
              className="px-5 py-3.5 text-sm font-semibold text-zinc-300 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 hover:border-amber-400/50 rounded-xl transition-all"
            >
              Ver Ofertas
            </a>
          </div>

          {/* 3 Core Assurance Pillars */}
          <div className="mt-12 pt-8 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Retirada no Balcão</h4>
                <p className="text-xs text-zinc-400 mt-0.5">Pegue na loja sem fila e sem taxa de frete.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Entrega na Cidade</h4>
                <p className="text-xs text-zinc-400 mt-0.5">Frete fixo da loja ou chame seu motoqueiro.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Pix, Cartão ou Dinheiro</h4>
                <p className="text-xs text-zinc-400 mt-0.5">Pague online via Pix ou na entrega na maquininha.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
