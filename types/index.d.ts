import { Algorithm } from '@node-rs/jsonwebtoken';
export interface RustJWTOptions {
    algorithm?: Algorithm;
    expiresIn?: string | number;
    privateKey: string | Uint8Array;
    publicKey: string | Uint8Array;
    cache?: boolean;
    cacheTTL?: number;
    cacheSize?: number;
}
export interface JWTPayload {
    [key: string]: any;
}
export declare class RustJWT {
    private privateKey;
    private publicKey;
    private algorithm;
    private expiresIn;
    private cacheTTL;
    private cache;
    constructor(options: RustJWTOptions);
    private loadPublicKey;
    private cacheSet;
    private handleCachedResult;
    /**
     * Converts the `expiresIn` value to seconds.
     * @returns The expiration time in seconds.
     */
    private getExpirationInSeconds;
    /**
     * Signs the payload and returns a JWT token.
     * @param payload The payload to sign.
     * @returns A JWT token as a string.
     */
    sign(payload: JWTPayload): string;
    /**
     * Verifies the JWT token and returns the decoded payload.
     * @param token The JWT token to verify.
     * @returns The decoded payload.
     */
    verify(token: string): JWTPayload;
}
