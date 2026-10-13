import { describe, expect, it } from 'vitest';
import { generatePixPayload } from './pix';

/** CRC-16/CCITT-FALSE de referencia, usado para conferir o codigo gerado. */
function crcReferencia(texto: string): string {
  let crc = 0xffff;
  for (let i = 0; i < texto.length; i++) {
    crc ^= texto.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

describe('crc de referencia (validacao do proprio teste)', () => {
  it('bate com o vetor padrao CRC-16/CCITT-FALSE', () => {
    expect(crcReferencia('123456789')).toBe('29B1');
  });
});

describe('generatePixPayload', () => {
  const payload = generatePixPayload({
    pixKey: 'teste@hm.com.br',
    merchantName: 'Henrique Multimarcas',
    merchantCity: 'Sao Paulo',
    amount: 99.9,
    txid: 'HM8731',
  });

  it('comeca com o formato EMV e termina com campo de CRC', () => {
    expect(payload.startsWith('000201')).toBe(true);
    expect(payload).toMatch(/6304[0-9A-F]{4}$/);
  });

  it('o CRC final confere com o restante do payload', () => {
    const corpo = payload.slice(0, -4);
    expect(payload.slice(-4)).toBe(crcReferencia(corpo));
  });

  it('inclui o valor com duas casas decimais', () => {
    expect(payload).toContain('540599.90');
  });

  it('remove acentos do nome do recebedor', () => {
    const comAcento = generatePixPayload({ pixKey: 'a@b.com', merchantName: 'São José', amount: 10 });
    expect(comAcento).toContain('SAO JOSE');
  });
});
