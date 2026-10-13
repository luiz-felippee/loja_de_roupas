import React from 'react';
import { ProductCategory, ProductSize } from '../types';
import { Search, Sparkles, SlidersHorizontal, ArrowUpDown, Mic, MicOff, Volume2, X, Camera } from 'lucide-react';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { VoiceSearchResult } from '../utils/speechRecognition';
import { useStore } from '../context/StoreContext';

export type SortOption = 'recentes' | 'menor_preco' | 'maior_preco' | 'promocoes';

interface CategoryFilterProps {
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

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  categoryCounts,
  selectedSize,
  onSelectSize,
  sortBy,
  onSortChange,
  onVoiceSearch
}) => {
  const { addToast, setIsVisualSearchOpen } = useStore();

  const handleVoiceResult = (result: VoiceSearchResult) => {
    if (onVoiceSearch) {
      onVoiceSearch(result);
    } else {
      if (result.matchedCategory) {
        onSelectCategory(result.matchedCategory);
      }
      onSearchChange(result.cleanedQuery);
      addToast(
        'Busca por voz realizada',
        result.feedbackMessage,
        'info'
      );
    }
  };

  const handleVoiceError = (title: string, description: string) => {
    addToast(title, description, 'alert');
  };

  const {
    isListening,
    interimTranscript,
    startListening,
    stopListening
  } = useVoiceSearch({
    onSearchResult: handleVoiceResult,
    onErrorToast: handleVoiceError
  });

  const categories: { id: ProductCategory | 'todas'; label: string; icon?: string }[] = [
    { id: 'todas', label: 'Todos os Produtos' },
    { id: 'times', label: 'Camisas de Times' },
    { id: 'polo', label: 'Camisas Polo' },
    { id: 'bermuda', label: 'Bermudas' },
    { id: 'regata', label: 'Camisas Regatas' }
  ];

  const sizes: (ProductSize | 'todos')[] = ['todos', 'P', 'M', 'G', 'GG'];

  return (
    <div className="space-y-5">
      {/* Search & Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">
            <span>Catálogo Completo</span>
            <span aria-hidden="true">·</span>
            <span>Pronta Entrega na Cidade</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Grade de Roupas & Acessórios
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Escolha uma categoria, filtre por tamanho ou fale no microfone para encontrar peças rapidamente.
          </p>
        </div>

        {/* Search Bar with Web Speech API integration */}
        <div className="relative w-full lg:w-96">
          <div
            className={`relative flex items-center bg-[#161924] border rounded-2xl transition-all shadow-inner ${
              isListening
                ? 'border-amber-400 ring-2 ring-amber-400/30 shadow-lg shadow-amber-500/20'
                : 'border-zinc-800 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500/30'
            }`}
          >
            <Search className={`ml-3.5 w-4 h-4 shrink-0 transition-colors ${isListening ? 'text-amber-400' : 'text-zinc-500'}`} />
            
            <input
              type="text"
              value={isListening && interimTranscript ? interimTranscript : searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={isListening ? 'Ouvindo... Fale agora' : 'Buscar por time, camisa, modelo...'}
              className="w-full bg-transparent pl-2.5 pr-2 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
            />

            {/* Clear button if text exists and not currently listening */}
            {searchQuery && !isListening && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="p-1 text-zinc-400 hover:text-white transition-colors mr-1 rounded-md"
                title="Limpar texto da pesquisa"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Actions: Câmera & Voz */}
            <div className="pr-1.5 flex items-center gap-0.5">
              {/* Visual Search / Camera Trigger */}
              <button
                type="button"
                onClick={() => setIsVisualSearchOpen(true)}
                className="p-2 rounded-xl text-xs font-semibold flex items-center gap-1 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800/80 active:scale-95 transition-all"
                title="Buscar por foto ou câmera (IA Color & Shape)"
                aria-label="Buscar peça por foto ou câmera"
              >
                <Camera className="w-4 h-4 text-amber-400/90 hover:scale-110 transition-transform" />
                <span className="text-[10px] font-semibold text-zinc-400 hidden sm:inline">
                  Foto
                </span>
              </button>

              {/* Web Speech API Microphone Trigger Button */}
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isListening
                    ? 'bg-red-500 text-white shadow-md shadow-red-500/40 animate-pulse'
                    : 'text-zinc-400 hover:text-amber-300 hover:bg-zinc-800/80 active:scale-95'
                }`}
                title={isListening ? 'Parar de ouvir' : 'Pesquisar por voz (Web Speech API)'}
                aria-label={isListening ? 'Parar gravação de voz' : 'Iniciar pesquisa por voz'}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4 animate-bounce" />
                    <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">
                      Ouvindo
                    </span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 hover:scale-110 transition-transform text-amber-400/90" />
                    <span className="text-[10px] font-semibold text-zinc-400 hidden sm:inline">
                      Voz
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Floating Live Speech Feedback Balloon */}
          {isListening && (
            <div className="absolute top-full mt-2 left-0 right-0 z-30 p-3.5 bg-[#12141f] border border-amber-500/60 rounded-2xl shadow-2xl shadow-black/90 space-y-2 backdrop-blur-md animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5" />
                    Ouvindo sua voz... Fale agora!
                  </span>
                </div>
                <button
                  type="button"
                  onClick={stopListening}
                  className="text-[10px] font-semibold text-zinc-400 hover:text-white px-2 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>

              {/* Transcribed speech live render */}
              <div className="p-2 bg-black/40 rounded-xl border border-zinc-800/80 text-xs">
                {interimTranscript ? (
                  <p className="text-white font-medium italic">
                    &ldquo;{interimTranscript}&rdquo;
                  </p>
                ) : (
                  <p className="text-zinc-400 italic">
                    Aguardando áudio... Experimente falar uma peça ou categoria.
                  </p>
                )}
              </div>

              {/* Suggested Voice Commands */}
              <div className="pt-1.5 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400">
                <span className="text-amber-400/90 font-semibold">Exemplos:</span>
                <span className="truncate ml-1.5 text-zinc-300">
                  &ldquo;Camisas de times&rdquo; · &ldquo;Polo Ouro&rdquo; · &ldquo;Bermuda&rdquo;
                </span>
              </div>
            </div>
          )}

          {/* Quick Voice Suggestion Pills below search input */}
          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-zinc-400 overflow-x-auto pb-0.5 scrollbar-none">
            <span className="text-amber-400/90 shrink-0 flex items-center gap-1 font-semibold text-[10px] uppercase tracking-wider">
              <Mic className="w-3 h-3 text-amber-400" />
              Voz:
            </span>
            {[
              { label: 'Camisas de times', cat: 'times' as ProductCategory, q: '' },
              { label: 'Polo Lacoste', cat: 'polo' as ProductCategory, q: 'Polo' },
              { label: 'Bermuda Tactel', cat: 'bermuda' as ProductCategory, q: 'Bermuda' },
              { label: 'Regata Machão', cat: 'regata' as ProductCategory, q: 'Regata' }
            ].map((hint, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onSelectCategory(hint.cat);
                  onSearchChange(hint.q);
                  addToast(
                    'Pesquisa rápida aplicada',
                    `Mostrando categoria: ${hint.label}`,
                    'info'
                  );
                }}
                className="shrink-0 px-2 py-0.5 rounded-md bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 text-zinc-400 hover:text-amber-300 transition-colors text-[10px]"
              >
                &ldquo;{hint.label}&rdquo;
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const count = categoryCounts[cat.id] ?? 0;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
                isActive
                  ? 'bg-amber-400 text-black border-amber-300 shadow-md shadow-amber-500/10'
                  : 'bg-[#151824] text-zinc-300 border-zinc-800/90 hover:border-zinc-700 hover:text-white'
              }`}
            >
              {cat.id === 'times' && <Sparkles className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-amber-400'}`} />}
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  isActive ? 'bg-black/20 text-black' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sub-Filters: Sizes and Sorting Bar */}
      <div className="p-3 bg-[#131620] border border-zinc-800/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Size Filters */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1 shrink-0 uppercase tracking-wider">
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            Tamanho:
          </span>
          <div className="flex items-center gap-1">
            {sizes.map((sz) => {
              const isSelected = selectedSize === sz;
              return (
                <button
                  key={sz}
                  onClick={() => onSelectSize(sz)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors border ${
                    isSelected
                      ? 'bg-zinc-200 text-black border-white'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  {sz === 'todos' ? 'Todos' : sz}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <span className="text-[11px] text-zinc-400 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
            Ordenar por:
          </span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
          >
            <option value="recentes">Mais Populares</option>
            <option value="menor_preco">Menor Preço</option>
            <option value="maior_preco">Maior Preço</option>
            <option value="promocoes">Promoções Primeiro</option>
          </select>
        </div>
      </div>
    </div>
  );
};
