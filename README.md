# NEAR Protocol Transaction with Ed25519

End-to-end example demonstrating NEAR Protocol transactions using Ed25519 signing.

## Overview

This example shows how to:
- Load Ed25519 keys from environment variables
- Create and sign NEAR transactions
- Broadcast transactions to NEAR testnet

## Setup

### Prerequisites
- Node.js 18+
- NEAR testnet account with funds
- Ed25519 private key for your account

### Installation
```bash
git clone <repository-url>
cd near-transaction-example
npm install
```

### Environment Configuration
Copy the environment template:
```bash
cp env.template .env
```

Edit `.env` with your credentials:
```
ACCOUNT_ID=your-account.testnet
PRIVATE_KEY=ed25519:your_private_key_here
```

## Usage

Run the example:
```bash
npm start
```

Example output:
```
Account: your-account.testnet
Public Key: ed25519:ABC123...
Connected to NEAR testnet
Balance: 27.64 NEAR
Transferring 0.01 NEAR to receiver.testnet
Transaction completed
Hash: uWBMXQMkfXjpbfKPLJ2oZfoZU51142AugWhqFaVJpUx
Gas: 223182562500
Success: true
Transaction: https://testnet.nearblocks.io/txns/uWBMXQMkfXjpbfKPLJ2oZfoZU51142AugWhqFaVJpUx
```

## Ed25519 Details

Ed25519 is a digital signature algorithm using:
- 256-bit private keys
- 32-byte public keys  
- 64-byte signatures
- High performance and security

NEAR Protocol uses Ed25519 by default for all accounts.

## Transaction Flow

1. Load Ed25519 private key from environment
2. Derive public key from private key
3. Create NEAR transaction object
4. Sign transaction bytes with Ed25519
5. Broadcast signed transaction to network
6. NEAR network verifies signature and executes

## Scripts

- `npm start` - Run the example
- `npm run dev` - Development mode with auto-reload
- `npm run build` - Compile TypeScript
- `npm run type-check` - Type checking only

## Dependencies

- `near-api-js` v3.0.4 - NEAR Protocol JavaScript SDK
- `dotenv` - Environment variable management

## Network Configuration

Currently configured for NEAR testnet:
- RPC: https://test.rpc.fastnear.com
- Explorer: https://testnet.nearblocks.io

## Security Notes

- Never commit private keys to version control
- Use environment variables for sensitive data
- Test on testnet before mainnet deployment

## License

MIT 