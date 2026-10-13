import { Plus, Trash2, Edit } from 'lucide-react';
import type { AdminState } from './useAdminPanel';

export function ProductsTab({ a }: { a: AdminState }) {
  const { deleteProduct, handleOpenEditProduct, handleOpenNewProduct, products, updateProduct, updateStock } = a;
  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Catálogo de Roupas & Estoque</h3>
            <p className="text-xs text-zinc-400">
              Cadastre novas peças, ajuste estoque instantaneamente ou crie promoções.
            </p>
          </div>

          <button
            onClick={handleOpenNewProduct}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Novo Produto
          </button>
        </div>

        {/* Table / List Container */}
        <div className="bg-[#141724] border border-zinc-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl">
          {/* Desktop Table View (hidden on mobile) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#191d2c] border-b border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Produto</th>
                  <th className="py-3.5 px-4">Categoria</th>
                  <th className="py-3.5 px-4">Preço Normal</th>
                  <th className="py-3.5 px-4">Promoção</th>
                  <th className="py-3.5 px-4 text-center">Estoque</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-zinc-850/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-lg object-cover bg-zinc-950 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-white block text-sm">{prod.name}</span>
                          <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-0.5">
                            <span>{prod.colors.map((c) => c.name).join(', ')}</span>
                            <span>·</span>
                            <span>{prod.sizes.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-zinc-300">
                      <span className="capitalize font-semibold">
                        {prod.category === 'times' ? 'Camisas de Times' : prod.category === 'polo' ? 'Polo' : prod.category === 'bermuda' ? 'Bermuda' : 'Regata'}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-zinc-200 tabular-nums">
                      R$ {prod.price.toFixed(2).replace('.', ',')}
                    </td>

                    <td className="py-3 px-4">
                      {prod.isPromo ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-amber-400 font-mono font-extrabold tabular-nums">
                            R$ {(prod.promoPrice ?? prod.price).toFixed(2).replace('.', ',')}
                          </span>
                          <button
                            onClick={() => updateProduct(prod.id, { isPromo: false })}
                            className="text-[10px] bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/20 hover:bg-amber-500/20"
                            title="Desativar promoção"
                          >
                            Ativa
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            updateProduct(prod.id, {
                              isPromo: true,
                              promoPrice: Math.round(prod.price * 0.85)
                            })
                          }
                          className="text-[11px] text-zinc-500 hover:text-amber-400 font-semibold"
                        >
                          + Criar Promo
                        </button>
                      )}
                    </td>

                    {/* Stock Quick Stepper */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => updateStock(prod.id, -1)}
                          className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold flex items-center justify-center"
                        >
                          -
                        </button>
                        <span
                          className={`w-10 text-center font-mono font-extrabold tabular-nums ${
                            prod.stock === 0
                              ? 'text-rose-400'
                              : prod.stock <= 5
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {prod.stock}
                        </span>
                        <button
                          onClick={() => updateStock(prod.id, 1)}
                          className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditProduct(prod)}
                          className="p-1.5 text-zinc-400 hover:text-amber-400 transition-colors"
                          title="Editar produto"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteProduct(prod.id)}
                          className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                          title="Excluir produto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Touch Cards View (visible strictly on mobile) */}
          <div className="md:hidden divide-y divide-zinc-800/80 p-3 space-y-3">
            {products.map((prod) => (
              <div key={prod.id} className="pt-3 first:pt-0 space-y-3">
                <div className="flex items-start gap-3">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-xl object-cover bg-zinc-950 shrink-0 border border-zinc-800"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-bold text-white text-sm line-clamp-1">
                        {prod.name}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenEditProduct(prod)}
                          className="p-1.5 text-zinc-400 hover:text-amber-400 bg-zinc-900 border border-zinc-800 rounded-lg active:scale-95"
                          title="Editar produto"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteProduct(prod.id)}
                          className="p-1.5 text-zinc-500 hover:text-rose-400 bg-zinc-900 border border-zinc-800 rounded-lg active:scale-95"
                          title="Excluir produto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                      <span className="capitalize text-zinc-300 font-medium">
                        {prod.category === 'times' ? 'Times' : prod.category === 'polo' ? 'Polo' : prod.category === 'bermuda' ? 'Bermuda' : 'Regata'}
                      </span>
                      <span>·</span>
                      <span className="truncate">{prod.sizes.join(', ')}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="font-mono font-bold text-white text-xs tabular-nums">
                        R$ {prod.price.toFixed(2).replace('.', ',')}
                      </span>
                      {prod.isPromo && prod.promoPrice && (
                        <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                          Promo: R$ {prod.promoPrice.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mobile Stock Stepper & Quick Promo Toggle */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800/60 bg-[#161a27] p-2.5 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-zinc-400 font-medium">Estoque:</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateStock(prod.id, -1)}
                        className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-90 text-white font-bold flex items-center justify-center text-sm"
                        aria-label="Diminuir estoque"
                      >
                        -
                      </button>
                      <span
                        className={`w-8 text-center font-mono font-black text-xs tabular-nums ${
                          prod.stock === 0
                            ? 'text-rose-400'
                            : prod.stock <= 5
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {prod.stock}
                      </span>
                      <button
                        onClick={() => updateStock(prod.id, 1)}
                        className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-90 text-white font-bold flex items-center justify-center text-sm"
                        aria-label="Aumentar estoque"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    {prod.isPromo ? (
                      <button
                        onClick={() => updateProduct(prod.id, { isPromo: false })}
                        className="text-[10px] bg-amber-500/15 text-amber-300 font-bold px-2 py-1 rounded-lg border border-amber-500/30 active:scale-95"
                      >
                        Promoção Ativa ✓
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          updateProduct(prod.id, {
                            isPromo: true,
                            promoPrice: Math.round(prod.price * 0.85)
                          })
                        }
                        className="text-[10px] text-zinc-400 hover:text-amber-300 font-semibold px-2 py-1 bg-zinc-800/80 rounded-lg border border-zinc-700 active:scale-95"
                      >
                        + Ativar Promo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
