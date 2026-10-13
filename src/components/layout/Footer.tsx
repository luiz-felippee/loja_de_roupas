import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Store, Phone, ShieldCheck, MapPin, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, setCurrentView } = useStore();

  return (
    <footer id="contato-section" className="bg-[#090b0e] border-t border-zinc-800/80 text-zinc-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-zinc-800/60">
          
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-400 text-black flex items-center justify-center font-extrabold text-sm">
                H
              </div>
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                Henrique <span className="text-amber-400">Multimarcas</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Sua loja de camisas de time, camisas polo, bermudas e regatas. Vendas ágeis na cidade sem espera de atendimento.
            </p>
          </div>

          {/* Store Location */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              Loja Física
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {settings.storeAddress}
            </p>
            <div className="text-[11px] text-zinc-500 flex items-center gap-1 pt-1">
              <Clock className="w-3 h-3 text-zinc-400" />
              Segunda a Sábado: 09h às 19h
            </div>
          </div>

          {/* Contact & WhatsApp */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              Atendimento Direto
            </h4>
            <a
              href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold"
            >
              WhatsApp da Loja: {settings.whatsapp}
            </a>
            <p className="text-[11px] text-zinc-500">
              Chave Pix: {settings.pixKey} ({settings.pixName})
            </p>
          </div>

          {/* Quick links & staff portal */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Área da Equipe
            </h4>
            <p className="text-[11px] text-zinc-400">
              Acesso restrito para dono e funcionários gerenciarem pedidos e estoque.
            </p>
            <button
              onClick={() => {
                setCurrentView('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-xs text-amber-400 hover:underline font-semibold flex items-center gap-1"
            >
              Abrir Painel da Loja (Staff) →
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <div>
            © {new Date().getFullYear()} Henrique Multimarcas. Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-4">
            <span>Retirada no Balcão</span>
            <span aria-hidden="true">·</span>
            <span>Entrega na Cidade</span>
            <span aria-hidden="true">·</span>
            <span>Pix, Cartão & Dinheiro</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
