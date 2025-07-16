import { connect, KeyPair, keyStores, utils as nearUtils, transactions } from 'near-api-js'
import type { KeyPairString } from '@near-js/crypto'
import { contracts } from 'chainsig.js'
import { getTransactionLastResult } from '@near-js/utils'
import { createAction } from '@near-wallet-selector/wallet-utils'
import * as dotenv from 'dotenv'

interface NearTransferRequest {
  to: string
  amount: string
  memo?: string
}

async function executeNearTransferWithMPC(request: NearTransferRequest) {
  dotenv.config({ path: '.env' })
  
  const accountId = process.env.ACCOUNT_ID
  const privateKey = process.env.PRIVATE_KEY as KeyPairString
  
  if (!accountId || !privateKey) {
    throw new Error('ACCOUNT_ID and PRIVATE_KEY must be set in .env file')
  }

  console.log('NEAR Transaction with MPC Ed25519 Pattern')
  console.log(`MPC Controller Account: ${accountId}`)
  
  const keyPair = KeyPair.fromString(privateKey)
  const keyStore = new keyStores.InMemoryKeyStore()
  await keyStore.setKey('testnet', accountId, keyPair)
  
  const near = await connect({
    networkId: 'testnet',
    keyStore: keyStore as any,
    nodeUrl: 'https://test.rpc.fastnear.com',
  })
  
  console.log('Connected to NEAR testnet')
  const controllerAccount = await near.account(accountId)
  
  const controllerBalance = await controllerAccount.getAccountBalance()
  console.log(`Controller Balance: ${nearUtils.format.formatNearAmount(controllerBalance.available)} NEAR`)
  
  // Step 1: Construct raw unsigned NEAR transaction
  console.log('\nStep 1: Constructing raw unsigned transaction')
  
  const amountInYocto = nearUtils.format.parseNearAmount(request.amount)
  if (!amountInYocto) {
    throw new Error(`Invalid amount: ${request.amount}`)
  }
  
  const accessKey = await near.connection.provider.query(
    `access_key/${accountId}/${keyPair.getPublicKey().toString()}`,
    ''
  ) as any
  
  const recentBlockHash = nearUtils.serialize.base_decode(accessKey.block_hash)
  const actions = [transactions.transfer(BigInt(amountInYocto))]
  
  const transaction = transactions.createTransaction(
    accountId,
    keyPair.getPublicKey(),
    request.to,
    ++accessKey.nonce,
    actions,
    recentBlockHash
  )
  
  console.log(`Initial transaction: ${accountId} -> ${request.to} (${request.amount} NEAR)`)
  console.log(`Nonce: ${transaction.nonce}`)
  console.log(`(This will be recreated for the derived account)`)
  
  // Step 2: Hash the transaction  
  console.log('\nStep 2: Serializing derived account transaction for signing')
  
  const serializedTx = nearUtils.serialize.serialize(
    transactions.SCHEMA.Transaction,
    transaction
  )
  
  console.log(`Initial serialization: ${serializedTx.length} bytes (will be replaced with MPC transaction)`)
  
  // Step 3: MPC sign with Ed25519
  console.log('\nStep 3: MPC signing with Ed25519')
  
  const contract = new contracts.ChainSignatureContract({
    networkId: 'testnet',
    contractId: 'v1.signer-prod.testnet',
  })
  
  const derivationPath = 'near-1'
  
  // Get the derived public key for MPC signing
  const derivedPublicKey = await contract.getDerivedPublicKey({
    path: derivationPath,
    predecessor: accountId,
    IsEd25519: true,
  })
  
  console.log(`Using MPC contract: v1.signer-prod.testnet`)
  console.log(`Derivation path: ${derivationPath}`)
  console.log(`Derived public key: ${derivedPublicKey}`)
  
  // Create a proper derived account name
  const mpcPublicKey = nearUtils.PublicKey.fromString(derivedPublicKey)
  const derivedAccountId = `${derivationPath}.${accountId}`
  
  console.log(`Derived NEAR account: ${derivedAccountId}`)
  
  // Check if derived account exists, create if it doesn't
  let derivedAccount
  let derivedAccountExists = false
  
  try {
    derivedAccount = await near.account(derivedAccountId)
    const derivedBalance = await derivedAccount.getAccountBalance()
    console.log(`Derived account balance: ${nearUtils.format.formatNearAmount(derivedBalance.available)} NEAR`)
    derivedAccountExists = true
  } catch (error) {
    console.log(`Derived account ${derivedAccountId} does not exist`)
    console.log(`Creating derived account controlled by MPC...`)
    
    // Create the derived account with MPC public key
    try {
      const createResult = await controllerAccount.createAccount(
        derivedAccountId,
        mpcPublicKey,
        BigInt(nearUtils.format.parseNearAmount('1')!) // Fund with 1 NEAR
      )
      
      console.log(`createResult: ${JSON.stringify(createResult, null, 2)}`)
      console.log(`Derived account created: ${derivedAccountId}`)
      console.log(`Funded with 1 NEAR`)
      console.log(`Added MPC public key: ${mpcPublicKey.toString()}`)
      
      // Wait for account creation to propagate
      console.log(`Waiting for account creation to propagate...`)
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      derivedAccount = await near.account(derivedAccountId)
      const newBalance = await derivedAccount.getAccountBalance()
      console.log(`Derived account balance: ${nearUtils.format.formatNearAmount(newBalance.available)} NEAR`)
      derivedAccountExists = true
      
    } catch (createError) {
      console.error(`Failed to create derived account:`, createError)
      throw new Error(`Cannot proceed without derived account`)
    }
  }
  
  // Get fresh access key info for the derived account  
  const derivedAccessKey = await near.connection.provider.query(
    `access_key/${derivedAccountId}/${mpcPublicKey.toString()}`,
    ''
  ) as any
  
  console.log(`Current access key nonce: ${derivedAccessKey.nonce}`)
  console.log(`Current block hash: ${derivedAccessKey.block_hash}`)
  
  const derivedRecentBlockHash = nearUtils.serialize.base_decode(derivedAccessKey.block_hash)
  const nextNonce = derivedAccessKey.nonce + 1
  
  console.log(`Using nonce: ${nextNonce}`)
  
  // Create transaction FROM the derived account
  const mpcTransaction = transactions.createTransaction(
    derivedAccountId,  // FROM the derived account
    mpcPublicKey,
    request.to,
    nextNonce,
    actions,
    derivedRecentBlockHash
  )
  
  console.log(`MPC Transaction: ${derivedAccountId} -> ${request.to} (${request.amount} NEAR)`)
  console.log(`Derived account nonce: ${mpcTransaction.nonce}`)
  
  // Serialize the MPC transaction for signing
  const mpcSerializedTx = nearUtils.serialize.serialize(
    transactions.SCHEMA.Transaction,
    mpcTransaction
  )
  
  console.log(`MPC transaction serialized: ${mpcSerializedTx.length} bytes`)
  
  // Hash the serialized transaction (NEAR signs the SHA-256 hash, not raw bytes)
  const crypto = require('crypto')
  const transactionHash = crypto.createHash('sha256').update(mpcSerializedTx).digest()
  console.log(`Transaction hash for signing: ${transactionHash.toString('hex')}`)
  
  const hashesToSign = [Array.from(transactionHash) as number[]]
  
  const signature = await contract.sign({
    payloads: hashesToSign,
    path: derivationPath,
    keyType: 'Eddsa',
    signerAccount: {
      accountId: controllerAccount.accountId,
      signAndSendTransactions: async ({
        transactions: walletSelectorTransactions,
      }: any) => {
        const results = []
        
        for (const tx of walletSelectorTransactions) {
          const actions = tx.actions.map((a: any) => createAction(a))
          
          const result = await controllerAccount.signAndSendTransaction({
            receiverId: tx.receiverId,
            actions,
          })
          
          results.push(getTransactionLastResult(result))
        }
        
        return results
      },
    },
  })
  
  console.log(`MPC signature obtained (${signature.length} signatures)`)
  console.log(`Raw MPC response:`, JSON.stringify(signature[0], null, 2))
  
  const ed25519Signature = signature[0] as any
  if (!ed25519Signature || !ed25519Signature.signature) {
    throw new Error('Invalid MPC signature received')
  }
  
  console.log(`Ed25519 signature: ${ed25519Signature.signature.length} bytes`)
  console.log(`Signature array: [${ed25519Signature.signature.slice(0, 8).join(', ')}...]`)
  
  // Convert signature from number array to Uint8Array (like Solana does)
  const signatureBytes = Buffer.from(ed25519Signature.signature)
  console.log(`Signature buffer length: ${signatureBytes.length}`)
  console.log(`Signature hex: ${signatureBytes.toString('hex').substring(0, 16)}...`)
  
  // Step 4: Add signature to unsigned transaction
  console.log('\nStep 4: Attaching MPC signature to transaction')
  
  console.log(`Transaction public key: ${mpcTransaction.publicKey.toString()}`)
  console.log(`Expected public key: ${mpcPublicKey.toString()}`)
  console.log(`Key type: 0 (Ed25519)`)
  
  const signedTransaction = new transactions.SignedTransaction({
    transaction: mpcTransaction,
    signature: new transactions.Signature({
      keyType: 0, // Ed25519 = 0, secp256k1 = 1  
      data: signatureBytes,
    }),
  })
  
  console.log('MPC signature attached')
  
  // Step 5: Broadcast to NEAR network
  console.log('\nStep 5: Broadcasting transaction')
  
  const result = await near.connection.provider.sendTransaction(signedTransaction)
  
  console.log(`Transaction broadcasted: ${result.transaction.hash}`)
  console.log(`Gas used: ${result.transaction_outcome.outcome.gas_burnt}`)
  console.log(`Explorer: https://testnet.nearblocks.io/txns/${result.transaction.hash}`)
  
  return {
    success: true,
    transactionHash: result.transaction.hash,
    gasUsed: result.transaction_outcome.outcome.gas_burnt,
    keyType: 'ed25519',
    signatureType: 'mpc'
  }
}

async function main() {
  try {
    const result = await executeNearTransferWithMPC({
      to: 'receiver.testnet',
      amount: '0.01',
      memo: 'MPC pattern demo'
    })
    
    console.log('\nTransaction completed successfully')
    console.log(`Hash: ${result.transactionHash}`)
    console.log(`Explorer: https://testnet.nearblocks.io/txns/${result.transactionHash}`)
    
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
} 