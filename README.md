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
