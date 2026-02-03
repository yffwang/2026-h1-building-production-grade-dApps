import { createPublicClient, http, createWalletClient, custom } from 'viem'
import 'viem/window';

const transport = http('https://services.polkadothub-rpc.com/testnet')

// Configure the Polkadot Testnet Hub chain
export const polkadotTestnet = {
  id: 420420417,
  name: 'Polkadot Hub TestNet',
  network: 'polkadot-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'PAS',
    symbol: 'PAS',
  },
  rpcUrls: {
    default: {
      http: ['https://services.polkadothub-rpc.com/testnet'],
    },
  },
} as const

// Create a public client for reading data
export const publicClient = createPublicClient({
  chain: polkadotTestnet,
  transport
})

// Helper function to get MetaMask provider when multiple wallets are installed
const getMetaMaskProvider = () => {
  if (typeof window === 'undefined' || !window.ethereum) return null;
  const ethereum = window.ethereum as any;
  if (ethereum.isMetaMask) return ethereum;
  if (ethereum.providers) {
    return ethereum.providers.find((p: any) => p.isMetaMask) || ethereum;
  }
  return ethereum;
};

// Create a wallet client for signing transactions
export const getWalletClient = async () => {
  const ethereum = getMetaMaskProvider();
  if (ethereum) {
    const [account] = await ethereum.request({ method: 'eth_requestAccounts' });
    return createWalletClient({
      chain: polkadotTestnet,
      transport: custom(ethereum),
      account,
    });
  }
  throw new Error('No Ethereum browser provider detected');
};
