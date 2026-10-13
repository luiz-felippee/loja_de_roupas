import type { Order } from "../types";

export const SAMPLE_PAST_ORDERS: Order[] = [
  {
    id: 'HM-1080',
    createdAt: new Date(Date.now() - 86400000 * 1 - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    customer: {
      name: 'Rafael Mendes',
      phone: '(11) 97111-2233',
      address: 'Rua Bela Vista, 210',
      neighborhood: 'Vila Nova'
    },
    items: [
      {
        productId: 'prod-1',
        name: 'Camisa de Time Dry Pro (Edição Especial)',
        image: '/src/assets/images/football_jersey_pink_white_1791857252502.jpg',
        color: 'Rosa Choque & Branco',
        size: 'M',
        price: 115.00,
        quantity: 2
      }
    ],
    paymentMethod: 'pix',
    deliveryType: 'retirada',
    deliveryFee: 0,
    subtotal: 230.00,
    total: 230.00,
    status: 'finalizado'
  },
  {
    id: 'HM-1077',
    createdAt: new Date(Date.now() - 86400000 * 2 - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    customer: {
      name: 'Thiago Nogueira',
      phone: '(11) 98777-6543',
      address: 'Rua do Comércio, 55',
      neighborhood: 'Centro'
    },
    items: [
      {
        productId: 'prod-2',
        name: 'Camisa Polo Piquet Premium Ouro',
        image: '/src/assets/images/polo_shirt_black_gold_1791857251704.jpg',
        color: 'Preto com Ouro',
        size: 'G',
        price: 99.90,
        quantity: 2
      },
      {
        productId: 'prod-3',
        name: 'Bermuda Esportiva Tech Zipper',
        image: '/src/assets/images/athletic_shorts_black_1791857253236.jpg',
        color: 'Preto Ônix',
        size: 'G',
        price: 79.90,
        quantity: 1
      }
    ],
    paymentMethod: 'cartao',
    deliveryType: 'entrega_loja',
    deliveryFee: 10.00,
    subtotal: 279.70,
    total: 289.70,
    status: 'finalizado'
  },
  {
    id: 'HM-1073',
    createdAt: new Date(Date.now() - 86400000 * 3 - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    customer: {
      name: 'Camila Rocha',
      phone: '(11) 99882-3344',
      address: 'Av. Paulista, 1200 - Apto 41',
      neighborhood: 'Bela Vista'
    },
    items: [
      {
        productId: 'prod-2',
        name: 'Camisa Polo Piquet Premium Ouro',
        image: '/src/assets/images/polo_shirt_black_gold_1791857251704.jpg',
        color: 'Preto com Ouro',
        size: 'P',
        price: 99.90,
        quantity: 1
      },
      {
        productId: 'prod-3',
        name: 'Bermuda Esportiva Tech Zipper',
        image: '/src/assets/images/athletic_shorts_black_1791857253236.jpg',
        color: 'Preto Ônix',
        size: 'P',
        price: 79.90,
        quantity: 1
      }
    ],
    paymentMethod: 'pix',
    deliveryType: 'retirada',
    deliveryFee: 0,
    subtotal: 179.80,
    total: 179.80,
    status: 'finalizado'
  },
  {
    id: 'HM-1070',
    createdAt: new Date(Date.now() - 86400000 * 4 - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    customer: {
      name: 'Danilo Alcantara',
      phone: '(11) 97223-1122',
      address: 'Rua Amazonas, 340',
      neighborhood: 'Jardins'
    },
    items: [
      {
        productId: 'prod-1',
        name: 'Camisa de Time Dry Pro (Edição Especial)',
        image: '/src/assets/images/football_jersey_pink_white_1791857252502.jpg',
        color: 'Rosa Choque & Branco',
        size: 'GG',
        price: 115.00,
        quantity: 3
      }
    ],
    paymentMethod: 'pix',
    deliveryType: 'entrega_loja',
    deliveryFee: 10.00,
    subtotal: 345.00,
    total: 355.00,
    status: 'finalizado'
  },
  {
    id: 'HM-1066',
    createdAt: new Date(Date.now() - 86400000 * 5 - 3600000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    customer: {
      name: 'Fábio Silveira',
      phone: '(11) 98334-8899',
      address: 'Rua Sete de Setembro, 12',
      neighborhood: 'Centro'
    },
    items: [
      {
        productId: 'prod-3',
        name: 'Bermuda Esportiva Tech Zipper',
        image: '/src/assets/images/athletic_shorts_black_1791857253236.jpg',
        color: 'Preto Ônix',
        size: 'M',
        price: 79.90,
        quantity: 2
      }
    ],
    paymentMethod: 'dinheiro',
    deliveryType: 'retirada',
    deliveryFee: 0,
    subtotal: 159.80,
    total: 159.80,
    status: 'finalizado'
  },
  {
    id: 'HM-1062',
    createdAt: new Date(Date.now() - 86400000 * 6 - 3600000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    customer: {
      name: 'Marcos Vinicius',
      phone: '(11) 99445-5566',
      address: 'Rua Tiradentes, 800',
      neighborhood: 'Vila Mariana'
    },
    items: [
      {
        productId: 'prod-1',
        name: 'Camisa de Time Dry Pro (Edição Especial)',
        image: '/src/assets/images/football_jersey_pink_white_1791857252502.jpg',
        color: 'Rosa Choque & Branco',
        size: 'G',
        price: 115.00,
        quantity: 2
      },
      {
        productId: 'prod-2',
        name: 'Camisa Polo Piquet Premium Ouro',
        image: '/src/assets/images/polo_shirt_black_gold_1791857251704.jpg',
        color: 'Preto com Ouro',
        size: 'M',
        price: 99.90,
        quantity: 1
      }
    ],
    paymentMethod: 'cartao',
    deliveryType: 'entrega_loja',
    deliveryFee: 10.00,
    subtotal: 329.90,
    total: 339.90,
    status: 'finalizado'
  }
];

/** Pedidos de exemplo para a loja ter historico nos testes. */
export function loadOrders(): Order[] {
  try {
    const stored = localStorage.getItem('hm_orders');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const hasPastDays = parsed.some(
          (o) => new Date(o.createdAt).getTime() < Date.now() - 86400000 * 0.9
        );
        if (!hasPastDays) {
          return [...parsed, ...SAMPLE_PAST_ORDERS];
        }
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  // Initial sample orders for store testing
  return [
    {
      id: 'HM-1082',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      customer: {
        name: 'Lucas Ferreira',
        phone: '(11) 99123-4567',
        address: 'Av. Brasil, 450 - Apto 32',
        neighborhood: 'Jardim Alvorada',
        reference: 'Próximo à padaria'
      },
      items: [
        {
          productId: 'prod-1',
          name: 'Camisa de Time Dry Pro (Edição Especial)',
          image: '/src/assets/images/football_jersey_pink_white_1791857252502.jpg',
          color: 'Rosa Choque & Branco',
          size: 'G',
          price: 115.00,
          quantity: 1
        }
      ],
      paymentMethod: 'pix',
      deliveryType: 'entrega_loja',
      deliveryFee: 10.00,
      subtotal: 115.00,
      total: 125.00,
      status: 'separacao'
    },
    {
      id: 'HM-1083',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      updatedAt: new Date(Date.now() - 1800000).toISOString(),
      customer: {
        name: 'Guilherme Santos',
        phone: '(11) 98234-9988',
        address: 'Rua das Flores, 88',
        neighborhood: 'Centro'
      },
      items: [
        {
          productId: 'prod-2',
          name: 'Camisa Polo Piquet Premium Ouro',
          image: '/src/assets/images/polo_shirt_black_gold_1791857251704.jpg',
          color: 'Preto com Ouro',
          size: 'M',
          price: 99.90,
          quantity: 1
        },
        {
          productId: 'prod-3',
          name: 'Bermuda Esportiva Tech Zipper',
          image: '/src/assets/images/athletic_shorts_black_1791857253236.jpg',
          color: 'Preto Ônix',
          size: 'M',
          price: 79.90,
          quantity: 1
        }
      ],
      paymentMethod: 'cartao',
      deliveryType: 'retirada',
      deliveryFee: 0,
      subtotal: 179.80,
      total: 179.80,
      status: 'novo'
    },
    ...SAMPLE_PAST_ORDERS
  ];
}

/** IDs dos pedidos de exemplo. Relatorios e caixa os ignoram para nao misturar dados falsos. */
export const SAMPLE_ORDER_IDS: ReadonlySet<string> = new Set([
  'HM-1062',
  'HM-1066',
  'HM-1070',
  'HM-1073',
  'HM-1077',
  'HM-1080',
  'HM-1082',
  'HM-1083',
]);
