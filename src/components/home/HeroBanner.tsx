import React from 'react';
import { Store, Truck, CreditCard, ArrowDown } from 'lucide-react';
import { HERO_BANNER_IMAGE } from '../../data/initialProducts';

const irPara = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const BENEFICIOS = [
  { icone: Store, titulo: 'Retirada na loja', texto: 'Sem taxa, sem fila' },
  { icone: Truck, titulo: 'Entrega na cidade', texto: 'Frete fixo ou motoqueiro' },
  { icone: CreditCard, titulo: 'Pix, cartão ou dinheiro', texto: 'Você escolhe na hora de pagar' },
];

/** Topo da loja: uma mensagem, uma acao principal e os beneficios de compra. */
export const HeroBanner: React.FC = () => (
  <section className="relative overflow-hidden border-b border-zinc-800/80">
    <img
      src={HERO_BANNER_IMAGE}
      alt=""
      aria-hidden="true"
      className="absolute inset-0 w-full h-full object-cover opacity-25"
    />
    <div className="absolute inset-0 bg-gradient-to-b from-[#0c0e13]/40 via-[#0c0e13]/80 to-[#0c0e13]" />

    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10 sm:pt-20 sm:pb-16">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Coleção atual</p>
      <h1 className="mt-3 max-w-2xl text-4xl sm:text-6xl font-black leading-[1.05] tracking-tight text-white">
        Vista-se bem, sem esperar resposta no WhatsApp.
      </h1>
      <p className="mt-5 max-w-xl text-base sm:text-lg text-zinc-300 leading-relaxed">
        Escolha a cor e o tamanho, veja o estoque na hora e feche seu pedido em poucos minutos.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => irPara('catalogo-section')}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold transition-colors"
        >
          Ver catálogo
          <ArrowDown className="w-4 h-4" />
        </button>
        <button
          onClick={() => irPara('promocoes-section')}
          className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-zinc-700 hover:border-zinc-500 text-zinc-200 font-semibold transition-colors"
        >
          Ver promoções
        </button>
      </div>

      <ul className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-5 border-t border-zinc-800/80 pt-8">
        {BENEFICIOS.map(({ icone: Icone, titulo, texto }) => (
          <li key={titulo} className="flex items-start gap-3">
            <span className="shrink-0 w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Icone className="w-4 h-4 text-amber-400" />
            </span>
            <span>
              <span className="block text-sm font-bold text-white">{titulo}</span>
              <span className="block text-xs text-zinc-400 mt-0.5">{texto}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  </section>
);
