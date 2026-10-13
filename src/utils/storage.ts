/** Leitura e escrita tolerantes a falhas no localStorage (modo privado, cota cheia, JSON invalido). */
export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Sem armazenamento disponivel: o estado segue so em memoria.
  }
}
