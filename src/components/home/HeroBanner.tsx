import React, { useState } from 'react';
import { Store, Truck, CreditCard, ArrowDown } from 'lucide-react';

const irPara = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// Arquivos em public/media/. Video curto, sem audio, 720p, idealmente abaixo de 5 MB.
const VIDEO = '/media/surf-hero.mp4';
const POSTER = '/media/surf-hero-poster.jpg';

const BENEFICIOS = [
  { icone: Store, titulo: 'Retirada na loja', texto: 'Sem taxa, sem fila' },
  { icone: Truck, titulo: 'Entrega na cidade', texto: 'Frete fixo ou motoqueiro' },
  { icone: CreditCard, titulo: 'Pix, cartão ou dinheiro', texto: 'Você escolhe na hora de pagar' },
];

/** Topo da loja com video de fundo. Se o video nao existir, fica um gradiente. */
export const HeroBanner: React.FC = () => {
  const [temVideo, setTemVideo] = useState(true);
  const reduzirMovimento = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <>
      <section className="relative h-[68svh] min-h-[440px] max-h-[720px] overflow-hidden bg-gradient-to-br from-[#0f4c5c] via-[#0b2a36] to-[#0c0e13]">
        {temVideo && (
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src={VIDEO}
            poster={POSTER}
            autoPlay={!reduzirMovimento}
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            onError={() => setTemVideo(false)}
          />
        )}

        {/* Escurece a esquerda para o texto ler bem */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0e13] via-[#0c0e13]/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0c0e13] to-transparent" />

        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Coleção atual</p>
            <h1 className="mt-3 text-3xl sm:text-5xl font-black leading-[1.08] tracking-tight text-white">
              Vista-se bem, sem esperar resposta no WhatsApp.
            </h1>
            <p className="mt-4 text-sm sm:text-base text-zinc-300 leading-relaxed">
              Escolha a cor e o tamanho, veja o estoque na hora e feche seu pedido em poucos minutos.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => irPara('catalogo-section')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold transition-colors"
              >
                Ver catálogo
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => irPara('promocoes-section')}
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-zinc-600 hover:border-zinc-400 text-zinc-100 font-semibold transition-colors backdrop-blur-sm"
              >
                Ver promoções
              </button>
            </div>
          </div>
        </div>
      </section>

      <ul className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-3 gap-5 border-b border-zinc-800/80">
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
    </>
  );
};
