"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RustJWT = void 0;
const jsonwebtoken_1 = require("@node-rs/jsonwebtoken");
const ms_1 = require("@lukeed/ms");
const lru_cache_1 = __importDefault(require("mnemonist/lru-cache"));
const utils_1 = require("./utils");
class RustJWT {
    constructor(options) {
        this.algorithm = options.algorithm || "RS256" /* Algorithm.RS256 */;
        this.expiresIn = options.expiresIn || '1d';
        this.privateKey = options.privateKey;
        this.publicKey = this.loadPublicKey(options.publicKey);
        this.cacheTTL = options.cacheTTL || 0;
        this.cache = options.cache
            ? new lru_cache_1.default(options.cacheSize || 1000)
            : undefined;
    }
    loadPublicKey(publicKey) {
        if (['HS256', 'HS384', 'HS512'].includes(this.algorithm)) {
            return this.privateKey;
        }
        return publicKey;
    }
    cacheSet(cacheKey, payload) {
        if (!this.cache)
            return payload;
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
    handleCachedResult(value) {
        if (value instanceof Error) {
            throw value;
        }
        else {
            return value;
        }
    }
    /**
     * Converts the `expiresIn` value to seconds.
     * @returns The expiration time in seconds.
     */
    getExpirationInSeconds() {
        if (typeof this.expiresIn === 'number')
            return this.expiresIn;
        const msValue = (0, ms_1.parse)(this.expiresIn || '5m');
        if (!msValue)
            return 300;
        return Math.floor(msValue / 1000);
    }
    /**
     * Signs the payload and returns a JWT token.
     * @param payload The payload to sign.
     * @returns A JWT token as a string.
     */
    sign(payload) {
        try {
            const iat = Math.floor(Date.now() / 1000);
            const exp = iat + this.getExpirationInSeconds();
            const tokenPayload = {
                ...payload,
                exp,
                iat,
            };
            const header = { algorithm: this.algorithm };
            return (0, jsonwebtoken_1.signSync)(tokenPayload, this.privateKey, header);
        }
        catch (error) {
            throw new Error('Unauthorized: Sign error => ' + error.message);
        }
    }
    /**
     * Verifies the JWT token and returns the decoded payload.
     * @param token The JWT token to verify.
     * @returns The decoded payload.
     */
    verify(token) {
        try {
            if (this.cache) {
                const cacheEntry = this.cache.get((0, utils_1.hashToken)(token));
                if (cacheEntry) {
                    const now = Date.now();
                    if (now < cacheEntry.ttl) {
                        return this.handleCachedResult(cacheEntry.payload);
                    }
                }
            }
            const validation = {
                algorithms: [this.algorithm],
                validateExp: true,
            };
            const payload = (0, jsonwebtoken_1.verifySync)(token, this.publicKey, validation);
            return this.cacheSet(token, payload);
        }
        catch (error) {
            throw this.cacheSet(token, error);
        }
    }
}
exports.RustJWT = RustJWT;
