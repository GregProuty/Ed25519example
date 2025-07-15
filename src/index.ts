import { connect, KeyPair, keyStores, utils as nearUtils } from 'near-api-js'
import * as dotenv from 'dotenv'

interface NearTransferRequest {
  to: string
  amount: string
  memo?: string
}

async function executeNearTransfer(request: NearTransferRequest) {
  dotenv.config({ path: '.env' })
  
  const accountId = process.env.ACCOUNT_ID
  const privateKey = process.env.PRIVATE_KEY as string
  
  if (!accountId || !privateKey) {
    throw new Error('ACCOUNT_ID and PRIVATE_KEY must be set in .env file')
  }

  console.log(`Account: ${accountId}`)
  
  // Create Ed25519 key pair
  const keyPair = KeyPair.fromString(privateKey)
  console.log(`Public Key: ${keyPair.getPublicKey().toString()}`)
  
  // Setup NEAR connection
  const keyStore = new keyStores.InMemoryKeyStore()
  await keyStore.setKey('testnet', accountId, keyPair)
  
  const near = await connect({
    networkId: 'testnet',
    keyStore: keyStore as any,
    nodeUrl: 'https://test.rpc.fastnear.com',
  })
  
  console.log('Connected to NEAR testnet')
  
  const account = await near.account(accountId)
  
  // Check balance
  const balance = await account.getAccountBalance()
  console.log(`Balance: ${nearUtils.format.formatNearAmount(balance.available)} NEAR`)
  
  // Prepare transfer
  console.log(`Transferring ${request.amount} NEAR to ${request.to}`)
  
  const amountInYocto = nearUtils.format.parseNearAmount(request.amount)
  if (!amountInYocto) {
    throw new Error(`Invalid amount: ${request.amount}`)
  }
  
  // Execute transaction with Ed25519 signing
  const result = await account.sendMoney(
    request.to,
    BigInt(amountInYocto)
  )
  
  console.log('Transaction completed')
  console.log(`Hash: ${result.transaction.hash}`)
  console.log(`Gas: ${result.transaction_outcome.outcome.gas_burnt}`)
  
  return {
    success: true,
    transactionHash: result.transaction.hash,
    gasUsed: result.transaction_outcome.outcome.gas_burnt,
    keyType: 'ed25519'
  }
}

async function main() {
  try {
    const result = await executeNearTransfer({
      to: 'receiver.testnet',
      amount: '0.01',
      memo: 'Test transfer'
    })
    
    console.log(`Success: ${result.success}`)
    console.log(`Transaction: https://testnet.nearblocks.io/txns/${result.transactionHash}`)
    
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { executeNearTransfer, type NearTransferRequest } 