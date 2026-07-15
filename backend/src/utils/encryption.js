import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';

const ALGORITHM = 'aes-256-gcm';

function getKey() {
  const raw = process.env.ENCRYPTION_KEY || '';
  if (!raw) return null;
  return raw.length === 64 ? Buffer.from(raw, 'hex') : Buffer.from(raw.padEnd(32, '0').slice(0, 32));
}

export function encrypt(text) {
  const key = getKey();
  if (!key || !text) return text;
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(ciphertext) {
  const key = getKey();
  if (!key || !ciphertext || !ciphertext.includes(':')) return ciphertext;
  try {
    const [ivHex, tagHex, dataHex] = ciphertext.split(':');
    const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    return decipher.update(Buffer.from(dataHex, 'hex')) + decipher.final('utf8');
  } catch {
    return ciphertext;
  }
}

export function maskAadhaar(aadhaar) {
  if (!aadhaar) return null;
  const clean = String(aadhaar).replace(/\D/g, '');
  return `XXXX-XXXX-${clean.slice(-4)}`;
}

export function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}
