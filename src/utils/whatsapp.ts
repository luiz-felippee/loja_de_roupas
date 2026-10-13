import type { Order } from '../types';

/** Converte o telefone do cliente para o formato wa.me (DDI 55 + DDD + numero). */
export function telefoneWhatsapp(telefone: string): string | null {
  const digitos = telefone.replace(/\D/g, '');
  if (digitos.length < 10) return null;
  return digitos.startsWith('55') ? digitos : `55${digitos}`;
}

export function mensagemStatus(pedido: Order): string {
  const nome = pedido.customer.name.split(' ')[0];
  const base = `Olá, ${nome}! `;
  switch (pedido.status) {
    case 'novo':
      return `${base}Recebemos seu pedido ${pedido.id} na Henrique Multimarcas.`;
    case 'separacao':
      return `${base}Seu pedido ${pedido.id} está em separação.`;
    case 'pronto':
      return pedido.deliveryType === 'retirada'
        ? `${base}Seu pedido ${pedido.id} está pronto para retirada na loja.`
        : `${base}Seu pedido ${pedido.id} está pronto e vai sair para entrega.`;
    case 'finalizado':
      return `${base}Seu pedido ${pedido.id} foi finalizado. Obrigado pela preferência!`;
  }
}

/** Link que abre o WhatsApp com a mensagem da etapa atual. Nao envia sozinho: a loja confirma. */
export function linkWhatsappCliente(pedido: Order): string | null {
  const numero = telefoneWhatsapp(pedido.customer.phone);
  if (!numero) return null;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagemStatus(pedido))}`;
}
