/// <reference types="@cloudflare/workers-types" />

export interface Env {
  DB: D1Database;
}

interface ProductRow {
  id: string;
  name: string;
  category: string;
  description: string | null;
  photo: string | null;
  price: number;
  promo_price: number | null;
  promo_ends: string | null;
  stock: number;
  colors_json: string;
  sizes_json: string;
}

/** Converte a linha do banco no formato usado pelo site (src/types). */
function toProduct(row: ProductRow) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description ?? '',
    photo: row.photo ?? undefined,
    price: row.price,
    promoPrice: row.promo_price ?? undefined,
    promoEnds: row.promo_ends ?? undefined,
    stock: row.stock,
    colors: JSON.parse(row.colors_json),
    sizes: JSON.parse(row.sizes_json),
  };
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/api/health') {
      return json({ ok: true });
    }

    // Catalogo publico: so produtos ativos.
    if (request.method === 'GET' && url.pathname === '/api/products') {
      const { results } = await env.DB.prepare(
        'SELECT id, name, category, description, photo, price, promo_price, promo_ends, stock, colors_json, sizes_json FROM products WHERE active = 1 ORDER BY name',
      ).all<ProductRow>();
      return json(results.map(toProduct));
    }

    return json({ error: 'Rota nao encontrada.' }, 404);
  },
};
