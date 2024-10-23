import {
  Algorithm,
  Header,
  signSync,
  Validation,
  verifySync
} from '@node-rs/jsonwebtoken'
import { parse } from '@lukeed/ms'
import LRUCache from 'mnemonist/lru-cache'
import { hashToken } from './utils'

export interface RustJWTOptions {
  algorithm: keyof typeof Algorithm;
  expiresIn?: string | number;
  privateKey: string | Uint8Array;
  publicKey: string | Uint8Array;
  cache?: boolean;
  cacheTTL?: number;
  cacheSize?: number;
}

export interface JWTPayload { [key: string]: any }

interface CacheEntry {
  payload: JWTPayload | Error;
  ttl: number;
}

export class RustJWT {
  private privateKey: string | Uint8Array;
  private publicKey: string | Uint8Array;
  private algorithm: keyof typeof Algorithm;
  private expiresIn: string | number | undefined;
  private cacheTTL: number;
  private cache: LRUCache<string, CacheEntry> | undefined;

  constructor(options: RustJWTOptions) {
    this.algorithm = options.algorithm || 'RS256';
    this.expiresIn = options.expiresIn || '1d';
    this.privateKey = options.privateKey;
    this.publicKey = this.loadPublicKey(options.publicKey);
    this.cacheTTL = options.cacheTTL || 0;
    this.cache = options.cache
      ? new LRUCache<string, CacheEntry>(options.cacheSize || 1000)
      : undefined;
  }

  private loadPublicKey(publicKey: string | Uint8Array): string | Uint8Array {
    if (['HS256', 'HS384', 'HS512'].includes(this.algorithm)) {
      return this.privateKey;
    }
    return publicKey;
  }

  private cacheSet(cacheKey: string, payload: JWTPayload | Error): JWTPayload | Error {
    if (!this.cache) return payload;

    const now = Date.now();
    let ttl = this.cacheTTL;

    if (!(payload instanceof Error)) {
      if (typeof payload.exp === 'number') {
        const expTime = payload.exp * 1000;
        ttl = Math.min(ttl, expTime - now);
      }
    }

    if (ttl > 0) {
      this.cache.set(cacheKey, { payload, ttl });
    }

    return payload;
  }

  private handleCachedResult(value: JWTPayload | Error) {
    if (value instanceof Error) {
      throw value;
    } else {
      return value;
    }
  }

  /**
   * Converts the `expiresIn` value to seconds.
   * @returns The expiration time in seconds.
   */
  private getExpirationInSeconds(): number {
    if (typeof this.expiresIn === 'number') return this.expiresIn;

    const msValue = parse(this.expiresIn || '5m');
    if (!msValue) return 300;
    return Math.floor(msValue / 1000);
  }

  /**
   * Signs the payload and returns a JWT token.
   * @param payload The payload to sign.
   * @returns A JWT token as a string.
   */
  public sign(payload: JWTPayload): string {
    try {
      const iat = Math.floor(Date.now() / 1000);
      const exp = iat + this.getExpirationInSeconds();

      const tokenPayload = {
        ...payload,
        exp,
        iat,
      };

      const header: Header = { algorithm: this.algorithm as Algorithm };

      return signSync(tokenPayload, this.privateKey, header);
    } catch (error) {
      throw new Error('Unauthorized: Sign error => ' + (error as Error).message);
    }
  }

  /**
   * Verifies the JWT token and returns the decoded payload.
   * @param token The JWT token to verify.
   * @returns The decoded payload.
   */
  public verify(token: string): JWTPayload {
    try {
      if (this.cache) {
        const cacheEntry = this.cache.get(hashToken(token));
        if (cacheEntry) {
          const now = Date.now();
          if (now < cacheEntry.ttl) {
            return this.handleCachedResult(cacheEntry.payload);
          }
        }
      }

      const validation: Validation = {
        algorithms: [this.algorithm as Algorithm],
        validateExp: true,
      };
      const payload = verifySync(token, this.publicKey, validation) as JWTPayload;

      return this.cacheSet(token, payload) as JWTPayload;
    } catch (error) {
      throw this.cacheSet(token, error as Error);
    }
  }
}