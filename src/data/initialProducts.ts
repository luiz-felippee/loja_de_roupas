import { Product, StoreSettings } from '../types';

export const HERO_BANNER_IMAGE = '/src/assets/images/store_banner_urban_1791857253983.jpg';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Camisa de Time Dry Pro (Edição Especial)',
    category: 'times',
    image: '/src/assets/images/football_jersey_pink_white_1791857252502.jpg',
    price: 130.00,
    promoPrice: 115.00,
    isPromo: true,
    stock: 14,
    description: 'Camisa esportiva oficial de time com tecnologia dry fit de alta absorção, recortes geométricos modernos e acabamento premium.',
    specs: {
      material: 'Dry Pro 100% Poliéster Microfibra com canais de aeração',
      fit: 'Athletic Slim Fit ergonômico',
      collarOrCut: 'Gola esportiva com ribana e reforço anti-atrito',
      breathability: 'Alta performance — tecnologia de evaporação rápida',
      fabricWeight: '155 g/m² (Ultraleve)',
      usage: 'Futebol, corridas e treinos de alta intensidade',
      care: 'Lavar à mão ou ciclo delicado até 30°C. Não usar alvejante.',
      origin: 'Nacional (Acabamento e escudo premium)',
      warranty: '30 dias contra defeitos de fabricação'
    },
    colors: [
      { name: 'Rosa Choque & Branco', hex: '#ec4899' },
      { name: 'Branco Neve', hex: '#f8fafc' },
      { name: 'Preto Carbono', hex: '#0f1d3b' }
    ],
    sizes: ['P', 'M', 'G', 'GG']
  },
  {
    id: 'prod-2',
    name: 'Camisa Polo Piquet Premium Ouro',
    category: 'polo',
    image: '/src/assets/images/polo_shirt_black_gold_1791857251704.jpg',
    price: 119.90,
    promoPrice: 99.90,
    isPromo: true,
    stock: 18,
    description: 'Camisa polo em malha piquet encorpada com detalhes finos em dourado na gola e mangas. Conforto inigualável para o dia a dia e rolê casual.',
    specs: {
      material: 'Piquet Nobre (96% Algodão, 4% Elastano para toque macio)',
      fit: 'Casual Classic Fit alinhado com detalhes dourados',
      collarOrCut: 'Gola estruturada com frisos em fio dourado e 2 botões de resina',
      breathability: 'Média/Alta — excelente circulação de ar natural',
      fabricWeight: '220 g/m² (Gramatura encorpada e durável)',
      usage: 'Eventos sociais, encontros, trabalho e passeios casuais',
      care: 'Lavar do avesso. Secar à sombra. Passar a ferro até 150°C.',
      origin: 'Nacional (Fio penteado com costura pespontada)',
      warranty: '30 dias contra defeitos de fabricação'
    },
    colors: [
      { name: 'Preto com Ouro', hex: '#0f1d3b' },
      { name: 'Branca Clássica', hex: '#f1f5f9' },
      { name: 'Azul Marinho', hex: '#1e3a8a' }
    ],
    sizes: ['P', 'M', 'G', 'GG']
  },
  {
    id: 'prod-3',
    name: 'Bermuda Esportiva Tech Zipper',
    category: 'bermuda',
    image: '/src/assets/images/athletic_shorts_black_1791857253236.jpg',
    price: 89.90,
    promoPrice: 79.90,
    isPromo: true,
    stock: 22,
    description: 'Bermuda esportiva leve com bolsos laterais com zíper selado e cordão de ajuste. Ideal para treinos, futebol ou uso casual.',
    specs: {
      material: 'Tech Stretch 92% Poliéster, 8% Elastano hidro-repelente',
      fit: 'Regular Esportivo com abertura lateral anatômica',
      collarOrCut: 'Cós com elástico largo e cordão de ponta emborrachada',
      breathability: 'Alta — secagem expressa e sensação refrescante',
      fabricWeight: '170 g/m² (Super flexível)',
      usage: 'Academia, futebol society, corrida, crossfit e lazer',
      care: 'Lavar com água fria. Não passar a ferro sobre os zíperes selados.',
      origin: 'Nacional (Bolsos selados com zíperes anti-oxidação)',
      warranty: '30 dias contra defeitos de fabricação'
    },
    colors: [
      { name: 'Preto Ônix', hex: '#0f1d3b' },
      { name: 'Chumbo Grafite', hex: '#334155' },
      { name: 'Azul Petróleo', hex: '#0f766e' }
    ],
    sizes: ['P', 'M', 'G', 'GG']
  },
  {
    id: 'prod-4',
    name: 'Regata Treino Performance Dry',
    category: 'regata',
    image: '/src/assets/images/tank_top_gym_grey_1791857254971.jpg',
    price: 65.00,
    isPromo: false,
    stock: 16,
    description: 'Regata com corte atlético cavado e tecido microperfurado que garante máxima ventilação e liberdade total de movimento.',
    specs: {
      material: 'Microdry Aerado 100% Poliéster com microperfurações a laser',
      fit: 'Corte cavado anatômico com liberdade total de ombros',
      collarOrCut: 'Gola redonda anatômica com fita interna anti-atrito',
      breathability: 'Máxima ventilação contínua (anti-odor)',
      fabricWeight: '135 g/m² (Ultraleve)',
      usage: 'Musculação pesada, dias quentes, crossfit e corrida',
      care: 'Lavagem rápida. Secagem ultra-ágil. Dispensa ferro.',
      origin: 'Nacional (Costuras planas flatlock)',
      warranty: '30 dias contra defeitos de fabricação'
    },
    colors: [
      { name: 'Cinza Chumbo', hex: '#475569' },
      { name: 'Preto Sólido', hex: '#0f1d3b' },
      { name: 'Branco Neve', hex: '#ffffff' }
    ],
    sizes: ['P', 'M', 'G', 'GG']
  },
  {
    id: 'prod-5',
    name: 'Camisa de Time Manto Retrô Titular',
    category: 'times',
    image: '/src/assets/images/football_jersey_pink_white_1791857252502.jpg',
    price: 139.90,
    promoPrice: 125.00,
    isPromo: true,
    stock: 9,
    description: 'Modelo tradicional com gola trabalhada e tecido toque suave. O manto preferido dos boleiros da cidade.',
    colors: [
      { name: 'Preto & Dourado', hex: '#27272a' },
      { name: 'Rosa & Branco', hex: '#f43f5e' },
      { name: 'Branco Clássico', hex: '#f8fafc' }
    ],
    sizes: ['P', 'M', 'G', 'GG']
  },
  {
    id: 'prod-6',
    name: 'Camisa Polo Classic Fit Malha Fina',
    category: 'polo',
    image: '/src/assets/images/polo_shirt_black_gold_1791857251704.jpg',
    price: 109.90,
    isPromo: false,
    stock: 12,
    description: 'Modelagem padrão elegante com botões personalizados e caimento alinhado aos ombros. Visual limpo e sofisticado.',
    colors: [
      { name: 'Verde Militar', hex: '#3f6212' },
      { name: 'Preto Noite', hex: '#0f1d3b' },
      { name: 'Vinho Bordô', hex: '#881337' }
    ],
    sizes: ['P', 'M', 'G', 'GG']
  },
  {
    id: 'prod-7',
    name: 'Bermuda Moletom Casual Henrique Style',
    category: 'bermuda',
    image: '/src/assets/images/athletic_shorts_black_1791857253236.jpg',
    price: 85.00,
    isPromo: false,
    stock: 15,
    description: 'Moletom leve 100% algodão com elástico confortável e cordão rústico. Conforto térmico perfeito.',
    colors: [
      { name: 'Preto', hex: '#0f1d3b' },
      { name: 'Cinza Mescla', hex: '#64748b' },
      { name: 'Bege Areia', hex: '#d6d3d1' }
    ],
    sizes: ['P', 'M', 'G', 'GG']
  },
  {
    id: 'prod-8',
    name: 'Regata Machão Streetwear Urban',
    category: 'regata',
    image: '/src/assets/images/tank_top_gym_grey_1791857254971.jpg',
    price: 69.90,
    promoPrice: 59.90,
    isPromo: true,
    stock: 11,
    description: 'Estilo regata machão com ombros largos e gola reforçada, caimento solto que combina perfeitamente com bermuda e tênis.',
    colors: [
      { name: 'Grafite Escuro', hex: '#334155' },
      { name: 'Preto Básico', hex: '#0f1d3b' },
      { name: 'Verde Musgo', hex: '#166534' }
    ],
    sizes: ['P', 'M', 'G', 'GG']
  }
];

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  storeName: 'Henrique Multimarcas',
  deliveryFee: 10.00,
  pixKey: '11987654321', // Chave Pix celular ou aleatória
  pixKeyType: 'celular',
  pixName: 'Henrique Multimarcas ME',
  pixCity: 'SAO PAULO',
  whatsapp: '5511987654321',
  storeAddress: 'Rua do Comércio, 120 - Centro Comercial (Loja 04)',
  staffPassword: '1234'
};
