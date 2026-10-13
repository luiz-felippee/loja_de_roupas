// Login da equipe: senha verificada com PBKDF2 e sessao em cookie HttpOnly.
// O Worker limita PBKDF2 a 100 mil iteracoes.

const ITERACOES = 100000;
const SESSAO_HORAS = 12;
export const COOKIE = 'hm_staff';

const bytesParaB64 = (bytes: ArrayBuffer | Uint8Array): string => {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let texto = '';
  for (const b of arr) texto += String.fromCharCode(b);
  return btoa(texto);
};
const b64ParaBytes = (texto: string): Uint8Array<ArrayBuffer> => {
  const bin = atob(texto);
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};

async function derivar(senha: string, sal: Uint8Array<ArrayBuffer>, iteracoes: number): Promise<ArrayBuffer> {
  const chave = await crypto.subtle.importKey('raw', new TextEncoder().encode(senha), 'PBKDF2', false, ['deriveBits']);
  return crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: sal, iterations: iteracoes }, chave, 256);
}

/** Confere a senha contra um hash no formato pbkdf2$iteracoes$sal$hash (comparacao em tempo constante). */
export async function senhaConfere(senha: string, armazenado: string): Promise<boolean> {
  const [alg, iter, salB64, hashB64] = armazenado.split('$');
  if (alg !== 'pbkdf2' || !iter || !salB64 || !hashB64) return false;
  const calculado = new Uint8Array(await derivar(senha, b64ParaBytes(salB64), Number(iter)));
  const esperado = b64ParaBytes(hashB64);
  if (calculado.length !== esperado.length) return false;
  let diferenca = 0;
  for (let i = 0; i < calculado.length; i++) diferenca |= calculado[i] ^ esperado[i];
  return diferenca === 0;
}

export async function gerarHashSenha(senha: string): Promise<string> {
  const sal = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivar(senha, sal, ITERACOES);
  return `pbkdf2$${ITERACOES}$${bytesParaB64(sal)}$${bytesParaB64(hash)}`;
}

async function sha256Hex(texto: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Cria uma sessao e devolve o token em claro (so vai para o cookie). */
export async function criarSessao(db: D1Database): Promise<{ token: string; expiraEm: Date }> {
  const token = bytesParaB64(crypto.getRandomValues(new Uint8Array(32)));
  const expiraEm = new Date(Date.now() + SESSAO_HORAS * 3600_000);
  await db.prepare('INSERT INTO sessions (token_hash, expires_at) VALUES (?, ?)')
    .bind(await sha256Hex(token), expiraEm.toISOString())
    .run();
  return { token, expiraEm };
}

export async function sessaoValida(db: D1Database, request: Request): Promise<boolean> {
  const cookie = request.headers.get('Cookie') ?? '';
  const token = cookie.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
  if (!token) return false;
  const linha = await db.prepare('SELECT expires_at FROM sessions WHERE token_hash = ?')
    .bind(await sha256Hex(token))
    .first<{ expires_at: string }>();
  if (!linha) return false;
  if (new Date(linha.expires_at).getTime() < Date.now()) {
    await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256Hex(token)).run();
    return false;
  }
  return true;
}

export async function encerrarSessao(db: D1Database, request: Request): Promise<void> {
  const cookie = request.headers.get('Cookie') ?? '';
  const token = cookie.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
  if (token) await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256Hex(token)).run();
}

export function cookieSessao(token: string, expiraEm: Date): string {
  return `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Expires=${expiraEm.toUTCString()}`;
}

export const cookieExpirado = `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
