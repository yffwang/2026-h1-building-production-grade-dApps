
import { createPublicClient, http, getContract } from 'viem';
import { polkadotTestnet } from './utils/viem';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './utils/contract';

async function main() {
  const publicClient = createPublicClient({
    chain: polkadotTestnet,
    transport: http('https://services.polkadothub-rpc.com/testnet')
  });

  console.log(`Reading contract at ${CONTRACT_ADDRESS}...`);

  try {
    // Try to read storedNumber
    const data = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'storedNumber',
      args: []
    });
    console.log('Success! storedNumber:', data);
  } catch (error: any) {
    console.error('Error reading storedNumber:');
    console.error(error.message || error);
    
    // Check if the function exists in ABI
    const hasFunction = CONTRACT_ABI.some((item: any) => item.name === 'storedNumber' && item.type === 'function');
    console.log('\nDebug Info:');
    console.log('Function "storedNumber" exists in ABI:', hasFunction);
  }
}

main().catch(console.error);
