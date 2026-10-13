/** Cliente da API (Worker na Cloudflare). Em desenvolvimento o Vite encaminha /api para o Worker. */

export class ApiError extends Error {
  status: number;
  constructor(mensagem: string, status: number) {
    super(mensagem);
    this.status = status;
  }
}

export async function api<T>(caminho: string, opcoes: { method?: string; body?: unknown } = {}): Promise<T> {
  const resposta = await fetch(`/api${caminho}`, {
    method: opcoes.method ?? (opcoes.body !== undefined ? 'POST' : 'GET'),
    credentials: 'same-origin',
    headers: opcoes.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: opcoes.body !== undefined ? JSON.stringify(opcoes.body) : undefined,
  });
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    throw new ApiError((dados as { error?: string }).error ?? 'Não foi possível concluir a ação.', resposta.status);
  }
  return dados as T;
}
