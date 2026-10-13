import { ProductCategory, ProductSize } from '../../types';
import type { AdminState } from './useAdminPanel';

export function ProductModal({ a }: { a: AdminState }) {
  const { editingProduct, handleSaveProduct, newColorHex, newColorName, pCategory, pColors, pDescription, pImage, pIsPromo, pName, pPrice, pPromoPrice, pSizes, pStock, setIsProductModalOpen, setNewColorHex, setNewColorName, setPCategory, setPColors, setPDescription, setPImage, setPIsPromo, setPName, setPPrice, setPPromoPrice, setPSizes, setPStock } = a;
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <div className="relative w-full max-w-xl bg-[#141620] border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 my-6 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h3 className="text-base font-bold text-white">
              {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
            </h3>
            <button
              onClick={() => setIsProductModalOpen(false)}
              className="text-zinc-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSaveProduct} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Nome da Peça *
              </label>
              <input
                type="text"
                value={pName}
                onChange={(e) => setPName(e.target.value)}
                placeholder="Ex: Camisa de Time Dry Pro"
                className="w-full bg-[#1b1f2e] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Categoria *
                </label>
                <select
                  value={pCategory}
                  onChange={(e) => setPCategory(e.target.value as ProductCategory)}
                  className="w-full bg-[#1b1f2e] border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white"
                >
                  <option value="times">Camisas de Times</option>
                  <option value="polo">Camisas Polo</option>
                  <option value="bermuda">Bermudas</option>
                  <option value="regata">Camisas Regatas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Quantidade em Estoque *
                </label>
                <input
                  type="number"
                  value={pStock}
                  onChange={(e) => setPStock(e.target.value)}
                  className="w-full bg-[#1b1f2e] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Preço Normal (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={pPrice}
                  onChange={(e) => setPPrice(e.target.value)}
                  placeholder="130.00"
                  className="w-full bg-[#1b1f2e] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Preço Promocional (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={pPromoPrice}
                  onChange={(e) => setPPromoPrice(e.target.value)}
                  placeholder="115.00"
                  className="w-full bg-[#1b1f2e] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>
            </div>

            {/* Promo Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="promoCheck"
                checked={pIsPromo}
                onChange={(e) => setPIsPromo(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-amber-500"
              />
              <label htmlFor="promoCheck" className="text-xs font-semibold text-amber-400">
                Ativar no Carrossel de Promoções da Semana
              </label>
            </div>

            {/* Photo Selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Foto do Produto
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={pImage}
                  onChange={(e) => setPImage(e.target.value)}
                  placeholder="/src/assets/images/..."
                  className="flex-1 bg-[#1b1f2e] border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                />
                <img
                  src={pImage || '/src/assets/images/polo_shirt_black_gold_1791857251704.jpg'}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-lg object-cover bg-zinc-900 shrink-0 border border-zinc-700"
                />
              </div>
            </div>

            {/* Colors editor */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Cores Disponíveis
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {pColors.map((c, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200"
                  >
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.hex }} />
                    <span>{c.name}</span>
                    <button
                      type="button"
                      onClick={() => setPColors(pColors.filter((_, idx) => idx !== i))}
                      className="text-zinc-500 hover:text-rose-400 ml-1"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  placeholder="Nome da cor (ex: Rosa Choque)"
                  className="flex-1 bg-[#1b1f2e] border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white"
                />
                <input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="w-10 h-8 rounded-xl bg-transparent border-0 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newColorName.trim()) {
                      setPColors([...pColors, { name: newColorName.trim(), hex: newColorHex }]);
                      setNewColorName('');
                    }
                  }}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white rounded-xl"
                >
                  + Cor
                </button>
              </div>
            </div>

            {/* Sizes Selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Tamanhos Disponíveis
              </label>
              <div className="flex gap-2">
                {(['P', 'M', 'G', 'GG'] as ProductSize[]).map((sz) => {
                  const isIncluded = pSizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => {
                        if (isIncluded) {
                          setPSizes(pSizes.filter((s) => s !== sz));
                        } else {
                          setPSizes([...pSizes, sz]);
                        }
                      }}
                      className={`w-10 h-9 rounded-xl text-xs font-bold border transition-colors ${
                        isIncluded
                          ? 'bg-amber-400 text-black border-amber-300'
                          : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Descrição
              </label>
              <textarea
                value={pDescription}
                onChange={(e) => setPDescription(e.target.value)}
                rows={2}
                placeholder="Informações sobre tecido, acabamento ou caimento..."
                className="w-full bg-[#1b1f2e] border border-zinc-800 rounded-xl p-3 text-xs text-white"
              />
            </div>

            <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="px-4 py-2 bg-zinc-900 text-zinc-400 text-xs font-semibold rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold rounded-xl shadow-md"
              >
                Salvar Peça no Catálogo
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
