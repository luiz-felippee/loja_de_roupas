import React, { useState } from 'react';
import { Search, Mic, MicOff, X, SlidersHorizontal, Camera } from 'lucide-react';
import type { ProductCategory, ProductSize } from '../../types';
import { useVoiceSearch } from '../../hooks/useVoiceSearch';
import type { VoiceSearchResult } from '../../utils/speechRecognition';
import { useStore } from '../../context/StoreContext';

export type SortOption = 'recentes' | 'menor_preco' | 'maior_preco' | 'promocoes';

interface CatalogFiltersProps {
  selectedCategory: ProductCategory | 'todas';
  onSelectCategory: (cat: ProductCategory | 'todas') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categoryCounts: Record<string, number>;
  selectedSize: ProductSize | 'todos';
  onSelectSize: (size: ProductSize | 'todos') => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onVoiceSearch?: (result: VoiceSearchResult) => void;
}

const CATEGORIAS: { id: ProductCategory | 'todas'; label: string }[] = [
  { id: 'todas', label: 'Todos' },
  { id: 'times', label: 'Times' },
  { id: 'polo', label: 'Polo' },
  { id: 'bermuda', label: 'Bermudas' },
  { id: 'regata', label: 'Regatas' },
];

const TAMANHOS: (ProductSize | 'todos')[] = ['todos', 'P', 'M', 'G', 'GG'];

/** Barra de busca, categorias e filtros do catalogo da home. */
export const CatalogFilters: React.FC<CatalogFiltersProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  categoryCounts,
  selectedSize,
  onSelectSize,
  sortBy,
  onSortChange,
  onVoiceSearch,
}) => {
  const { addToast, setIsVisualSearchOpen } = useStore();
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  const aoOuvir = (result: VoiceSearchResult) => {
    if (onVoiceSearch) {
      onVoiceSearch(result);
      return;
    }
    if (result.matchedCategory) onSelectCategory(result.matchedCategory);
    onSearchChange(result.cleanedQuery);
    addToast('Busca por voz realizada', result.feedbackMessage, 'info');
  };

  const { isListening, interimTranscript, startListening, stopListening } = useVoiceSearch({
    onSearchResult: aoOuvir,
    onErrorToast: (titulo, descricao) => addToast(titulo, descricao, 'alert'),
  });

  const filtrosAtivos = selectedSize !== 'todos' || sortBy !== 'recentes';

  return (
    <div className="space-y-4">
      {/* Busca */}
      <div className="flex items-center gap-2 bg-[#0f1d3b] border border-zinc-800 rounded-2xl pl-4 pr-2 py-1.5 focus-within:border-amber-400/60 transition-colors">
        <Search className={`w-4 h-4 shrink-0 ${isListening ? 'text-amber-400' : 'text-zinc-500'}`} />
        <input
          type="search"
          value={isListening && interimTranscript ? interimTranscript : searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={isListening ? 'Ouvindo... fale agora' : 'Buscar camisa, time ou modelo'}
          className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none py-2"
          aria-label="Buscar produtos"
        />
        {searchQuery && !isListening && (
          <button onClick={() => onSearchChange('')} className="p-1.5 text-zinc-500 hover:text-white" aria-label="Limpar busca">
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => setIsVisualSearchOpen(true)}
          className="p-2 text-zinc-400 hover:text-amber-300 rounded-xl hover:bg-zinc-800 transition-colors"
          aria-label="Buscar por foto"
          title="Buscar por foto"
        >
          <Camera className="w-4 h-4" />
        </button>
        <button
          onClick={isListening ? stopListening : startListening}
          className={`p-2 rounded-xl transition-colors ${isListening ? 'bg-rose-500/20 text-rose-300' : 'text-zinc-400 hover:text-amber-300 hover:bg-zinc-800'}`}
          aria-label={isListening ? 'Parar de ouvir' : 'Pesquisar por voz'}
          title={isListening ? 'Parar de ouvir' : 'Pesquisar por voz'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
      </div>

      {/* Categorias */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none" role="tablist" aria-label="Categorias">
        {CATEGORIAS.map((c) => {
          const ativo = selectedCategory === c.id;
          const quantidade = c.id === 'todas' ? categoryCounts.todas : categoryCounts[c.id];
          return (
            <button
              key={c.id}
              role="tab"
              aria-selected={ativo}
              onClick={() => onSelectCategory(c.id)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                ativo
                  ? 'bg-amber-400 border-amber-400 text-black'
                  : 'bg-transparent border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:text-white'
              }`}
            >
              {c.label}
              {quantidade !== undefined && (
                <span className={`text-[11px] tabular-nums ${ativo ? 'text-black/70' : 'text-zinc-500'}`}>{quantidade}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tamanho e ordenacao: recolhidos no celular */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setFiltrosAbertos((v) => !v)}
          aria-expanded={filtrosAbertos}
          className="sm:hidden flex items-center gap-2 text-sm font-semibold text-zinc-300"
        >
          <SlidersHorizontal className="w-4 h-4 text-amber-400" />
          Filtros
          {filtrosAtivos && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
        </button>

        <div className={`${filtrosAbertos ? 'flex' : 'hidden'} sm:flex flex-1 flex-wrap items-center justify-between gap-3`}>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 mr-1">Tamanho</span>
            {TAMANHOS.map((t) => (
              <button
                key={t}
                onClick={() => onSelectSize(t)}
                aria-pressed={selectedSize === t}
                className={`min-w-[2.25rem] px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                  selectedSize === t
                    ? 'bg-white text-black border-white'
                    : 'border-zinc-800 text-zinc-300 hover:border-zinc-600'
                }`}
              >
                {t === 'todos' ? 'Todos' : t}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs text-zinc-500">
            Ordenar
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="bg-[#0f1d3b] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
            >
              <option value="recentes">Destaques</option>
              <option value="menor_preco">Menor preço</option>
              <option value="maior_preco">Maior preço</option>
              <option value="promocoes">Promoções primeiro</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
};
