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

const lerJson = async (request: Request): Promise<Json | null> => {
  try {
    const corpo = await request.json();
    return corpo && typeof corpo === 'object' ? (corpo as Json) : null;
  } catch {
    return null;
  }
};

const texto = (v: unknown, max = 200): string | null => {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t && t.length <= max ? t : null;
};

const mapProduto = (r: ProductRow) => ({
  id: r.id,
  name: r.name,
  price: r.price,
  promoPrice: r.promo_price ?? undefined,
  promoEnds: r.promo_ends ?? undefined,
  stock: r.stock,
  photo: r.photo ?? undefined,
  colors: JSON.parse(r.colors_json),
  sizes: JSON.parse(r.sizes_json),
});

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

async function configuracao(db: D1Database, chave: string, padrao: string): Promise<string> {
  const linha = await db.prepare('SELECT value FROM settings WHERE key = ?').bind(chave).first<{ value: string }>();
  return linha?.value ?? padrao;
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

  // Quantidades validas e agregadas por produto (para checar estoque de uma vez)
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
  const linhas = pedidoItens.map((i) => {
    const p = produtos.get(i.productId)!;
    const cores: { name: string }[] = JSON.parse(p.colors_json);
    const tamanhos: string[] = JSON.parse(p.sizes_json);
    if (!cores.some((c) => c.name === i.color) || !tamanhos.includes(i.size)) {
      throw new Error('Cor ou tamanho inválido.');
    }
    const unitario = precoVigente(p);
    return { ...i, name: p.name, price: unitario, image: p.photo };
  });
  const subtotal = centavos(linhas.reduce((s, l) => s + l.price * l.quantity, 0));

  // Cupom
  let cupomCodigo: string | undefined;
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

  const taxaEntrega = recebimento === 'entrega_loja' ? Number(await configuracao(env.DB, 'delivery_fee', '10')) : 0;
  const total = centavos(subtotal - desconto + taxaEntrega);
  const agora = new Date().toISOString();

  // Ids curtos e legiveis. Em caso de colisao, tenta de novo.
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
        typeof corpo.cashChangeFor === 'number' ? corpo.cashChangeFor : null,
        recebimento, taxaEntrega, subtotal, cupomCodigo ?? null, desconto, total,
      ),
      ...linhas.map((l) =>
        env.DB.prepare(
          'INSERT INTO order_items (order_id, product_id, name, color, size, price, quantity, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        ).bind(id, l.productId, l.name, l.color, l.size, l.price, l.quantity, l.image ?? null),
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
      if (msg.includes('UNIQUE') && msg.includes('orders')) continue; // colisao de id
      if (msg.includes('CHECK')) return erro('Estoque insuficiente no momento. Atualize a página.', 409);
      throw e;
    }
  }
  return erro('Não foi possível gerar o pedido. Tente de novo.', 503);
}

async function acompanharPedido(codigo: string, env: Env): Promise<Response> {
  const pedido = await env.DB.prepare('SELECT id, status, created_at, delivery_type, total FROM orders WHERE id = ?')
    .bind(codigo.toUpperCase())
    .first<{ id: string; status: string; created_at: string; delivery_type: string; total: number }>();
  if (!pedido) return erro('Pedido não encontrado.', 404);
  // Publico: so o minimo para acompanhar. Dados do cliente ficam restritos a equipe.
  return json({ id: pedido.id, status: pedido.status, createdAt: pedido.created_at, deliveryType: pedido.delivery_type, total: pedido.total });
}

async function listarPedidos(env: Env): Promise<Response> {
  const { results: pedidos } = await env.DB.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 500').all<Json>();
  const { results: itens } = await env.DB.prepare(
    `SELECT order_id, product_id, name, color, size, price, quantity, image FROM order_items WHERE order_id IN (SELECT id FROM orders ORDER BY created_at DESC LIMIT 500)`,
  ).all<Json>();
  const porPedido = new Map<string, Json[]>();
  for (const it of itens) {
    const lista = porPedido.get(it.order_id as string) ?? [];
    lista.push({ productId: it.product_id, name: it.name, color: it.color, size: it.size, price: it.price, quantity: it.quantity, image: it.image });
    porPedido.set(it.order_id as string, lista);
  }
  return json(
    pedidos.map((p) => ({
      id: p.id,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      status: p.status,
      customer: { name: p.customer_name, phone: p.customer_phone, address: p.customer_address, neighborhood: p.customer_neighborhood, reference: p.customer_reference },
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

      // Publicos
      if (m === 'GET' && p === '/api/products') {
        const { results } = await env.DB.prepare('SELECT * FROM products WHERE active = 1 ORDER BY name').all<ProductRow>();
        return json(results.map(mapProduto));
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

      // Restritos a equipe
      const rotaEquipe = p.startsWith('/api/admin/');
      if (rotaEquipe && !(await sessaoValida(env.DB, request))) return erro('Acesso restrito à equipe.', 401);

      if (rotaEquipe && m === 'GET' && p === '/api/admin/orders') return listarPedidos(env);

      const etapa = p.match(/^\/api\/admin\/orders\/([A-Za-z0-9-]{4,20})$/);
      if (rotaEquipe && m === 'PATCH' && etapa) {
        const corpo = await lerJson(request);
        const status = corpo?.status as string;
        if (!ETAPAS.includes(status)) return erro('Etapa inválida.');
        const r = await env.DB.prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?')
          .bind(status, new Date().toISOString(), etapa[1].toUpperCase())
          .run();
        if (!r.meta.changes) return erro('Pedido não encontrado.', 404);
        return json({ ok: true, status });
      }

      if (rotaEquipe && m === 'GET' && p === '/api/admin/coupons') {
        const { results } = await env.DB.prepare('SELECT * FROM coupons ORDER BY code').all<CouponRow>();
        return json(results.map(mapCupom));
      }

      return erro('Rota não encontrada.', 404);
    } catch (e) {
      console.error(e);
      return erro('Erro interno.', 500);
    }
  },
};
