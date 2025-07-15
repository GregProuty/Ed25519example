# NEAR Transaction MPC Pattern

## Pattern

1. Construct raw unsigned NEAR transaction
2. Serialize transaction for signing
3. MPC sign with Ed25519 for derived account
4. Attach signature to unsigned transaction
5. Broadcast to NEAR network

## Usage

```bash
npm install
cp env.template .env
# Edit .env with your credentials
npm start
```

## Implementation

```typescript
// 1. Construct transaction
const transaction = transactions.createTransaction(
  accountId, publicKey, receiverId, nonce, actions, blockHash
)

// 2. Serialize for signing
const serializedTx = nearUtils.serialize.serialize(
  transactions.SCHEMA.Transaction, transaction
)

// 3. Sign with Ed25519
const signature = await signer.signMessage(serializedTx, accountId, networkId)

// 4. Attach signature
const signedTransaction = new transactions.SignedTransaction({
  transaction,
  signature: new transactions.Signature({
    keyType: 'ed25519',
    data: signature.signature
  })
})

// 5. Broadcast
const result = await provider.sendTransaction(signedTransaction)
```

## MPC Integration

For production MPC signing, replace step 3 with:

```typescript
import { contracts } from 'chainsig.js'

const contract = new contracts.ChainSignatureContract({
  networkId: 'testnet',
  contractId: 'v1.signer-prod.testnet'
})

const signature = await contract.sign({
  payloads: [Array.from(serializedTx)],
  path: 'derivation-path',
  keyType: 'Eddsa',
  signerAccount: { /* ... */ }
})
```
