import { ProductReview } from '../types';

export const INITIAL_REVIEWS: ProductReview[] = [
  {
    id: 'rev-1',
    productId: '1',
    author: 'Rodrigo Silveira',
    rating: 5,
    title: 'Qualidade absurda, parece de jogo!',
    comment: 'Tecido Dry Pro extremamente leve e respirável. Os detalhes do escudo e o patch são bordados em alta definição. Peguei tamanho G (tenho 1,82m e 82kg) e o caimento ficou impecável.',
    purchasedSize: 'G',
    recommends: true,
    createdAt: '2026-03-28T14:20:00Z',
    isVerifiedPurchase: true
  },
  {
    id: 'rev-2',
    productId: '1',
    author: 'Matheus Fontes',
    rating: 5,
    title: 'Sensacional para treinar e sair',
    comment: 'Não esquenta nada durante a pelada e a secagem é muito rápida. O corte atlético valoriza o shape. Entrega chegou em 2 dias.',
    purchasedSize: 'M',
    recommends: true,
    createdAt: '2026-04-02T10:15:00Z',
    isVerifiedPurchase: true
  },
  {
    id: 'rev-3',
    productId: '1',
    author: 'Lucas Nogueira',
    rating: 4,
    title: 'Muito bonita, forma padrão',
    comment: 'Camisa linda demais. Só achei um pouquinho mais justa no peito, quem gosta de bem solta recomendo pedir um número maior.',
    purchasedSize: 'P',
    recommends: true,
    createdAt: '2026-04-05T19:40:00Z',
    isVerifiedPurchase: true
  },
  {
    id: 'rev-4',
    productId: '2',
    author: 'Carlos Eduardo',
    rating: 5,
    title: 'Elegância pura com caimento nobre',
    comment: 'O piquet é bem encorpado, não amassa fácil e o detalhe dourado na gola dá um ar muito premium. Uso para trabalhar e sair à noite.',
    purchasedSize: 'M',
    recommends: true,
    createdAt: '2026-03-15T11:00:00Z',
    isVerifiedPurchase: true
  },
  {
    id: 'rev-5',
    productId: '2',
    author: 'Felipe Barbosa',
    rating: 5,
    title: 'Melhor polo que já comprei',
    comment: 'Toque macio com elastano, flexível sem perder a estrutura da gola. Lavada na máquina 3 vezes e continua como nova.',
    purchasedSize: 'G',
    recommends: true,
    createdAt: '2026-03-29T16:30:00Z',
    isVerifiedPurchase: true
  },
  {
    id: 'rev-6',
    productId: '3',
    author: 'Gabriel Santos',
    rating: 5,
    title: 'Bolsos com zíper perfeitos',
    comment: 'Bermuda muito confortável! Os bolsos com zíper são essenciais para celular e chaves não caírem durante o treino ou corrida.',
    purchasedSize: 'M',
    recommends: true,
    createdAt: '2026-04-01T08:45:00Z',
    isVerifiedPurchase: true
  },
  {
    id: 'rev-7',
    productId: '3',
    author: 'Thiago Mendes',
    rating: 4,
    title: 'Ótimo custo-benefício',
    comment: 'Comprimento acima do joelho ideal, elástico na cintura reforçado e cordão com ponteira de metal.',
    purchasedSize: 'GG',
    recommends: true,
    createdAt: '2026-04-07T13:10:00Z',
    isVerifiedPurchase: true
  },
  {
    id: 'rev-8',
    productId: '4',
    author: 'Rafael Almeida',
    rating: 5,
    title: 'Corte machão perfeito para academia',
    comment: 'Abertura nas axilas na medida certa, não fica cavada exagerada nem prende o movimento nos treinos pesados de costas e peitoral.',
    purchasedSize: 'G',
    recommends: true,
    createdAt: '2026-04-04T17:00:00Z',
    isVerifiedPurchase: true
  }
];
