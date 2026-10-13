export type ProductCategory = 'polo' | 'times' | 'bermuda' | 'regata';

export type ProductSize = 'P' | 'M' | 'G' | 'GG';

export interface ProductColor {
  name: string;
  hex: string;
  imageModifier?: string;
}

export interface ProductTechnicalSpecs {
  material: string;
  fit: string;
  collarOrCut: string;
  breathability: string;
  fabricWeight: string;
  usage: string;
  care: string;
  origin: string;
  warranty: string;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  image: string;
  price: number;
  promoPrice?: number;
  isPromo: boolean;
  colors: ProductColor[];
  sizes: ProductSize[];
  stock: number;
  description: string;
  specs?: Partial<ProductTechnicalSpecs>;
}

export interface Customer {
  name: string;
  phone: string;
  address: string;
  neighborhood?: string;
  reference?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  color: string;
  size: ProductSize;
  price: number;
  quantity: number;
}

export type PaymentMethod = 'pix' | 'cartao' | 'dinheiro';

export type DeliveryType = 'retirada' | 'entrega_loja' | 'motoqueiro_cliente';

export type OrderStatus = 'novo' | 'separacao' | 'pronto' | 'finalizado';

export interface Order {
  id: string;
  createdAt: string;
  customer: Customer;
  items: OrderItem[];
  paymentMethod: PaymentMethod;
  cashChangeFor?: number;
  deliveryType: DeliveryType;
  deliveryFee: number;
  subtotal: number;
  total: number;
  status: OrderStatus;
  updatedAt: string;
}

export interface StoreSettings {
  storeName: string;
  deliveryFee: number;
  pixKey: string;
  pixKeyType?: 'celular' | 'cpf_cnpj' | 'email' | 'aleatoria';
  pixName: string;
  pixCity?: string;
  whatsapp: string;
  storeAddress: string;
  staffPassword: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning' | 'alert' | 'order_update';
  orderId?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ProductReview {
  id: string;
  productId: string;
  author: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  purchasedSize: ProductSize;
  recommends: boolean;
  createdAt: string;
  isVerifiedPurchase: boolean;
}

export interface ShippingOption {
  id: string;
  name: string;
  deadline: string;
  price: number;
  carrier: string;
  freeAbove?: number;
}

export interface VirtualFittingResult {
  recommendedSize: ProductSize;
  confidence: number; // 0 - 100
  fitFeeling: 'slim' | 'regular' | 'oversized';
  chestRecommendation: string;
  lengthRecommendation: string;
  tip: string;
}

