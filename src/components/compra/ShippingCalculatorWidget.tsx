import React, { useState } from 'react';
import { calculateShippingByCep, CepLookupResult } from '../../utils/shippingCalculator';
import { Truck, MapPin, Check, Loader2, AlertCircle } from 'lucide-react';
import { ShippingOption } from '../../types';

interface ShippingCalculatorWidgetProps {
  subtotal?: number;
  onSelectOption?: (option: ShippingOption) => void;
  selectedOptionId?: string;
}

export const ShippingCalculatorWidget: React.FC<ShippingCalculatorWidgetProps> = ({
  subtotal = 0,
  onSelectOption,
  selectedOptionId
}) => {
  const [cep, setCep] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CepLookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 8);
    if (val.length > 5) {
      val = `${val.slice(0, 5)}-${val.slice(5)}`;
    }
    setCep(val);
    setError(null);
  };

  const handleCalculate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) {
      setError('Digite os 8 dígitos do seu CEP.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await calculateShippingByCep(clean, subtotal);
      setResult(data);
      if (onSelectOption && data.options.length > 0 && !selectedOptionId) {
        onSelectOption(data.options[0]);
      }
    } catch {
      setError('Não foi possível calcular o frete para este CEP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3.5 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl space-y-2.5">
      <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
        <span className="flex items-center gap-1.5 text-amber-400">
          <Truck className="w-3.5 h-3.5" />
          Calcular Frete e Prazo
        </span>
        <a
          href="https://buscacepinter.correios.com.br/app/endereco/index.php"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-zinc-500 hover:text-amber-400 underline font-normal"
        >
          Não sei meu CEP
        </a>
      </div>

      <form onSubmit={handleCalculate} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={cep}
            onChange={handleCepChange}
            placeholder="00000-000"
            maxLength={9}
            className="w-full pl-8 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 tabular-nums"
          />
          <MapPin className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
        </div>

        <button
          type="submit"
          disabled={loading || cep.replace(/\D/g, '').length !== 8}
          className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-750 disabled:bg-zinc-900 disabled:text-zinc-600 text-amber-400 border border-zinc-700 hover:border-amber-400/50 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Calculando...</span>
            </>
          ) : (
            <span>Calcular</span>
          )}
        </button>
      </form>

      {error && (
        <div className="flex items-center gap-1.5 text-[11px] text-rose-400">
          <AlertCircle className="w-3 h-3" />
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-2 pt-1 animate-in fade-in duration-200">
          <div className="text-[11px] text-zinc-400 flex items-center justify-between">
            <span>
              Entrega para:{' '}
              <strong className="text-zinc-200">
                {result.bairro ? `${result.bairro}, ` : ''}{result.localidade} - {result.uf}
              </strong>
            </span>
          </div>

          <div className="space-y-1.5">
            {result.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => onSelectOption && onSelectOption(opt)}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                    onSelectOption ? 'cursor-pointer' : ''
                  } ${
                    isSelected
                      ? 'bg-amber-400/10 border-amber-400 text-white'
                      : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-bold flex items-center gap-1.5">
                      {isSelected && <Check className="w-3 h-3 text-amber-400 stroke-[3]" />}
                      <span>{opt.name}</span>
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      {opt.carrier} · Prazo: <span className="text-zinc-400">{opt.deadline}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    {opt.price === 0 ? (
                      <span className="font-extrabold text-emerald-400 text-[11px] uppercase">
                        Grátis
                      </span>
                    ) : (
                      <span className="font-extrabold text-white text-[11px] tabular-nums">
                        R$ {opt.price.toFixed(2).replace('.', ',')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
