import { describe, expect, it } from 'vitest';
import { linkWhatsappCliente, telefoneWhatsapp } from './whatsapp';
import type { Order } from '../types';

const pedido = (status: Order['status'], deliveryType: Order['deliveryType'] = 'retirada', phone = '(11) 97111-2233'): Order => ({
  id: 'HM-1234', createdAt: '', updatedAt: '', customer: { name: 'Rafael Mendes', phone, address: '' },
  items: [], paymentMethod: 'pix', deliveryType, deliveryFee: 0, subtotal: 0, total: 0, status,
});

describe('telefoneWhatsapp', () => {
  it('adiciona DDI 55 quando falta', () => {
    expect(telefoneWhatsapp('(11) 97111-2233')).toBe('5511971112233');
  });
  it('mantem o DDI quando ja existe', () => {
    expect(telefoneWhatsapp('+55 11 97111-2233')).toBe('5511971112233');
  });
  it('retorna null para numero incompleto', () => {
    expect(telefoneWhatsapp('9999')).toBeNull();
  });
});

describe('linkWhatsappCliente', () => {
  it('monta o link com a mensagem da etapa', () => {
    const link = linkWhatsappCliente(pedido('separacao'));
    expect(link).toContain('https://wa.me/5511971112233?text=');
    expect(decodeURIComponent(link!.split('text=')[1])).toBe('Olá, Rafael! Seu pedido HM-1234 está em separação.');
  });
  it('mensagem de pronto muda conforme recebimento', () => {
    const retirada = decodeURIComponent(linkWhatsappCliente(pedido('pronto', 'retirada'))!);
    const entrega = decodeURIComponent(linkWhatsappCliente(pedido('pronto', 'entrega_loja'))!);
    expect(retirada).toContain('retirada');
    expect(entrega).toContain('entrega');
  });
  it('retorna null sem telefone valido', () => {
    expect(linkWhatsappCliente(pedido('novo', 'retirada', ''))).toBeNull();
  });
});
