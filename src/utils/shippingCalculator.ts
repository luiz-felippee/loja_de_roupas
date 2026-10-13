import { ShippingOption } from '../types';

export interface CepLookupResult {
  cep: string;
  logradouro?: string;
  bairro?: string;
  localidade: string;
  uf: string;
  options: ShippingOption[];
}

export async function calculateShippingByCep(
  cep: string,
  subtotal: number = 0
): Promise<CepLookupResult> {
  const cleanCep = cep.replace(/\D/g, '');

  if (cleanCep.length !== 8) {
    throw new Error('Informe um CEP válido com 8 dígitos.');
  }

  let localidade = 'São Paulo';
  let uf = 'SP';
  let bairro = 'Centro';
  let logradouro = '';

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    if (res.ok) {
      const data = await res.json();
      if (!data.erro) {
        localidade = data.localidade || localidade;
        uf = data.uf || uf;
        bairro = data.bairro || bairro;
        logradouro = data.logradouro || '';
      }
    }
  } catch {
    // Modo offline ou CORS fallback
  }

  // Preços e prazos calibrados por proximidade geográfica (SP e Sudeste mais rápido/econômico)
  const isSudeste = ['SP', 'RJ', 'MG', 'ES'].includes(uf);
  const pacPrice = isSudeste ? 14.9 : 22.5;
  const pacDays = isSudeste ? '3 a 5 dias úteis' : '5 a 8 dias úteis';

  const sedexPrice = isSudeste ? 24.9 : 34.9;
  const sedexDays = isSudeste ? '1 a 2 dias úteis' : '2 a 3 dias úteis';

  // Frete grátis em compras acima de R$ 250
  const isPacFree = subtotal >= 250;

  const options: ShippingOption[] = [
    {
      id: 'pickup',
      name: 'Retirada na Loja Física',
      carrier: 'Balcão Express',
      deadline: 'Pronto em até 2 horas',
      price: 0
    },
    {
      id: 'pac',
      name: isPacFree ? 'PAC Econômico (Frete Grátis)' : 'PAC Econômico',
      carrier: 'Correios Brasil',
      deadline: pacDays,
      price: isPacFree ? 0 : pacPrice,
      freeAbove: 250
    },
    {
      id: 'sedex',
      name: 'Sedex Expresso / Motoboy',
      carrier: isSudeste && uf === 'SP' ? 'Motoboy Express' : 'Correios Sedex',
      deadline: sedexDays,
      price: sedexPrice
    }
  ];

  return {
    cep: cleanCep.replace(/(\d{5})(\d{3})/, '$1-$2'),
    localidade,
    uf,
    bairro,
    logradouro,
    options
  };
}
