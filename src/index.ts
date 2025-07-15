import { InMemoryKeyStore } from '@near-js/keystores'
import { KeyPair, type KeyPairString } from '@near-js/crypto'
import { connect } from 'near-api-js'
import { 
  transactions, 
  utils as nearUtils
} from 'near-api-js'
import { getTransactionLastResult } from '@near-js/utils'
import * as dotenv from 'dotenv'

/**
 * End-to-End NEAR Transaction Example with Ed25519 Signing
 * 
 * This example demonstrates:
 * 1. Client request (transfer NEAR tokens)
 * 2. Transaction preparation 
 * 3. Ed25519 signing
 * 4. Broadcasting to NEAR network
 */

interface NearTransactionRequest {
  from: string
  to: string
  amount: string // Amount in NEAR (will be converted to yoctoNEAR)
  memo?: string
}

async function createNearTransaction(request: NearTransactionRequest) {
  // Load environment variables
  dotenv.config({ path: '.env' })

  // Setup NEAR connection with Ed25519 key
  const accountId = process.env.ACCOUNT_ID || request.from
  const privateKey = process.env.PRIVATE_KEY as KeyPairString
  
  if (!privateKey) {
    throw new Error('PRIVATE_KEY must be set in environment (format: ed25519:...)')
  }
  if (!accountId) {
    throw new Error('ACCOUNT_ID must be set in environment')
  }

  console.log(`🔑 Account ID: ${accountId}`)
  const keyPair = KeyPair.fromString(privateKey) // Ed25519 key
  console.log('🔑 Using Ed25519 key pair from string format')
  console.log(`🔑 Public key: ${keyPair.getPublicKey().toString()}`)

  // Create a keystore and add the Ed25519 key
  const keyStore = new InMemoryKeyStore()
  await (keyStore as any).setKey('testnet', accountId, keyPair)

  // Connect to NEAR testnet
  const near = await connect({
    networkId: 'testnet',
    keyStore: keyStore as any,
    nodeUrl: 'https://test.rpc.fastnear.com',
  })

  console.log('🌐 Connected to NEAR testnet')

  const account = await near.account(accountId)
  
  // Check sender balance
  const balance = await account.getAccountBalance()
  console.log(`💰 Sender balance: ${nearUtils.format.formatNearAmount(balance.available)} NEAR`)

  // 1. CLIENT REQUEST -> TRANSACTION PREPARATION
  console.log('\n📝 Preparing NEAR transaction...')
  console.log(`From: ${request.from}`)
  console.log(`To: ${request.to}`)
  console.log(`Amount: ${request.amount} NEAR`)
  if (request.memo) console.log(`Memo: ${request.memo}`)

  // Convert NEAR to yoctoNEAR (1 NEAR = 10^24 yoctoNEAR)
  const amountInYocto = nearUtils.format.parseNearAmount(request.amount)
  if (!amountInYocto) {
    throw new Error('Invalid amount')
  }

  // Create transfer action  
  const actions = [
    transactions.transfer(BigInt(amountInYocto))
  ]

  // Get account info for nonce and recent block hash
  console.log(`🔍 Getting access key for: ${accountId}`)
  const publicKeyStr = keyPair.getPublicKey().toString()
  console.log(`🔍 Public key string: ${publicKeyStr}`)
  
  const accessKey = await near.connection.provider.query(
    `access_key/${accountId}/${publicKeyStr}`,
    ''
  ) as any

  console.log(`🔍 Access key nonce: ${accessKey.nonce}`)
  console.log(`🔍 Block hash: ${accessKey.block_hash}`)

  const recentBlockHash = nearUtils.serialize.base_decode(accessKey.block_hash)

  // 2. TRANSACTION CREATION
  console.log(`🔧 Creating transaction with:`)
  console.log(`   - accountId: ${accountId}`)
  console.log(`   - publicKey: ${publicKeyStr}`)
  console.log(`   - receiverId: ${request.to}`)
  console.log(`   - nonce: ${accessKey.nonce + 1}`)

  const transaction = transactions.createTransaction(
    accountId,                    // sender
    keyPair.getPublicKey(),      // sender's public key
    request.to,                  // receiver
    ++accessKey.nonce,           // nonce
    actions,                     // actions (transfer)
    recentBlockHash              // recent block hash
  )

  console.log('✅ Transaction created')
  console.log(`Nonce: ${transaction.nonce}`)
  console.log(`SignerId: ${transaction.signerId}`)
  console.log(`ReceiverId: ${transaction.receiverId}`)

  // 3. ED25519 SIGNING
  console.log('\n🔐 Signing transaction with Ed25519...')
  
  // Serialize transaction for signing
  const serializedTx = nearUtils.serialize.serialize(
    transactions.SCHEMA.Transaction,
    transaction
  )

  console.log(`Serialized transaction length: ${serializedTx.length} bytes`)

  // Sign the transaction using Ed25519
  const { signer } = near.connection
  const signature = await signer.signMessage(
    serializedTx,
    accountId,
    near.connection.networkId
  )

  console.log('✅ Transaction signed with Ed25519')
  console.log(`Signature length: ${signature.signature.length} bytes`)
  console.log(`Public key: ${signature.publicKey.toString()}`)

  // Create signed transaction
  const signedTransaction = new transactions.SignedTransaction({
    transaction,
    signature: new transactions.Signature({
      keyType: transaction.publicKey.keyType, // Should be 'ed25519'
      data: signature.signature,
    }),
  })

  console.log('✅ Signed transaction created with Ed25519 signature')

  // 4. BROADCASTING TO NEAR NETWORK
  console.log('\n📡 Broadcasting to NEAR network...')
  
  try {
    // Using account.signAndSendTransaction instead of manual signing due to serialization issues
    console.log('🔄 Using account.signAndSendTransaction (handles Ed25519 internally)')
    const result = await account.signAndSendTransaction({
      receiverId: request.to,
      actions: actions,
    })
    
    console.log('✅ Transaction broadcasted and finalized!')
    console.log(`Transaction hash: ${getTransactionLastResult(result)}`)
    console.log(`Gas used: ${result.transaction_outcome.outcome.gas_burnt}`)
    
    // Check updated balances
    const newBalance = await account.getAccountBalance()
    console.log(`💰 New sender balance: ${nearUtils.format.formatNearAmount(newBalance.available)} NEAR`)

    return {
      success: true,
      transactionHash: getTransactionLastResult(result),
      gasUsed: result.transaction_outcome.outcome.gas_burnt
    }

  } catch (error) {
    console.error('❌ Transaction failed:', error)
    throw error
  }
}

// Example usage
async function main() {
  try {
    // Load environment to get real account ID
    dotenv.config({ path: '.env' })
    const accountId = process.env.ACCOUNT_ID
    
    if (!accountId) {
      throw new Error('ACCOUNT_ID must be set in .env file')
    }

    const request: NearTransactionRequest = {
      from: accountId,  // Use real account from .env
      to: 'receiver.testnet',  // You may want to change this to a real receiver
      amount: '0.1', // 0.1 NEAR
      memo: 'Test transfer via Ed25519'
    }

    console.log('🚀 Starting end-to-end NEAR transaction example with Ed25519')
    console.log('=' .repeat(60))

    const result = await createNearTransaction(request)
    
    console.log('\n📊 TRANSACTION SUMMARY')
    console.log('=' .repeat(60))
    console.log(`✅ Success: ${result.success}`)
    console.log(`🔗 Transaction: https://testnet.nearblocks.io/txns/${result.transactionHash}`)
    console.log(`⛽ Gas used: ${result.gasUsed}`)

  } catch (error) {
    console.error('Failed to execute NEAR transaction:', error)
    process.exit(1)
  }
}

// Alternative: Direct account.signAndSendTransaction approach
async function simpleNearTransaction(request: NearTransactionRequest) {
  dotenv.config({ path: '.env' })

  const accountId = process.env.ACCOUNT_ID || request.from
  const privateKey = process.env.PRIVATE_KEY as KeyPairString
  const keyPair = KeyPair.fromString(privateKey)

  const keyStore = new InMemoryKeyStore()
  await (keyStore as any).setKey('testnet', accountId, keyPair)

  const near = await connect({
    networkId: 'testnet',
    keyStore: keyStore as any,
    nodeUrl: 'https://test.rpc.fastnear.com',
  })

  const account = await near.account(accountId)

  console.log('\n🔄 Alternative: Using account.signAndSendTransaction')
  console.log('This method handles Ed25519 signing internally')

  const amountInYocto = nearUtils.format.parseNearAmount(request.amount)!

  const result = await account.signAndSendTransaction({
    receiverId: request.to,
    actions: [
      transactions.transfer(BigInt(amountInYocto))
    ],
  })

  console.log('✅ Simple transaction completed')
  console.log(`Transaction hash: ${getTransactionLastResult(result)}`)
  
  return result
}

if (require.main === module) {
  main()
}

export { createNearTransaction, simpleNearTransaction, type NearTransactionRequest } 