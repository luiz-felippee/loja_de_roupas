import { useEffect, useState } from 'react';
import type { CashMovementKind, CashSession } from '../../types';
import { readStorage, writeStorage } from '../../utils/storage';
import type { AddToast } from './types';

/** Controle de caixa: uma sessao aberta por vez, com reforcos, sangrias e fechamento. */
export function useCash(addToast: AddToast) {
  const [cashSessions, setCashSessions] = useState<CashSession[]>(() =>
    readStorage<CashSession[]>('hm_cash_sessions', []),
  );

  useEffect(() => {
    writeStorage('hm_cash_sessions', cashSessions);
  }, [cashSessions]);

  const currentCashSession = cashSessions.find((s) => !s.closedAt) ?? null;

  const openCash = (openingFloat: number) => {
    if (currentCashSession) {
      addToast('Caixa já está aberto', 'Feche o caixa atual antes de abrir outro.', 'error');
      return;
    }
    const agora = new Date().toISOString();
    setCashSessions((prev) => [
      { id: crypto.randomUUID(), openedAt: agora, openingFloat, movements: [] },
      ...prev,
    ]);
    addToast('Caixa aberto', `Fundo de troco: R$ ${openingFloat.toFixed(2).replace('.', ',')}`, 'success');
  };

  const addCashMovement = (kind: CashMovementKind, amount: number, note: string) => {
    if (!currentCashSession) return;
    const id = currentCashSession.id;
    const movimento = { id: crypto.randomUUID(), at: new Date().toISOString(), kind, amount, note: note.trim() };
    setCashSessions((prev) => prev.map((s) => (s.id === id ? { ...s, movements: [...s.movements, movimento] } : s)));
  };

  const closeCash = (countedAmount: number) => {
    if (!currentCashSession) return;
    const id = currentCashSession.id;
    setCashSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, closedAt: new Date().toISOString(), countedAmount } : s)),
    );
    addToast('Caixa fechado', 'O fechamento foi registrado.', 'info');
  };

  return { cashSessions, currentCashSession, openCash, addCashMovement, closeCash };
}
