# 🚀 NEAR Protocol Transaction Example with Ed25519

A complete **end-to-end example** demonstrating how to create, sign, and broadcast NEAR Protocol transactions using **Ed25519 cryptography**.

## 🔍 **What This Example Shows**

This repository demonstrates the complete flow for NEAR Protocol transactions:

```
Client Request → Transaction Creation → Ed25519 Signing → Network Broadcast → Finalization
```

### **Key Features:**
- ✅ **Complete Ed25519 workflow** from private key to signature
- ✅ **Transaction preparation** with proper nonce and blockhash handling  
- ✅ **Two approaches**: Manual step-by-step + simplified helper method
- ✅ **Real network interaction** with NEAR testnet
- ✅ **Comprehensive logging** showing each step
- ✅ **TypeScript** with full type safety

## 🛠 **Quick Start**

### **1. Clone and Install**
```bash
git clone https://github.com/yourusername/near-transaction-example.git
cd near-transaction-example
npm install
```

### **2. Setup Environment**
Create a `.env` file in the project root:
```bash
# Your NEAR testnet account
ACCOUNT_ID=your-account.testnet

# Your Ed25519 private key (get from NEAR CLI or wallet)
PRIVATE_KEY=ed25519:your_private_key_here
```

### **3. Run the Example**
```bash
# Run with ts-node
npm start

# Or watch mode for development
npm run dev

# Type check only
npm run type-check
```

## 📋 **Requirements**

- **Node.js** 18.0.0 or higher
- **NEAR testnet account** with some NEAR tokens
- **Ed25519 private key** for your account

### **Getting NEAR Testnet Account:**
1. Visit [NEAR Wallet](https://testnet.mynearwallet.com/)
2. Create a new testnet account
3. Get testnet NEAR tokens from the faucet
4. Export your private key

## 📊 **Example Output**

```
🚀 Starting end-to-end NEAR transaction example with Ed25519
============================================================
🔑 Using Ed25519 key pair from string format
🌐 Connected to NEAR testnet
💰 Sender balance: 10.5 NEAR

📝 Preparing NEAR transaction...
From: sender.testnet
To: receiver.testnet
Amount: 0.1 NEAR

✅ Transaction created
Nonce: 47382
Block hash: 8Hy8...

🔐 Signing transaction with Ed25519...
Serialized transaction length: 112 bytes
✅ Transaction signed with Ed25519
Signature length: 64 bytes
Public key: ed25519:8Hy8...

📡 Broadcasting to NEAR network...
✅ Transaction broadcasted successfully!
Transaction hash: 8Hy8...

⏳ Waiting for transaction finalization...
🎉 Transaction finalized!
Final status: INCLUDED_FINAL
Gas used: 223182562500
💰 New sender balance: 10.4 NEAR

📊 TRANSACTION SUMMARY
============================================================
✅ Success: true
🔗 Transaction: https://testnet.nearblocks.io/txns/8Hy8...
⛽ Gas used: 223182562500
```

## 🏗 **Code Structure**

### **Two Approaches Demonstrated:**

#### **1. Manual Transaction Creation** (`createNearTransaction`)
Shows each step explicitly for educational purposes:
- Ed25519 key setup
- Transaction creation with proper nonce/blockhash
- Manual serialization and signing
- Broadcasting and finalization tracking

#### **2. Simplified Approach** (`simpleNearTransaction`)  
Uses NEAR's built-in helper for practical use:
- `account.signAndSendTransaction()` handles signing internally
- Cleaner code for production use

## 🔑 **Ed25519 Technical Details**

### **Key Generation:**
```typescript
const keyPair = KeyPair.fromString('ed25519:5Fg2...')
// Ed25519 keys are 32 bytes, signatures are 64 bytes
```

### **Transaction Structure:**
```typescript
const transaction = transactions.createTransaction(
  senderAccount,      // sender account ID
  publicKey,          // Ed25519 public key
  receiverAccount,    // recipient account ID  
  nonce,              // account nonce (prevents replay)
  actions,            // transaction actions (transfer, etc.)
  recentBlockHash     // recent block hash (prevents old tx)
)
```

### **Signing Process:**
```typescript
// 1. Serialize transaction to bytes
const serializedTx = nearUtils.serialize.serialize(
  transactions.SCHEMA.Transaction, 
  transaction
)

// 2. Sign with Ed25519 private key
const signature = await signer.signMessage(
  serializedTx, 
  accountId, 
  networkId
)

// 3. Create final signed transaction
const signedTx = new transactions.SignedTransaction({
  transaction,
  signature: new transactions.Signature({
    keyType: 'ed25519',
    data: signature.signature  // 64-byte Ed25519 signature
  })
})
```

## 🌐 **Network Configuration**

Currently configured for **NEAR testnet**:
- **RPC URL**: `https://test.rpc.fastnear.com`
- **Explorer**: `https://testnet.nearblocks.io`
- **Faucet**: Available through testnet wallet

To use **mainnet**, change:
```typescript
networkId: 'mainnet'
nodeUrl: 'https://free.rpc.fastnear.com'
```

## 🔧 **Development**

### **Project Structure:**
```
near-transaction-example/
├── src/
│   └── index.ts          # Main example code
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration  
├── .env.example          # Environment template
└── README.md            # This file
```

### **Available Scripts:**
- `npm start` - Run the example
- `npm run dev` - Watch mode for development
- `npm run build` - Compile TypeScript
- `npm run type-check` - Check types without compilation

### **Key Dependencies:**
- `near-api-js` - NEAR Protocol JavaScript SDK
- `@near-js/crypto` - Cryptographic functions (Ed25519)
- `@near-js/keystores` - Key management
- `@near-js/transactions` - Transaction utilities

## 🛡 **Security Notes**

- **Never commit private keys** to version control
- **Use environment variables** for sensitive data
- **Testnet only** for development and testing
- **Validate all inputs** in production code
- **Use hardware wallets** for mainnet transactions

## 📚 **Learn More**

- [NEAR Protocol Documentation](https://docs.near.org/)
- [NEAR API JavaScript SDK](https://github.com/near/near-api-js)
- [NEAR Transaction Specification](https://nomicon.io/RuntimeSpec/Transactions)
- [Ed25519 Cryptography](https://ed25519.cr.yp.to/)

## 🤝 **Contributing**

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ❓ **Support**

If you have questions or need help:
- 📖 Check the [NEAR Documentation](https://docs.near.org/)
- 💬 Join the [NEAR Discord](https://near.chat/)
- 🐛 Open an [Issue](https://github.com/yourusername/near-transaction-example/issues)

---

**Made with ❤️ for the NEAR Protocol ecosystem** 