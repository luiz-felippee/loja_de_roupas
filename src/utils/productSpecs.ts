import { Product, ProductTechnicalSpecs } from '../types';

/**
 * Retorna as especificações técnicas completas do produto.
 * Se o produto tiver especificações customizadas cadastradas, utiliza-as;
 * caso contrário, deduz especificações realistas com base na categoria e características do produto.
 */
export function getProductSpecs(product: Product): ProductTechnicalSpecs {
  const categoryDefaults: Record<string, ProductTechnicalSpecs> = {
    times: {
      material: 'Dry Pro 100% Poliéster Microfibra com filamentos hidro-repelentes',
      fit: 'Athletic Slim Fit anatômico com corte ergonômico',
      collarOrCut: 'Gola esportiva com reforço interno e costura dupla anti-desgaste',
      breathability: 'Alta performance — tecnologia de evaporação rápida e canais de ventilação lateral',
      fabricWeight: '155 g/m² (Ultraleve)',
      usage: 'Futebol, treinos de alta intensidade, academia e uso casual esportivo',
      care: 'Lavar à mão ou na máquina em ciclo delicado até 30°C. Não alvejar e não secar em tambor.',
      origin: 'Nacional — Costura reforçada com escudo e detalhes termocolados',
      warranty: '30 dias contra defeitos de fabricação'
    },
    polo: {
      material: 'Malha Piquet penteada encorpada (96% Algodão nobre, 4% Elastano para flexibilidade)',
      fit: 'Casual Classic Fit com alinhamento perfeito nos ombros e caimento reto',
      collarOrCut: 'Gola polo estruturada com ribana reforçada e peitilho de 2 a 3 botões em madre-pérola/resina',
      breathability: 'Média/Alta — toque térmico suave com excelente circulação de ar natural',
      fabricWeight: '220 g/m² (Gramatura encorpada e durável)',
      usage: 'Trabalho, eventos sociais, encontros e rolê casual premium',
      care: 'Lavar do avesso com cores similares. Passar a ferro em temperatura média (até 150°C).',
      origin: 'Nacional — Malha pré-encolhida de alta durabilidade',
      warranty: '30 dias contra defeitos de fabricação'
    },
    bermuda: {
      material: 'Tecido Tech Stretch 92% Poliéster, 8% Elastano com acabamento repelente a respingos',
      fit: 'Regular Esportivo acima do joelho com fendas laterais para mobilidade total',
      collarOrCut: 'Cós elástico anatômico com cordão interno/externo reforçado e ilhoses metálicos',
      breathability: 'Alta — secagem ultrarrápida (Quick Dry) e toque gelado',
      fabricWeight: '170 g/m² (Leveza e elasticidade bidirecional)',
      usage: 'Treinos de musculação, corrida, crossfit, futevôlei e praia/casual',
      care: 'Lavagem suave à máquina. Secagem rápida no varal à sombra. Não passar sobre zíperes.',
      origin: 'Nacional — Zíperes com trava e costuras overloque reforçadas',
      warranty: '30 dias contra defeitos de fabricação'
    },
    regata: {
      material: 'Microdry Aerado 100% Poliéster com microporos de ventilação mecânica',
      fit: 'Corte cavado estilo machão esportivo com cavas amplas para liberdade articular',
      collarOrCut: 'Gola careca reforçada com vivo de proteção para não atritar a pele',
      breathability: 'Máxima ventilabilidade — vazão de ar constante para evitar acúmulo de suor',
      fabricWeight: '135 g/m² (Pluma ultraleve)',
      usage: 'Treinos intensos, musculação pesada, dias quentes e corrida ao ar livre',
      care: 'Lavar com água fria. Dispensa passar a ferro. Secagem rápida.',
      origin: 'Nacional — Tecnologia antibacteriana que reduz odores',
      warranty: '30 dias contra defeitos de fabricação'
    }
  };

  const defaults = categoryDefaults[product.category] || categoryDefaults.polo;

  return {
    material: product.specs?.material || defaults.material,
    fit: product.specs?.fit || defaults.fit,
    collarOrCut: product.specs?.collarOrCut || defaults.collarOrCut,
    breathability: product.specs?.breathability || defaults.breathability,
    fabricWeight: product.specs?.fabricWeight || defaults.fabricWeight,
    usage: product.specs?.usage || defaults.usage,
    care: product.specs?.care || defaults.care,
    origin: product.specs?.origin || defaults.origin,
    warranty: product.specs?.warranty || defaults.warranty
  };
}

/**
 * Análise comparativa rápida entre os produtos selecionados
 */
export function getComparisonHighlights(products: Product[]): {
  lowestPriceId?: string;
  highestDiscountId?: string;
  mostColorsId?: string;
  mostStockId?: string;
} {
  if (products.length === 0) return {};

  let lowestPrice = Infinity;
  let lowestPriceId: string | undefined;

  let highestDiscount = 0;
  let highestDiscountId: string | undefined;

  let mostColors = 0;
  let mostColorsId: string | undefined;

  let mostStock = -1;
  let mostStockId: string | undefined;

  products.forEach((p) => {
    const effectivePrice = p.isPromo && p.promoPrice ? p.promoPrice : p.price;
    if (effectivePrice < lowestPrice) {
      lowestPrice = effectivePrice;
      lowestPriceId = p.id;
    }

    if (p.isPromo && p.promoPrice && p.price > p.promoPrice) {
      const discount = p.price - p.promoPrice;
      if (discount > highestDiscount) {
        highestDiscount = discount;
        highestDiscountId = p.id;
      }
    }

    if (p.colors.length > mostColors) {
      mostColors = p.colors.length;
      mostColorsId = p.id;
    }

    if (p.stock > mostStock) {
      mostStock = p.stock;
      mostStockId = p.id;
    }
  });

  return {
    lowestPriceId,
    highestDiscountId,
    mostColorsId,
    mostStockId
  };
}
