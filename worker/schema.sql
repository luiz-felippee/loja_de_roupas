-- Esquema do banco D1 (SQLite). Valores monetarios em REAL (reais), datas em ISO 8601 (UTC).

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  photo TEXT,
  price REAL NOT NULL CHECK (price >= 0),
  promo_price REAL CHECK (promo_price IS NULL OR promo_price >= 0),
  promo_ends TEXT,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  colors_json TEXT NOT NULL DEFAULT '[]',
  sizes_json TEXT NOT NULL DEFAULT '[]',
  active INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('novo', 'separacao', 'pronto', 'finalizado')),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  customer_neighborhood TEXT,
  customer_reference TEXT,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('pix', 'cartao', 'dinheiro')),
  cash_change_for REAL,
  delivery_type TEXT NOT NULL CHECK (delivery_type IN ('retirada', 'entrega_loja', 'motoqueiro_cliente')),
  delivery_fee REAL NOT NULL DEFAULT 0,
  subtotal REAL NOT NULL,
  coupon_code TEXT,
  discount REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  size TEXT NOT NULL,
  price REAL NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  image TEXT
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(customer_phone);

CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('percent', 'fixed')),
  value REAL NOT NULL CHECK (value > 0),
  min_order REAL NOT NULL DEFAULT 0,
  valid_from TEXT,
  valid_until TEXT,
  max_uses INTEGER,
  uses INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS cash_sessions (
  id TEXT PRIMARY KEY,
  opened_at TEXT NOT NULL,
  opening_float REAL NOT NULL DEFAULT 0,
  closed_at TEXT,
  counted_amount REAL
);

CREATE TABLE IF NOT EXISTS cash_movements (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES cash_sessions(id) ON DELETE CASCADE,
  at TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('reforco', 'sangria')),
  amount REAL NOT NULL CHECK (amount > 0),
  note TEXT NOT NULL DEFAULT ''
);

-- Configuracoes da loja (chave/valor). Senha da equipe guardada como hash, nunca em texto puro.
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
