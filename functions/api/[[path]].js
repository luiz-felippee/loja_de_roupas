// Proxy same-origin: o site chama /api/* no proprio dominio e a Cloudflare repassa para o Worker.
// Assim os cookies da equipe (HttpOnly, SameSite=Lax) funcionam sem CORS.
const ORIGEM_API = 'https://henrique-multimarcas-api.luizfelipe201798.workers.dev';
const TENTATIVAS_LEITURA = 3;

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const leitura = request.method === 'GET' || request.method === 'HEAD';
  const destino = ORIGEM_API + url.pathname + url.search;

  // Leituras podem ser repetidas com seguranca. Escritas (pedido, login) nunca sao repetidas.
  const tentativas = leitura ? TENTATIVAS_LEITURA : 1;
  let ultimoErro;
  for (let i = 0; i < tentativas; i++) {
    try {
      const resposta = await fetch(destino, {
        method: request.method,
        headers: request.headers,
        body: leitura ? undefined : request.body,
        redirect: 'manual',
      });
      if (resposta.status < 500 || i === tentativas - 1) return resposta;
    } catch (erro) {
      ultimoErro = erro;
    }
  }
  return new Response(JSON.stringify({ error: 'Servico temporariamente indisponivel. Tente de novo.' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
