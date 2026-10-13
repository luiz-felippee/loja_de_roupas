import { Lock } from 'lucide-react';
import type { AdminState } from './useAdminPanel';

export function AdminLogin({ a }: { a: AdminState }) {
  const { passwordInput, setCurrentView, setPasswordInput, staffLogin } = a;
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-[#141724] border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-black flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-white">Painel da Loja</h2>
            <p className="text-xs text-zinc-400">
              Acesso exclusivo para o dono e funcionários da Henrique Multimarcas.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              staffLogin(passwordInput);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Senha de Acesso da Equipe
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Digite a senha..."
                className="w-full bg-[#1b1f2e] border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                autoFocus
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] text-zinc-500">
                  Senha padrão da equipe: <strong className="text-amber-400">1234</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setPasswordInput('1234')}
                  className="text-[11px] text-amber-400 hover:underline font-semibold"
                >
                  Preencher 1234
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-sm rounded-xl transition-all shadow-md shadow-amber-500/20"
            >
              Entrar no Painel
            </button>
          </form>

          <div className="pt-4 border-t border-zinc-800 text-center">
            <button
              onClick={() => setCurrentView('shop')}
              className="text-xs text-zinc-400 hover:text-white transition-colors"
            >
              ← Voltar para a Loja Virtual
            </button>
          </div>
        </div>
      </div>
    );
}
