import React, { useEffect, useRef } from 'react';
import { Store, Truck, CreditCard, ArrowDown } from 'lucide-react';
import { SurfScene } from './SurfScene';

const irPara = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const BENEFICIOS = [
  { icone: Store, titulo: 'Retirada na loja', texto: 'Sem taxa, sem fila' },
  { icone: Truck, titulo: 'Entrega na cidade', texto: 'Frete fixo ou motoqueiro' },
  { icone: CreditCard, titulo: 'Pix, cartão ou dinheiro', texto: 'Você escolhe na hora de pagar' },
];

/**
 * Topo da loja com cena 3D. A secao e alta; a cena fica fixa na tela e
 * o progresso do scroll dentro da secao controla o surfista e a onda.
 */
export const HeroBanner: React.FC = () => {
  const secaoRef = useRef<HTMLElement>(null);
  const progressoRef = useRef(0);
  const textoRef = useRef<HTMLDivElement>(null);
  const dicaRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const atualizar = () => {
      const secao = secaoRef.current;
      if (!secao) return;
      const alcance = secao.offsetHeight - window.innerHeight;
      const rolado = -secao.getBoundingClientRect().top;
      const p = alcance > 0 ? Math.min(1, Math.max(0, rolado / alcance)) : 0;
      progressoRef.current = p;
      // Texto desaparece conforme o surfista avanca, para nao cobrir a cena
      const visivel = Math.max(0, 1 - Math.max(0, (p - 0.1) / 0.3));
      if (textoRef.current) textoRef.current.style.opacity = String(visivel);
      if (dicaRef.current) dicaRef.current.style.opacity = String(Math.max(0, 1 - p * 6));
    };
    atualizar();
    window.addEventListener('scroll', atualizar, { passive: true });
    window.addEventListener('resize', atualizar);
    return () => {
      window.removeEventListener('scroll', atualizar);
      window.removeEventListener('resize', atualizar);
    };
  }, []);

  return (
    <>
      <section ref={secaoRef} className="relative h-[190vh] bg-[#0c0e13]">
        <div className="sticky top-0 h-[100svh] min-h-[560px] overflow-hidden">
          <SurfScene progressoRef={progressoRef} />

          {/* Escurece a esquerda para o texto ler bem */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c0e13] via-[#0c0e13]/75 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0c0e13] to-transparent pointer-events-none" />

          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
            <div ref={textoRef} className="max-w-xl transition-opacity duration-100">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Coleção atual</p>
              <h1 className="mt-3 text-4xl sm:text-6xl font-black leading-[1.05] tracking-tight text-white">
                Vista-se bem, sem esperar resposta no WhatsApp.
              </h1>
              <p className="mt-5 text-base sm:text-lg text-zinc-300 leading-relaxed">
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
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-zinc-600 hover:border-zinc-400 text-zinc-100 font-semibold transition-colors backdrop-blur-sm"
                >
                  Ver promoções
                </button>
              </div>
            </div>
          </div>

          <p ref={dicaRef} className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[11px] uppercase tracking-[0.25em] text-zinc-300">
            Role para ver a onda
          </p>
        </div>
      </section>

      <ul className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-3 gap-5 border-b border-zinc-800/80">
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
