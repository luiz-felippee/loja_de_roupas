import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadOrders } from './sampleOrders';

describe('loadOrders', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => undefined,
    });
  });

  it('retorna pedidos de exemplo quando nao ha nada salvo', () => {
    const pedidos = loadOrders();
    expect(pedidos.length).toBeGreaterThan(0);
  });

  it('nao repete o id de nenhum pedido de exemplo', () => {
    const ids = loadOrders().map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
