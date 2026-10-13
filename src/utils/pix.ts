import QRCode from 'qrcode';

/**
 * Standard EMV BR Code / Pix Payload Generator (Banco Central do Brasil)
 */

function formatTLV(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

/**
 * Removes accents and special characters according to EMV specs
 */
function normalizeString(str: string, maxLength: number): string {
  const normalized = str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-zA-Z0-9 ]/g, '') // only alphanumeric and spaces
    .trim()
    .toUpperCase();
  return normalized.slice(0, maxLength);
}

/**
 * Calculates CRC-16 / CCITT-FALSE (poly 0x1021, init 0xFFFF)
 */
function calculateCRC16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export interface PixPayloadParams {
  pixKey: string;
  merchantName?: string;
  merchantCity?: string;
  amount?: number;
  txid?: string;
  description?: string;
}

/**
 * Generates the Pix "Copia e Cola" EMV string
 */
export function generatePixPayload(params: PixPayloadParams): string {
  const {
    pixKey,
    merchantName = 'HENRIQUE MULTIMARCAS',
    merchantCity = 'SAO PAULO',
    amount,
    txid = '***',
    description
  } = params;

  const cleanPixKey = pixKey.trim();
  const cleanName = normalizeString(merchantName, 25) || 'HENRIQUE MULTIMARCAS';
  const cleanCity = normalizeString(merchantCity, 15) || 'CIDADE';
  const cleanTxid = txid ? txid.replace(/[^a-zA-Z0-9]/g, '').slice(0, 25) || '***' : '***';

  // ID 00: Payload Format Indicator
  let payload = formatTLV('00', '01');

  // ID 26: Merchant Account Information
  let accountInfo = formatTLV('00', 'br.gov.bcb.pix');
  accountInfo += formatTLV('01', cleanPixKey);
  if (description) {
    const cleanDesc = description.slice(0, 35);
    accountInfo += formatTLV('02', cleanDesc);
  }
  payload += formatTLV('26', accountInfo);

  // ID 52: Merchant Category Code
  payload += formatTLV('52', '0000');

  // ID 53: Transaction Currency (986 = BRL)
  payload += formatTLV('53', '986');

  // ID 54: Transaction Amount
  if (amount && amount > 0) {
    payload += formatTLV('54', amount.toFixed(2));
  }

  // ID 58: Country Code
  payload += formatTLV('58', 'BR');

  // ID 59: Merchant Name
  payload += formatTLV('59', cleanName);

  // ID 60: Merchant City
  payload += formatTLV('60', cleanCity);

  // ID 62: Additional Data Field Template (TxID)
  const additionalData = formatTLV('05', cleanTxid);
  payload += formatTLV('62', additionalData);

  // ID 63: CRC16 prefix
  const payloadToHash = payload + '6304';
  const crc = calculateCRC16(payloadToHash);

  return payloadToHash + crc;
}

/**
 * Generates a Data URL image (PNG base64) of the Pix QR Code
 */
export async function generatePixQRCode(pixCode: string): Promise<string> {
  try {
    return await QRCode.toDataURL(pixCode, {
      width: 320,
      margin: 1.5,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    });
  } catch (err) {
    console.error('Failed to generate Pix QR Code:', err);
    throw err;
  }
}
