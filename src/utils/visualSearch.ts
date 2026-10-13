import { Product, ProductCategory, ProductColor } from '../types';

export interface VisualAnalysisResult {
  primaryHex: string;
  secondaryHex?: string;
  primaryRgb: [number, number, number];
  colorFamily: string;
  colorFamilyLabel: string;
  brightness: 'dark' | 'medium' | 'light';
  saturation: 'vibrant' | 'moderate' | 'neutral';
  aspectRatio: number; // height / width
  suggestedCategory?: ProductCategory;
  confidence: number;
}

export interface VisualMatchResult {
  product: Product;
  similarityScore: number; // 0 - 100
  matchedColor: ProductColor;
  matchReasons: string[];
}

// Converte HEX para RGB
export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16)
    ];
  }
  return [
    parseInt(clean.substring(0, 2), 16) || 0,
    parseInt(clean.substring(2, 4), 16) || 0,
    parseInt(clean.substring(4, 6), 16) || 0
  ];
}

// Converte RGB para HEX
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Converte RGB para HSL
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// Calcula distância perceptiva ponderada entre cores RGB
export function getColorDistance(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const rMean = (rgb1[0] + rgb2[0]) / 2;
  const r = rgb1[0] - rgb2[0];
  const g = rgb1[1] - rgb2[1];
  const b = rgb1[2] - rgb2[2];
  // Fórmula Colorimetric Redmean (aproximação CIE76 perceptiva ao olho humano)
  const weightR = 2 + rMean / 256;
  const weightG = 4.0;
  const weightB = 2 + (255 - rMean) / 256;
  return Math.sqrt(weightR * r * r + weightG * g * g + weightB * b * b);
}

// Classifica família cromática pelo HSL
export function identifyColorFamily(hsl: { h: number; s: number; l: number }): { id: string; label: string } {
  const { h, s, l } = hsl;

  if (l <= 18) {
    return { id: 'preto', label: 'Preto / Grafite Escuro' };
  }
  if (l >= 88 && s < 25) {
    return { id: 'branco', label: 'Branco / Neve' };
  }
  if (s <= 18) {
    return l > 55 ? { id: 'cinza_claro', label: 'Cinza Claro / Chumbo' } : { id: 'cinza_escuro', label: 'Cinza Escuro / Chumbo' };
  }

  // Hue classifications (0-360)
  if (h >= 345 || h < 15) {
    return l < 35 ? { id: 'vinho', label: 'Vinho / Bordô' } : { id: 'vermelho', label: 'Vermelho Vibrante' };
  }
  if (h >= 15 && h < 45) {
    return { id: 'laranja', label: 'Laranja / Coral' };
  }
  if (h >= 45 && h < 70) {
    return { id: 'amarelo', label: 'Amarelo / Dourado' };
  }
  if (h >= 70 && h < 165) {
    return l < 30 ? { id: 'verde_musgo', label: 'Verde Militar / Musgo' } : { id: 'verde', label: 'Verde Esportivo' };
  }
  if (h >= 165 && h < 260) {
    if (l < 30) return { id: 'azul_marinho', label: 'Azul Marinho Escuro' };
    if (l > 70) return { id: 'azul_celeste', label: 'Azul Claro / Celeste' };
    return { id: 'azul', label: 'Azul Royal / Esportivo' };
  }
  if (h >= 260 && h < 315) {
    return { id: 'roxo', label: 'Roxo / Violeta' };
  }
  if (h >= 315 && h < 345) {
    return { id: 'rosa', label: 'Rosa Choque / Pink' };
  }

  return { id: 'personalizado', label: 'Tom Personalizado' };
}

/**
 * Processa a imagem no canvas, focando na região central (peça fotografada),
 * descartando bordas extremas ou iluminação excessiva de estúdio.
 */
export function analyzeCanvasImage(canvas: HTMLCanvasElement): VisualAnalysisResult {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Não foi possível obter contexto 2D do canvas');
  }

  const { width, height } = canvas;

  // Foco no centro (área de interesse onde o usuário posicionou a roupa)
  const cropX = Math.floor(width * 0.15);
  const cropY = Math.floor(height * 0.15);
  const cropW = Math.floor(width * 0.70);
  const cropH = Math.floor(height * 0.70);

  const imgData = ctx.getImageData(cropX, cropY, cropW, cropH);
  const data = imgData.data;

  // Acumuladores de cores
  const colorBuckets: { [bucketKey: string]: { r: number; g: number; b: number; count: number } } = {};
  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let validPixelCount = 0;

  // Bounding box da silhueta da peça (para estimativa de forma/aspecto)
  let minX = cropW, maxX = 0, minY = cropH, maxY = 0;

  // Amostragem com salto (step 3 para performance em dispositivos móveis)
  const step = 3;
  for (let y = 0; y < cropH; y += step) {
    for (let x = 0; x < cropW; x += step) {
      const idx = (y * cropW + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      if (a < 128) continue; // Pixel transparente

      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      
      // Descartar ruídos de fundo ultra brancos (flash estourado ou parede de estúdio pura)
      // a menos que a imagem inteira seja predominantemente branca
      const isExtremeGlare = r > 248 && g > 248 && b > 248;

      if (!isExtremeGlare) {
        totalR += r;
        totalG += g;
        totalB += b;
        validPixelCount++;

        // Atualiza silhueta
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;

        // Quantização em bucket de 32 para agrupamento de tons
        const qR = Math.floor(r / 32) * 32 + 16;
        const qG = Math.floor(g / 32) * 32 + 16;
        const qB = Math.floor(b / 32) * 32 + 16;
        const key = `${qR}-${qG}-${qB}`;

        if (!colorBuckets[key]) {
          colorBuckets[key] = { r: qR, g: qG, b: qB, count: 0 };
        }
        colorBuckets[key].count++;
      }
    }
  }

  // Se tudo foi descartado, pega a média bruta sem restrição
  if (validPixelCount === 0) {
    for (let i = 0; i < data.length; i += step * 4) {
      totalR += data[i];
      totalG += data[i + 1];
      totalB += data[i + 2];
      validPixelCount++;
    }
  }

  const avgR = Math.round(totalR / Math.max(1, validPixelCount));
  const avgG = Math.round(totalG / Math.max(1, validPixelCount));
  const avgB = Math.round(totalB / Math.max(1, validPixelCount));

  // Encontra os buckets dominantes
  const sortedBuckets = Object.values(colorBuckets).sort((a, b) => b.count - a.count);
  const primaryBucket = sortedBuckets[0] || { r: avgR, g: avgG, b: avgB };
  const secondaryBucket = sortedBuckets[1];

  const primaryRgb: [number, number, number] = [primaryBucket.r, primaryBucket.g, primaryBucket.b];
  const primaryHex = rgbToHex(primaryBucket.r, primaryBucket.g, primaryBucket.b);
  const secondaryHex = secondaryBucket ? rgbToHex(secondaryBucket.r, secondaryBucket.g, secondaryBucket.b) : undefined;

  const hsl = rgbToHsl(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
  const family = identifyColorFamily(hsl);

  // Estimativa de forma / aspect ratio da peça
  const shapeW = Math.max(10, maxX - minX);
  const shapeH = Math.max(10, maxY - minY);
  const aspectRatio = shapeH / shapeW; // Altura / Largura

  // Heurística de categoria aproximada pelo aspect ratio da silhueta
  let suggestedCategory: ProductCategory | undefined;
  if (aspectRatio > 1.25) {
    // Silhueta mais vertical: comum para bermudas ou regatas alongadas
    suggestedCategory = 'bermuda';
  } else if (aspectRatio >= 0.95 && aspectRatio <= 1.25) {
    // Silhueta equilibrada: comum para camisas polo e camisas de times
    suggestedCategory = 'times';
  } else {
    // Silhueta mais larga
    suggestedCategory = 'polo';
  }

  const brightness: 'dark' | 'medium' | 'light' =
    hsl.l < 30 ? 'dark' : hsl.l > 70 ? 'light' : 'medium';
  const saturation: 'vibrant' | 'moderate' | 'neutral' =
    hsl.s > 60 ? 'vibrant' : hsl.s > 25 ? 'moderate' : 'neutral';

  return {
    primaryHex,
    secondaryHex,
    primaryRgb,
    colorFamily: family.id,
    colorFamilyLabel: family.label,
    brightness,
    saturation,
    aspectRatio,
    suggestedCategory,
    confidence: Math.min(98, Math.round(55 + (sortedBuckets[0]?.count || 0) / Math.max(1, validPixelCount) * 45))
  };
}

/**
 * Cruza o resultado da análise visual com todos os produtos do catálogo,
 * pontuando afinidade de cor, contraste, categoria e estilo.
 */
export function findSimilarProducts(
  analysis: VisualAnalysisResult,
  products: Product[],
  categoryFilter: ProductCategory | 'todas' = 'todas'
): VisualMatchResult[] {
  const matches: VisualMatchResult[] = [];

  for (const product of products) {
    if (categoryFilter !== 'todas' && product.category !== categoryFilter) {
      continue;
    }

    let bestColorScore = 0;
    let bestMatchedColor: ProductColor = product.colors[0];
    const matchReasons: string[] = [];

    // Compara com cada variação de cor do produto
    for (const color of product.colors) {
      const prodRgb = hexToRgb(color.hex);
      const distance = getColorDistance(analysis.primaryRgb, prodRgb);

      // Distância máxima teórica ~765. Distância < 80 é excelente proximidade
      // Distância < 150 é correspondência razoável
      const rawScore = Math.max(0, 100 - (distance / 2.5));

      // Bônus se o nome da cor incluir a família cromática detectada
      let semanticBonus = 0;
      const lowerName = color.name.toLowerCase();
      const detectedFam = analysis.colorFamily.toLowerCase();
      if (
        (detectedFam.includes('azul') && (lowerName.includes('azul') || lowerName.includes('marinho') || lowerName.includes('celeste'))) ||
        (detectedFam.includes('preto') && (lowerName.includes('preto') || lowerName.includes('carbono') || lowerName.includes('grafite'))) ||
        (detectedFam.includes('branco') && (lowerName.includes('branco') || lowerName.includes('neve') || lowerName.includes('off'))) ||
        (detectedFam.includes('amarelo') && (lowerName.includes('ouro') || lowerName.includes('amarelo') || lowerName.includes('dourado'))) ||
        (detectedFam.includes('verde') && (lowerName.includes('verde') || lowerName.includes('militar') || lowerName.includes('musgo'))) ||
        (detectedFam.includes('rosa') && (lowerName.includes('rosa') || lowerName.includes('pink'))) ||
        (detectedFam.includes('vinho') && (lowerName.includes('vinho') || lowerName.includes('bordô') || lowerName.includes('rubro')))
      ) {
        semanticBonus = 12;
      }

      const totalColorScore = Math.min(100, rawScore + semanticBonus);

      if (totalColorScore > bestColorScore) {
        bestColorScore = totalColorScore;
        bestMatchedColor = color;
      }
    }

    // Avalia compatibilidade de formato / categoria
    let categoryBonus = 0;
    if (analysis.suggestedCategory && product.category === analysis.suggestedCategory) {
      categoryBonus = 8;
      matchReasons.push('Silhueta e corte compatíveis');
    }

    // Adiciona razões descritivas
    if (bestColorScore >= 75) {
      matchReasons.unshift(`Cor correspondente: tom ${bestMatchedColor.name}`);
    } else if (bestColorScore >= 50) {
      matchReasons.unshift(`Paleta aproximada: variação ${bestMatchedColor.name}`);
    } else {
      matchReasons.unshift('Estilo com harmonia visual');
    }

    const finalScore = Math.min(98, Math.round(bestColorScore * 0.85 + categoryBonus));

    matches.push({
      product,
      similarityScore: Math.max(25, finalScore),
      matchedColor: bestMatchedColor,
      matchReasons
    });
  }

  // Ordena por maior similaridade
  return matches.sort((a, b) => b.similarityScore - a.similarityScore);
}
