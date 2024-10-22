"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashToken = hashToken;
const xxhash_1 = require("@node-rs/xxhash");
function hashToken(token) {
    const parts = token.split('.');
    if (parts.length !== 3)
        throw new Error('Invalid JWT token');
    const sign = Buffer.from(parts[2], 'base64').toString('utf-8');
    return xxhash_1.xxh3.xxh128(Buffer.from(sign)).toString(16);
}
