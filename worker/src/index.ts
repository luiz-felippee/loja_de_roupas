/// <reference types="@cloudflare/workers-types" />
import { cookieExpirado, cookieSessao, criarSessao, encerrarSessao, senhaConfere, sessaoValida } from './auth';
import { CouponRow, ProductRow, centavos, precoVigente, validarCupom } from './pricing';

export interface Env {
  DB: D1Database;
}

type Json = Record<string, unknown>;

const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  });

const erro = (mensagem: string, status = 400) => json({ error: mensagem }, status);

const PAGAMENTOS = ['pix', 'cartao', 'dinheiro'];
const RECEBIMENTOS = ['retirada', 'entrega_loja', 'motoqueiro_cliente'];
const ETAPAS = ['novo', 'separacao', 'pronto', 'finalizado'];
const CATEGORIAS = ['polo', 'times', 'bermuda', 'regata'];
const TAMANHOS = ['P', 'M', 'G', 'GG'];

const lerJson = async (request: Request): Promise<Json | null> => {
  try {
    const corpo = await request.json();
    return corpo && typeof corpo === 'object' && !Array.isArray(corpo) ? (corpo as Json) : null;
  } catch {
    return null;
  }
};

const texto = (v: unknown, max = 200): string | null => {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t && t.length <= max ? t : null;
};

const numero = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

/** Produto no formato usado pelo site (src/types). Promocao so aparece enquanto estiver vigente. */
function mapProduto(r: ProductRow, agora = new Date()) {
  const vigente = precoVigente(r, agora);
  const isPromo = vigente < r.price;
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    image: r.photo ?? '',
    price: r.price,
    promoPrice: isPromo ? vigente : undefined,
    isPromo,
    stock: r.stock,
    colors: JSON.parse(r.colors_json),
    sizes: JSON.parse(r.sizes_json),
    description: r.description ?? '',
    specs: r.specs_json ? JSON.parse(r.specs_json) : undefined,
  };
}

/** Versao da equipe: traz tambem a data de fim da promocao e produtos inativos. */
function mapProdutoEquipe(r: ProductRow & { active: number }) {
  return { ...mapProduto(r), promoEnds: r.promo_ends ?? undefined, active: r.active === 1 };
}

const mapCupom = (c: CouponRow) => ({
  id: c.id,
  code: c.code,
  type: c.type,
  value: c.value,
  minOrder: c.min_order,
  validFrom: c.valid_from ?? undefined,
  validUntil: c.valid_until ?? undefined,
  maxUses: c.max_uses ?? undefined,
  uses: c.uses,
  active: c.active === 1,
});

const CONFIG_PADRAO = {
  storeName: 'Henrique Multimarcas',
  deliveryFee: 10,
  pixKey: '11987654321',
  pixKeyType: 'celular',
  pixName: 'Henrique Multimarcas ME',
  pixCity: 'SAO PAULO',
  whatsapp: '5511987654321',
  storeAddress: 'Rua do Comércio, 120 - Centro Comercial (Loja 04)',
};
type Config = typeof CONFIG_PADRAO;

/** Configuracoes da loja (sem a senha da equipe), guardadas num registro JSON da tabela settings. */
async function lerConfig(db: D1Database): Promise<Config> {
  const linha = await db.prepare("SELECT value FROM settings WHERE key = 'store_settings'").first<{ value: string }>();
  return { ...CONFIG_PADRAO, ...(linha ? JSON.parse(linha.value) : {}) };
}

// ---------- Validacao de produto (equipe) ----------

interface ProdutoEntrada {
  name: string;
  category: string;
  description: string;
  image: string | null;
  price: number;
  promoPrice: number | null;
  promoEnds: string | null;
  stock: number;
  colors: { name: string; hex: string }[];
  sizes: string[];
  specs: Json | null;
}

function validarProduto(corpo: Json, parcial: boolean): ProdutoEntrada | string {
  const nome = texto(corpo.name, 150);
  const categoria = corpo.category as string;
  const preco = numero(corpo.price);
  const estoque = numero(corpo.stock);
  if ((!parcial || corpo.name !== undefined) && !nome) return 'Informe o nome do produto.';
  if ((!parcial || corpo.category !== undefined) && !CATEGORIAS.includes(categoria)) return 'Categoria inválida.';
  if ((!parcial || corpo.price !== undefined) && (preco === null || preco <= 0)) return 'Valor inválido.';
  if ((!parcial || corpo.stock !== undefined) && (estoque === null || !Number.isInteger(estoque) || estoque < 0)) return 'Estoque inválido.';

  const cores = Array.isArray(corpo.colors) ? (corpo.colors as Json[]) : [];
  const tamanhos = Array.isArray(corpo.sizes) ? (corpo.sizes as string[]) : [];
  if (!parcial || corpo.colors !== undefined) {
    if (cores.length === 0 || cores.some((c) => !texto(c.name, 40) || typeof c.hex !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(c.hex))) {
      return 'Informe ao menos uma cor válida (nome e hex).';
    }
  }
  if (!parcial || corpo.sizes !== undefined) {
    if (tamanhos.length === 0 || tamanhos.some((t) => !TAMANHOS.includes(t))) return 'Tamanhos devem ser P, M, G ou GG.';
  }

  const promo = corpo.promoPrice === null || corpo.promoPrice === undefined ? null : numero(corpo.promoPrice);
  if (corpo.promoPrice !== null && corpo.promoPrice !== undefined && promo === null) return 'Valor promocional inválido.';
  if (promo !== null && preco !== null && !(promo > 0 && promo < preco)) return 'O valor promocional deve ser menor que o valor normal.';

  return {
    name: nome ?? '',
    category: categoria,
    description: texto(corpo.description, 2000) ?? '',
    image: typeof corpo.image === 'string' ? corpo.image : null,
    price: preco ?? 0,
    promoPrice: promo,
    promoEnds: typeof corpo.promoEnds === 'string' && corpo.promoEnds ? corpo.promoEnds : null,
    stock: estoque ?? 0,
    colors: cores.map((c) => ({ name: String(c.name), hex: String(c.hex) })),
    sizes: tamanhos,
    specs: corpo.specs && typeof corpo.specs === 'object' ? (corpo.specs as Json) : null,
  };
}

// ---------- Pedidos ----------

async function criarPedido(request: Request, env: Env): Promise<Response> {
  const corpo = await lerJson(request);
  if (!corpo) return erro('Corpo inválido.');

  const cli = corpo.customer as Json | undefined;
  const nome = texto(cli?.name, 120);
  const telefone = texto(cli?.phone, 30);
  const endereco = texto(cli?.address, 300);
  if (!nome || !telefone || !endereco) return erro('Informe nome, telefone e endereço.');

  const pagamento = corpo.paymentMethod as string;
  const recebimento = corpo.deliveryType as string;
  if (!PAGAMENTOS.includes(pagamento)) return erro('Forma de pagamento inválida.');
  if (!RECEBIMENTOS.includes(recebimento)) return erro('Forma de recebimento inválida.');

  const itens = Array.isArray(corpo.items) ? (corpo.items as Json[]) : [];
  if (itens.length === 0 || itens.length > 50) return erro('O pedido precisa de 1 a 50 itens.');

  const pedidoItens: { productId: string; color: string; size: string; quantity: number }[] = [];
  for (const i of itens) {
    const qtd = Number(i.quantity);
    const productId = texto(i.productId, 60);
    const color = texto(i.color, 60);
    const size = texto(i.size, 10);
    if (!productId || !color || !size || !Number.isInteger(qtd) || qtd < 1 || qtd > 99) {
      return erro('Item do pedido inválido.');
    }
    pedidoItens.push({ productId, color, size, quantity: qtd });
  }

  const ids = [...new Set(pedidoItens.map((i) => i.productId))];
  const { results: produtosRaw } = await env.DB.prepare(
    `SELECT * FROM products WHERE active = 1 AND id IN (${ids.map(() => '?').join(',')})`,
  ).bind(...ids).all<ProductRow>();
  const produtos = new Map(produtosRaw.map((p) => [p.id, p]));

  const agregado = new Map<string, number>();
  for (const i of pedidoItens) agregado.set(i.productId, (agregado.get(i.productId) ?? 0) + i.quantity);
  for (const [id, qtd] of agregado) {
    const p = produtos.get(id);
    if (!p) return erro('Um dos produtos não está mais disponível.', 409);
    if (qtd > p.stock) return erro(`Estoque insuficiente para ${p.name}. Restam ${p.stock} unidade(s).`, 409);
  }

  // Preco e variacoes vem do servidor, nunca do cliente
  const linhas: { productId: string; name: string; color: string; size: string; quantity: number; price: number; image: string | null }[] = [];
  for (const i of pedidoItens) {
    const p = produtos.get(i.productId)!;
    const cores: { name: string }[] = JSON.parse(p.colors_json);
    const tamanhos: string[] = JSON.parse(p.sizes_json);
    if (!cores.some((c) => c.name === i.color) || !tamanhos.includes(i.size)) return erro('Cor ou tamanho inválido.');
    linhas.push({ ...i, name: p.name, price: precoVigente(p), image: p.photo });
  }
  const subtotal = centavos(linhas.reduce((s, l) => s + l.price * l.quantity, 0));

  let cupomCodigo: string | null = null;
  let desconto = 0;
  if (typeof corpo.couponCode === 'string' && corpo.couponCode.trim()) {
    const linha = await env.DB.prepare('SELECT * FROM coupons WHERE code = ?')
      .bind(corpo.couponCode.trim().toUpperCase())
      .first<CouponRow>();
    const r = validarCupom(linha ?? null, subtotal);
    if (!r.ok) return erro(r.motivo, 409);
    cupomCodigo = r.coupon.code;
    desconto = r.discount;
  }

  const taxaEntrega = recebimento === 'entrega_loja' ? (await lerConfig(env.DB)).deliveryFee : 0;
  const total = centavos(subtotal - desconto + taxaEntrega);
  const agora = new Date().toISOString();

  for (let tentativa = 0; tentativa < 3; tentativa++) {
    const id = `HM-${Math.floor(1000 + Math.random() * 9000)}`;
    const comandos = [
      env.DB.prepare(
        `INSERT INTO orders (id, created_at, updated_at, status, customer_name, customer_phone, customer_address,
          customer_neighborhood, customer_reference, payment_method, cash_change_for, delivery_type, delivery_fee,
          subtotal, coupon_code, discount, total)
         VALUES (?, ?, ?, 'novo', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(
        id, agora, agora, nome, telefone, endereco,
        texto(cli?.neighborhood, 100), texto(cli?.reference, 200),
        pagamento,
        numero(corpo.cashChangeFor),
        recebimento, taxaEntrega, subtotal, cupomCodigo, desconto, total,
      ),
      ...linhas.map((l) =>
        env.DB.prepare(
          'INSERT INTO order_items (order_id, product_id, name, color, size, price, quantity, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        ).bind(id, l.productId, l.name, l.color, l.size, l.price, l.quantity, l.image),
      ),
      // CHECK (stock >= 0) na tabela faz o lote inteiro falhar se o estoque acabar agora
      ...[...agregado].map(([pid, qtd]) =>
        env.DB.prepare('UPDATE products SET stock = stock - ?, updated_at = ? WHERE id = ?').bind(qtd, agora, pid),
      ),
      ...(cupomCodigo
        ? [env.DB.prepare('UPDATE coupons SET uses = uses + 1 WHERE code = ?').bind(cupomCodigo)]
        : []),
    ];
    try {
      await env.DB.batch(comandos);
      return json({ id, status: 'novo', subtotal, discount: desconto, deliveryFee: taxaEntrega, total }, 201);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      if (msg.includes('UNIQUE') && msg.includes('orders')) continue;
      if (msg.includes('CHECK')) return erro('Estoque insuficiente no momento. Atualize a página.', 409);
      throw e;
    }
  }
  return erro('Não foi possível gerar o pedido. Tente de novo.', 503);
}

async function itensDoPedido(env: Env, codigo: string) {
  const { results } = await env.DB.prepare(
    'SELECT product_id, name, color, size, price, quantity, image FROM order_items WHERE order_id = ?',
  ).bind(codigo).all<Json>();
  return results.map((it) => ({
    productId: it.product_id,
    name: it.name,
    color: it.color,
    size: it.size,
    price: it.price,
    quantity: it.quantity,
    image: it.image ?? undefined,
  }));
}

async function acompanharPedido(codigo: string, env: Env): Promise<Response> {
  const pedido = await env.DB.prepare(
    'SELECT id, status, created_at, updated_at, delivery_type, payment_method, subtotal, discount, delivery_fee, total FROM orders WHERE id = ?',
  ).bind(codigo.toUpperCase()).first<Json>();
  if (!pedido) return erro('Pedido não encontrado.', 404);
  // Publico: sem dados pessoais do cliente
  return json({
    id: pedido.id,
    status: pedido.status,
    createdAt: pedido.created_at,
    updatedAt: pedido.updated_at,
    deliveryType: pedido.delivery_type,
    paymentMethod: pedido.payment_method,
    subtotal: pedido.subtotal,
    discount: pedido.discount,
    deliveryFee: pedido.delivery_fee,
    total: pedido.total,
    items: await itensDoPedido(env, pedido.id as string),
  });
}

async function listarPedidos(env: Env): Promise<Response> {
  const { results: pedidos } = await env.DB.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 500').all<Json>();
  const { results: itens } = await env.DB.prepare(
    'SELECT order_id, product_id, name, color, size, price, quantity, image FROM order_items WHERE order_id IN (SELECT id FROM orders ORDER BY created_at DESC LIMIT 500)',
  ).all<Json>();
  const porPedido = new Map<string, Json[]>();
  for (const it of itens) {
    const lista = porPedido.get(it.order_id as string) ?? [];
    lista.push({ productId: it.product_id, name: it.name, color: it.color, size: it.size, price: it.price, quantity: it.quantity, image: it.image ?? undefined });
    porPedido.set(it.order_id as string, lista);
  }
  return json(
    pedidos.map((p) => ({
      id: p.id,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      status: p.status,
      customer: { name: p.customer_name, phone: p.customer_phone, address: p.customer_address, neighborhood: p.customer_neighborhood ?? undefined, reference: p.customer_reference ?? undefined },
      paymentMethod: p.payment_method,
      cashChangeFor: p.cash_change_for ?? undefined,
      deliveryType: p.delivery_type,
      deliveryFee: p.delivery_fee,
      subtotal: p.subtotal,
      couponCode: p.coupon_code ?? undefined,
      discount: p.discount,
      total: p.total,
      items: porPedido.get(p.id as string) ?? [],
    })),
  );
}

// ---------- Roteamento ----------

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const m = request.method;
    const p = url.pathname;

    try {
      if (m === 'GET' && p === '/api/health') return json({ ok: true });

      // ----- Publicos -----
      if (m === 'GET' && p === '/api/products') {
        const { results } = await env.DB.prepare('SELECT * FROM products WHERE active = 1 ORDER BY name').all<ProductRow>();
        return json(results.map((r) => mapProduto(r)));
      }
      if (m === 'GET' && p === '/api/settings') return json(await lerConfig(env.DB));

      if (m === 'POST' && p === '/api/coupons/validate') {
        const c = await lerJson(request);
        const subtotal = numero(c?.subtotal) ?? 0;
        const codigo = texto(c?.code, 40)?.toUpperCase() ?? '';
        const linha = codigo ? await env.DB.prepare('SELECT * FROM coupons WHERE code = ?').bind(codigo).first<CouponRow>() : null;
        const r = validarCupom(linha ?? null, subtotal);
        if (!r.ok) return json({ ok: false, motivo: r.motivo });
        return json({ ok: true, code: r.coupon.code, discount: r.discount });
      }

      if (m === 'POST' && p === '/api/orders') return criarPedido(request, env);
      const acomp = p.match(/^\/api\/orders\/([A-Za-z0-9-]{4,20})$/);
      if (m === 'GET' && acomp) return acompanharPedido(acomp[1], env);

      if (m === 'POST' && p === '/api/staff/login') {
        const corpo = await lerJson(request);
        const senha = typeof corpo?.password === 'string' ? corpo.password : '';
        const armazenado = await env.DB.prepare("SELECT value FROM settings WHERE key = 'staff_password_hash'").first<{ value: string }>();
        if (!armazenado) return erro('Senha da equipe não configurada.', 503);
        if (!(await senhaConfere(senha, armazenado.value))) return erro('Senha incorreta.', 401);
        const { token, expiraEm } = await criarSessao(env.DB);
        return json({ ok: true }, 200, { 'Set-Cookie': cookieSessao(token, expiraEm) });
      }
      if (m === 'POST' && p === '/api/staff/logout') {
        await encerrarSessao(env.DB, request);
        return json({ ok: true }, 200, { 'Set-Cookie': cookieExpirado });
      }
      if (m === 'GET' && p === '/api/staff/session') {
        return json({ ok: await sessaoValida(env.DB, request) });
      }

      // ----- Restritos a equipe -----
      if (p.startsWith('/api/admin/')) {
        if (!(await sessaoValida(env.DB, request))) return erro('Acesso restrito à equipe.', 401);

        if (m === 'GET' && p === '/api/admin/orders') return listarPedidos(env);

        if (m === 'PATCH' && p === '/api/admin/settings') {
          const c = await lerJson(request);
          if (!c) return erro('Corpo inválido.');
          const atual = await lerConfig(env.DB);
          const taxa = numero(c.deliveryFee);
          const novo: Config = {
            storeName: texto(c.storeName, 80) ?? atual.storeName,
            deliveryFee: taxa !== null && taxa >= 0 ? taxa : atual.deliveryFee,
            pixKey: texto(c.pixKey, 80) ?? atual.pixKey,
            pixKeyType: texto(c.pixKeyType, 20) ?? atual.pixKeyType,
            pixName: texto(c.pixName, 80) ?? atual.pixName,
            pixCity: texto(c.pixCity, 40) ?? atual.pixCity,
            whatsapp: texto(c.whatsapp, 20) ?? atual.whatsapp,
            storeAddress: texto(c.storeAddress, 200) ?? atual.storeAddress,
          };
          await env.DB.prepare("INSERT INTO settings (key, value) VALUES ('store_settings', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
            .bind(JSON.stringify(novo))
            .run();
          return json(novo);
        }

        const pedidoApagar = p.match(/^\/api\/admin\/orders\/([A-Za-z0-9-]{4,20})$/);
        if (m === 'DELETE' && pedidoApagar) {
          const r = await env.DB.prepare('DELETE FROM orders WHERE id = ?').bind(pedidoApagar[1].toUpperCase()).run();
          if (!r.meta.changes) return erro('Pedido não encontrado.', 404);
          return json({ ok: true });
        }

        const etapa = p.match(/^\/api\/admin\/orders\/([A-Za-z0-9-]{4,20})$/);
        if (m === 'PATCH' && etapa) {
          const corpo = await lerJson(request);
          const status = corpo?.status as string;
          if (!ETAPAS.includes(status)) return erro('Etapa inválida.');
          const r = await env.DB.prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?')
            .bind(status, new Date().toISOString(), etapa[1].toUpperCase())
            .run();
          if (!r.meta.changes) return erro('Pedido não encontrado.', 404);
          return json({ ok: true, status });
        }

        if (m === 'GET' && p === '/api/admin/products') {
          const { results } = await env.DB.prepare('SELECT * FROM products ORDER BY name').all<ProductRow & { active: number }>();
          return json(results.map(mapProdutoEquipe));
        }
        if (m === 'POST' && p === '/api/admin/products') {
          const corpo = await lerJson(request);
          if (!corpo) return erro('Corpo inválido.');
          const v = validarProduto(corpo, false);
          if (typeof v === 'string') return erro(v);
          const id = crypto.randomUUID();
          await env.DB.prepare(
            `INSERT INTO products (id, name, category, description, photo, price, promo_price, promo_ends, stock, colors_json, sizes_json, specs_json, active, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
          ).bind(id, v.name, v.category, v.description, v.image, v.price, v.promoPrice, v.promoEnds, v.stock,
            JSON.stringify(v.colors), JSON.stringify(v.sizes), v.specs ? JSON.stringify(v.specs) : null, new Date().toISOString()).run();
          return json({ id }, 201);
        }
        const produto = p.match(/^\/api\/admin\/products\/([A-Za-z0-9-]{1,60})$/);
        if (m === 'PATCH' && produto) {
          const corpo = await lerJson(request);
          if (!corpo) return erro('Corpo inválido.');
          const atual = await env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(produto[1]).first<ProductRow>();
          if (!atual) return erro('Produto não encontrado.', 404);
          const v = validarProduto(corpo, true);
          if (typeof v === 'string') return erro(v);
          // Campos ausentes mantem o valor atual
          const campos = {
            name: corpo.name !== undefined ? v.name : atual.name,
            category: corpo.category !== undefined ? v.category : atual.category,
            description: corpo.description !== undefined ? v.description : (atual.description ?? ''),
            photo: corpo.image !== undefined ? v.image : atual.photo,
            price: corpo.price !== undefined ? v.price : atual.price,
            promo_price: corpo.promoPrice !== undefined ? v.promoPrice : atual.promo_price,
            promo_ends: corpo.promoEnds !== undefined ? v.promoEnds : atual.promo_ends,
            stock: corpo.stock !== undefined ? v.stock : atual.stock,
            colors_json: corpo.colors !== undefined ? JSON.stringify(v.colors) : atual.colors_json,
            sizes_json: corpo.sizes !== undefined ? JSON.stringify(v.sizes) : atual.sizes_json,
            specs_json: corpo.specs !== undefined ? (v.specs ? JSON.stringify(v.specs) : null) : atual.specs_json,
            active: corpo.active !== undefined ? (corpo.active ? 1 : 0) : atual.active,
          };
          if (campos.promo_price !== null && campos.promo_price >= campos.price) return erro('O valor promocional deve ser menor que o valor normal.');
          await env.DB.prepare(
            `UPDATE products SET name=?, category=?, description=?, photo=?, price=?, promo_price=?, promo_ends=?, stock=?,
             colors_json=?, sizes_json=?, specs_json=?, active=?, updated_at=? WHERE id=?`,
          ).bind(campos.name, campos.category, campos.description, campos.photo, campos.price, campos.promo_price, campos.promo_ends,
            campos.stock, campos.colors_json, campos.sizes_json, campos.specs_json, campos.active, new Date().toISOString(), produto[1]).run();
          return json({ ok: true });
        }

        if (m === 'GET' && p === '/api/admin/coupons') {
          const { results } = await env.DB.prepare('SELECT * FROM coupons ORDER BY code').all<CouponRow>();
          return json(results.map(mapCupom));
        }
        if (m === 'POST' && p === '/api/admin/coupons') {
          const c = await lerJson(request);
          const codigo = texto(c?.code, 40)?.toUpperCase();
          const tipo = c?.type as string;
          const valor = numero(c?.value);
          if (!codigo) return erro('Informe o código do cupom.');
          if (tipo !== 'percent' && tipo !== 'fixed') return erro('Tipo de cupom inválido.');
          if (valor === null || valor <= 0 || (tipo === 'percent' && valor > 100)) return erro('Valor do desconto inválido.');
          const id = crypto.randomUUID();
          try {
            await env.DB.prepare(
              'INSERT INTO coupons (id, code, type, value, min_order, valid_from, valid_until, max_uses, uses, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 1)',
            ).bind(id, codigo, tipo, valor, numero(c?.minOrder) ?? 0,
              texto(c?.validFrom, 10), texto(c?.validUntil, 10), numero(c?.maxUses)).run();
          } catch (e) {
            if (e instanceof Error && e.message.includes('UNIQUE')) return erro('Já existe um cupom com este código.', 409);
            throw e;
          }
          return json({ id, code: codigo }, 201);
        }
        const cupom = p.match(/^\/api\/admin\/coupons\/([A-Za-z0-9-]{1,60})$/);
        if (m === 'PATCH' && cupom) {
          const c = await lerJson(request);
          if (!c) return erro('Corpo inválido.');
          const r = await env.DB.prepare('UPDATE coupons SET active = COALESCE(?, active), value = COALESCE(?, value), min_order = COALESCE(?, min_order), valid_from = COALESCE(?, valid_from), valid_until = COALESCE(?, valid_until), max_uses = COALESCE(?, max_uses) WHERE id = ?')
            .bind(
              typeof c.active === 'boolean' ? (c.active ? 1 : 0) : null,
              numero(c.value), numero(c.minOrder), texto(c.validFrom, 10), texto(c.validUntil, 10), numero(c.maxUses),
              cupom[1],
            ).run();
          if (!r.meta.changes) return erro('Cupom não encontrado.', 404);
          return json({ ok: true });
        }
      }

      return erro('Rota não encontrada.', 404);
    } catch (e) {
      console.error(e);
      return erro('Erro interno.', 500);
    }
  },
};

