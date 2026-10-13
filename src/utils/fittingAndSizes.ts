import { ProductCategory, ProductSize, VirtualFittingResult } from '../types';

export interface CategorySizeMeasurements {
  chest: string; // Tórax / Peito
  length: string; // Comprimento
  waist: string; // Cintura
  sleeveOrInseam?: string; // Manga ou Cavalo
}

export const SIZE_CHARTS: Record<ProductCategory, Record<ProductSize, CategorySizeMeasurements>> = {
  times: {
    P: { chest: '96 - 100 cm', length: '70 cm', waist: '80 - 84 cm', sleeveOrInseam: '22 cm' },
    M: { chest: '102 - 106 cm', length: '73 cm', waist: '86 - 90 cm', sleeveOrInseam: '23 cm' },
    G: { chest: '108 - 114 cm', length: '76 cm', waist: '92 - 98 cm', sleeveOrInseam: '24 cm' },
    GG: { chest: '116 - 124 cm', length: '79 cm', waist: '100 - 108 cm', sleeveOrInseam: '25 cm' }
  },
  polo: {
    P: { chest: '98 - 102 cm', length: '69 cm', waist: '82 - 86 cm', sleeveOrInseam: '20 cm' },
    M: { chest: '104 - 108 cm', length: '72 cm', waist: '88 - 92 cm', sleeveOrInseam: '21 cm' },
    G: { chest: '110 - 116 cm', length: '75 cm', waist: '94 - 100 cm', sleeveOrInseam: '22 cm' },
    GG: { chest: '118 - 126 cm', length: '78 cm', waist: '102 - 110 cm', sleeveOrInseam: '23 cm' }
  },
  bermuda: {
    P: { chest: '-', length: '46 cm', waist: '76 - 82 cm (38/40)', sleeveOrInseam: '21 cm' },
    M: { chest: '-', length: '48 cm', waist: '84 - 90 cm (42)', sleeveOrInseam: '22 cm' },
    G: { chest: '-', length: '50 cm', waist: '92 - 98 cm (44)', sleeveOrInseam: '23 cm' },
    GG: { chest: '-', length: '52 cm', waist: '100 - 108 cm (46/48)', sleeveOrInseam: '24 cm' }
  },
  regata: {
    P: { chest: '94 - 98 cm', length: '68 cm', waist: '78 - 82 cm', sleeveOrInseam: 'Cava 28 cm' },
    M: { chest: '100 - 104 cm', length: '71 cm', waist: '84 - 88 cm', sleeveOrInseam: 'Cava 29 cm' },
    G: { chest: '106 - 112 cm', length: '74 cm', waist: '90 - 96 cm', sleeveOrInseam: 'Cava 30 cm' },
    GG: { chest: '114 - 122 cm', length: '77 cm', waist: '98 - 106 cm', sleeveOrInseam: 'Cava 31 cm' }
  }
};

/**
 * Algoritmo do Provador Virtual Inteligente
 * Calcula o tamanho ideal com base em altura, peso, preferência de caimento e categoria da peça.
 */
export function calculateVirtualFit(
  heightCm: number,
  weightKg: number,
  fitPreference: 'slim' | 'regular' | 'oversized',
  category: ProductCategory = 'times'
): VirtualFittingResult {
  // Índice de massa corporal
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  // Estimativa de circunferência torácica média (cm)
  const estimatedChest = Math.round(weightKg * 1.1 + (heightCm - 150) * 0.2);

  // Determinação base por faixa de peso e IMC
  let baseIndex = 1; // 0=P, 1=M, 2=G, 3=GG

  if (weightKg < 66 && bmi < 22.5) {
    baseIndex = 0; // P
  } else if (weightKg < 76 && bmi < 25) {
    baseIndex = 1; // M
  } else if (weightKg < 88 && bmi < 28) {
    baseIndex = 2; // G
  } else {
    baseIndex = 3; // GG
  }

  // Ajuste por altura extrema
  if (heightCm >= 186 && baseIndex < 2) {
    baseIndex += 1; // Precisa de comprimento maior
  }

  // Ajuste por preferência de caimento
  let adjustedIndex = baseIndex;
  if (fitPreference === 'slim' && adjustedIndex > 0) {
    // Se o peso está na faixa limítrofe inferior, reduz para caimento justo
    if (weightKg % 10 <= 4) {
      adjustedIndex -= 1;
    }
  } else if (fitPreference === 'oversized' && adjustedIndex < 3) {
    adjustedIndex += 1;
  }

  const sizes: ProductSize[] = ['P', 'M', 'G', 'GG'];
  const recommendedSize = sizes[Math.max(0, Math.min(3, adjustedIndex))];

  // Cálculo de precisão/confiança
  let confidence = 94;
  if (bmi >= 24.5 && bmi <= 25.5) confidence = 86; // Região limítrofe
  if (fitPreference === 'oversized') confidence = 91;

  // Recomendações e dicas de caimento personalizadas
  let tip = '';
  if (fitPreference === 'slim') {
    tip = `Para ${heightCm}cm e ${weightKg}kg com modelagem ajustada, o tamanho ${recommendedSize} abraçará a linha do corpo sem repuxar nas costuras laterais.`;
  } else if (fitPreference === 'oversized') {
    tip = `Como você prefere estilo oversized/streetwear com ${weightKg}kg, o tamanho ${recommendedSize} garante o caimento solto e ombros levemente caídos característicos da tendência.`;
  } else {
    tip = `O tamanho ${recommendedSize} proporciona o equilíbrio perfeito entre conforto nas costas e comprimento ideal na linha da cintura.`;
  }

  if (category === 'bermuda') {
    tip += ' O cós possui cordão com ajuste elástico, garantindo firmeza na cintura.';
  }

  return {
    recommendedSize,
    confidence,
    fitFeeling: fitPreference,
    chestRecommendation: `Estimativa de tórax: ~${estimatedChest} cm`,
    lengthRecommendation: `Altura recomendada: ${heightCm - 4} a ${heightCm + 5} cm`,
    tip
  };
}
