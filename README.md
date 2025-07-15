# NEAR Transaction with MPC Signing

Demonstrates the 5-step MPC pattern for signing NEAR transactions using Ed25519 signatures with NEAR's chain signature contract.

## What it does

Creates a NEAR transaction from an MPC-controlled derived account and signs it using NEAR's production MPC contract (`v1.signer-prod.testnet`). The transaction transfers 0.01 NEAR from the derived account to `receiver.testnet`.

## 5-Step Pattern

1. Construct raw unsigned NEAR transaction
2. Hash the serialized transaction (SHA-256)
3. MPC sign with Ed25519 for the derived account
4. Attach signature to unsigned transaction
5. Broadcast to NEAR network

## Setup

```bash
npm install
cp env.template .env
```

Edit `.env`:
```
ACCOUNT_ID=your-account.testnet
PRIVATE_KEY=ed25519:your-private-key
```

## Run

```bash
npm start
```

## Output

The script will:
- Create/fund an MPC-controlled derived account if needed
- Execute the 5-step MPC signing pattern
- Broadcast the transaction to NEAR testnet
- Display the transaction hash and explorer link

## Requirements

- NEAR testnet account with sufficient balance
- Access to `v1.signer-prod.testnet` MPC contract
