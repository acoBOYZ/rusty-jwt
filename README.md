
# Rusty JWT

Rusty JWT is a Rust-based, optionally cached JSON Web Token (JWT) implementation for Node.js, designed for efficient signing and verification of JWTs. It utilizes the `@node-rs/jsonwebtoken` library, providing Rust-level performance, and includes optional caching via an LRU cache for frequently used JWTs.

## Table of Contents
- [Rusty JWT](#rusty-jwt)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Configuration Options](#configuration-options)
  - [Cache Management](#cache-management)
  - [API Reference](#api-reference)
    - [`new RustJWT(options: RustJWTOptions)`](#new-rustjwtoptions-rustjwtoptions)
    - [`sign(payload: JWTPayload): string`](#signpayload-jwtpayload-string)
    - [`verify(token: string): JWTPayload`](#verifytoken-string-jwtpayload)
  - [Contributing](#contributing)
  - [License](#license)

## Features
- **Rust-based performance**: Uses the `@node-rs/jsonwebtoken` library for faster token processing.
- **LRU Caching**: Optional LRU cache for JWT verification results, enhancing performance for repeated verifications.
- **Flexible Algorithms**: Supports various signing algorithms (e.g., RS256, HS256).
- **TypeScript Support**: Written in TypeScript for strong type safety.
- **Custom Expiration**: Allows setting custom expiration times for tokens.

## Installation

Install the package using npm:

```bash
npm install rusty-jwt
```

Or, using yarn:

```bash
yarn add rusty-jwt
```

## Usage

Here's a simple example of how to use the Rusty JWT library:

```typescript
import { RustJWT, JWTPayload } from 'rusty-jwt';

const jwt = new RustJWT({
  algorithm: 'RS256',
  privateKey: '<your_private_key>',
  publicKey: '<your_public_key>',
  expiresIn: '1h',
  cache: true,
  cacheTTL: 300000, // 5 minutes
  cacheSize: 1000
});

// Signing a token
const payload: JWTPayload = { userId: 123, role: 'admin' };
const token = jwt.sign(payload);
console.log('Generated Token:', token);

// Verifying a token
try {
  const verifiedPayload = jwt.verify(token);
  console.log('Verified Payload:', verifiedPayload);
} catch (error) {
  console.error('Verification Failed:', error.message);
}
```

## Configuration Options

The `RustJWT` class accepts the following configuration options:

| Option       | Type                  | Default   | Description                                                 |
|--------------|-----------------------|-----------|-------------------------------------------------------------|
| `algorithm`  | `Algorithm`           | Required  | JWT signing algorithm (e.g., 'RS256', 'HS256').             |
| `privateKey` | `string \ Uint8Array` | Required  | Private key for signing the JWT.                            |
| `publicKey`  | `string \ Uint8Array` | Required  | Public key for verifying the JWT.                           |
| `expiresIn`  | `string \ number`     | '1d'      | Token expiration time (e.g., '1h', '2d', or a number in ms).|
| `cache`      | `boolean`             | false     | Enables or disables the LRU cache for verification results. |
| `cacheTTL`   | `number`              | 0         | Cache TTL in milliseconds.                                  |
| `cacheSize`  | `number`              | 1000      | Maximum number of entries in the LRU cache.                 |

## Cache Management

The Rusty JWT library supports optional caching using an LRU cache. Caching can improve verification performance by storing the results of recently verified tokens. When caching is enabled, tokens will be cached based on their `exp` claim and the configured `cacheTTL`.

To enable caching, set the `cache` option to `true` when initializing the `RustJWT` instance. You can also set the cache size and TTL using the `cacheSize` and `cacheTTL` options.

## API Reference

### `new RustJWT(options: RustJWTOptions)`

Creates a new instance of the RustJWT class.

- **Parameters**: 
  - `options` (object): Configuration options for the JWT instance (see [Configuration Options](#configuration-options)).

### `sign(payload: JWTPayload): string`

Signs a given payload and returns the JWT as a string.

- **Parameters**: 
  - `payload` (object): The payload to sign.

### `verify(token: string): JWTPayload`

Verifies a given JWT and returns the decoded payload.

- **Parameters**: 
  - `token` (string): The JWT to verify.

- **Throws**: 
  - `Error` if verification fails or the token is invalid.

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add your feature'`).
5. Push to the branch (`git push origin feature/your-feature`).
6. Create a Pull Request.

## License

This project is licensed under the Apache-2.0 License. See the [LICENSE](LICENSE) file for details.

---

For more information, visit the [GitHub Repository](https://github.com/acoBOYZ/rusty-jwt).
