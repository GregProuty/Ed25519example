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

  const keyPair = KeyPair.fromString(privateKey) // Ed25519 key
  console.log('🔑 Using Ed25519 key pair from string format')

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
  const accessKey = await near.connection.provider.query(
    `access_key/${accountId}/${keyPair.getPublicKey().toString()}`,
    ''
  ) as any

  const recentBlockHash = nearUtils.serialize.base_decode(accessKey.block_hash)

  // 2. TRANSACTION CREATION
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
  console.log(`Block hash: ${accessKey.block_hash}`)

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
    const result = await near.connection.provider.sendTransaction(signedTransaction)
    
    console.log('✅ Transaction broadcasted successfully!')
    console.log(`Transaction hash: ${result.transaction.hash}`)
    
    // Wait for finalization
    console.log('\n⏳ Waiting for transaction finalization...')
    const finalResult = await near.connection.provider.sendTransactionUntil(
      signedTransaction,
      'INCLUDED_FINAL'
    )

    const outcome = getTransactionLastResult(finalResult)
    console.log('🎉 Transaction finalized!')
    console.log(`Final status: ${finalResult.status}`)
    console.log(`Gas used: ${finalResult.transaction_outcome.outcome.gas_burnt}`)
    
    // Check updated balances
    const newBalance = await account.getAccountBalance()
    console.log(`💰 New sender balance: ${nearUtils.format.formatNearAmount(newBalance.available)} NEAR`)

    return {
      success: true,
      transactionHash: result.transaction.hash,
      gasUsed: finalResult.transaction_outcome.outcome.gas_burnt,
      finalStatus: finalResult.status
    }

  } catch (error) {
    console.error('❌ Transaction failed:', error)
    throw error
  }
}

// Example usage
async function main() {
  try {
    const request: NearTransactionRequest = {
      from: 'sender.testnet',
      to: 'receiver.testnet', 
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