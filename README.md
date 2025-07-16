# NEAR Transaction with MPC Signing

## What it does

Creates a NEAR transaction from an MPC-controlled derived account and signs it using NEAR's production MPC contract (`v1.signer-prod.testnet`). The transaction transfers 0.01 NEAR from the derived account to `receiver.testnet`.

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
- Execute the MPC signing pattern
- Broadcast the transaction to NEAR testnet
- Display the transaction hash and explorer link

## Requirements

- NEAR testnet account with sufficient balance
- Access to `v1.signer-prod.testnet` MPC contract
