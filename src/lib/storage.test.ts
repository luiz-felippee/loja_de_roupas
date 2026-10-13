import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readStorage, writeStorage } from './storage';

function criarLocalStorage(overrides: Partial<Storage> = {}) {
  const dados = new Map<string, string>();
  return {
    getItem: (k: string) => (dados.has(k) ? dados.get(k)! : null),
    setItem: (k: string, v: string) => void dados.set(k, v),
    removeItem: (k: string) => void dados.delete(k),
    clear: () => dados.clear(),
    key: () => null,
    get length() {
      return dados.size;
    },
    ...overrides,
  } as Storage;
}

describe('readStorage', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', criarLocalStorage());
  });

  it('devolve o fallback quando a chave nao existe', () => {
    expect(readStorage('ausente', [1, 2])).toEqual([1, 2]);
  });

  it('le e interpreta o JSON salvo', () => {
    localStorage.setItem('chave', JSON.stringify({ nome: 'HM' }));
    expect(readStorage('chave', null)).toEqual({ nome: 'HM' });
  });

  it('devolve o fallback quando o JSON esta corrompido', () => {
    localStorage.setItem('chave', '{nao-e-json');
    expect(readStorage('chave', 'padrao')).toBe('padrao');
  });

  it('devolve o fallback quando o acesso ao storage falha', () => {
    vi.stubGlobal(
      'localStorage',
      criarLocalStorage({
        getItem: () => {
          throw new Error('modo privado');
        },
      }),
    );
    expect(readStorage('qualquer', 42)).toBe(42);
  });
});

describe('writeStorage', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', criarLocalStorage());
  });

  it('grava o valor serializado em JSON', () => {
    writeStorage('carrinho', [{ id: 'a', qty: 2 }]);
    expect(JSON.parse(localStorage.getItem('carrinho')!)).toEqual([{ id: 'a', qty: 2 }]);
  });

  it('nao lanca erro quando o storage esta cheio ou bloqueado', () => {
    vi.stubGlobal(
      'localStorage',
      criarLocalStorage({
        setItem: () => {
          throw new Error('QuotaExceededError');
        },
      }),
    );
    expect(() => writeStorage('x', { grande: true })).not.toThrow();
  });
});
