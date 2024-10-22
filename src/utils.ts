import { xxh3 } from '@node-rs/xxhash';

export function hashToken(token: string): string {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT token');
  const sign = Buffer.from(parts[2], 'base64').toString('utf-8');
  return xxh3.xxh128(Buffer.from(sign)).toString(16);
}