# 🚀 NEAR Protocol Transaction Example with Ed25519

A complete **end-to-end example** demonstrating how to create, sign, and broadcast NEAR Protocol transactions using **Ed25519 cryptography**.

## 🎯 **What This Repository Demonstrates**

### ✅ **Working Example** (`src/simple-near.ts`)
A **production-ready** NEAR transaction example that successfully:
- Loads Ed25519 keys from environment
- Creates and signs transactions with Ed25519
- Broadcasts to NEAR testnet
- **WORKS RELIABLY** ✅

### 🔬 **Detailed Example** (`src/index.ts`) 
A **step-by-step breakdown** showing the internal Ed25519 signing process:
- Manual transaction creation
- Explicit Ed25519 signature generation
- Low-level serialization details
- ⚠️ Has schema compatibility issues with newer NEAR SDK versions

## 🚀 **Quick Start (Working Version)**

### **1. Install Dependencies**
```bash
git clone <your-repo>
cd near-transaction-example
npm install
```

### **2. Setup Environment**
Copy the environment template and fill in your values:
```bash
cp env.template .env
```

Then edit `.env` with your NEAR credentials:
```bash
# Your NEAR testnet account
ACCOUNT_ID=your-account.testnet

# Your Ed25519 private key (get from NEAR CLI or wallet)
PRIVATE_KEY=ed25519:your_private_key_here
```

### **3. Run the Working Example**
```bash
npm start
```

## 📊 **Example Output**

```
🚀 Simple NEAR Transfer with Ed25519 (Working Version)
============================================================
🔑 Account: your-account.testnet
🔐 Key Type: Ed25519 (from private key format)
🔑 Public Key: ed25519:ABC123...
🌐 Connected to NEAR testnet
💰 Balance before: 27.64 NEAR

📝 Preparing transfer:
   From: your-account.testnet
   To: receiver.testnet
   Amount: 0.01 NEAR

🔐 Executing transaction with Ed25519 signing...
✅ Transaction completed successfully!
📋 Transaction Hash: uWBMXQMkfXjpbfKPLJ2oZfoZU51142AugWhqFaVJpUx
⛽ Gas Used: 223182562500
💰 Balance after: 27.63 NEAR

🎯 Ed25519 Signing Summary:
✅ Private key loaded from environment
✅ Ed25519 key pair created and verified  
✅ Transaction signed with Ed25519 algorithm
✅ Signature verified by NEAR network
✅ Transaction executed successfully
```

## 🔐 **Ed25519 Explained**

**Ed25519** is a high-performance digital signature algorithm:

### **Key Properties:**
- **Algorithm**: Edwards-curve Digital Signature Algorithm
- **Key Size**: 256-bit private keys, 32-byte public keys
- **Signature Size**: 64 bytes
- **Performance**: 2-6x faster than RSA, immune to timing attacks
- **Deterministic**: Same message + key = same signature

### **How This Example Uses Ed25519:**

1. **🔑 Key Loading**: Your private key (`ed25519:...`) is loaded
2. **📊 Public Key Derivation**: Public key automatically derived from private key
3. **📝 Transaction Creation**: NEAR transaction prepared with your account details
4. **🔐 Ed25519 Signing**: Transaction bytes signed with your Ed25519 private key
5. **🌐 Network Verification**: NEAR network verifies Ed25519 signature
6. **✅ Execution**: Transaction executes if signature is valid

### **Ed25519 vs Other Algorithms:**
| Algorithm | Key Size | Signature Size | Speed | Security |
|-----------|----------|----------------|-------|----------|
| **Ed25519** | 32 bytes | 64 bytes | ⚡ Fast | 🛡️ High |
| RSA-2048 | 256 bytes | 256 bytes | 🐌 Slow | 🛡️ High |
| ECDSA-P256 | 32 bytes | 64 bytes | ⚡ Medium | 🛡️ High |

## 🛠 **Available Scripts**

```bash
# Run working example (recommended)
npm start

# Run detailed debugging version (has compatibility issues)
npm run start-detailed  

# Development mode with auto-reload
npm run dev

# Type checking
npm run type-check

# Build project
npm run build
```

## 📁 **Project Structure**

```
near-transaction-example/
├── src/
│   ├── simple-near.ts    # ✅ Working Ed25519 example
│   └── index.ts          # 🔬 Detailed breakdown (compatibility issues)
├── package.json          # Dependencies (near-api-js v3.0.4)
├── tsconfig.json         # TypeScript configuration
├── env.template          # Environment template (copy to .env)
├── .gitignore           # Git ignore rules
├── LICENSE              # MIT license
└── README.md            # This file
```

## 🐛 **Debugging Notes**

If you encounter schema compatibility issues:

1. **✅ Use `simple-near.ts`** - This is the reliable version
2. **📦 Check NEAR SDK versions** - Newer versions have breaking changes
3. **🔧 Use near-api-js v3.0.4** - This version is proven to work
4. **⚠️ Avoid manual transaction construction** - Use `account.sendMoney()` instead

## 🔗 **Links**

- **NEAR Testnet Explorer**: https://testnet.nearblocks.io/
- **NEAR Documentation**: https://docs.near.org/
- **Ed25519 Specification**: https://ed25519.cr.yp.to/
- **NEAR CLI**: https://github.com/near/near-cli

## 🎯 **Key Takeaways**

1. **Ed25519 is fast and secure** - Perfect for blockchain applications
2. **NEAR uses Ed25519 by default** - Your account keys are Ed25519
3. **Simplified APIs work better** - Use `account.sendMoney()` for reliability
4. **Schema compatibility matters** - Stick to proven SDK versions
5. **End-to-end flow works** - From private key to confirmed transaction ✅

---

**🎉 You now have a complete working example of NEAR Protocol transactions with Ed25519 signing!** 