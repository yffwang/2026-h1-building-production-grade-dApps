# Polkadot Hub Zero to Hero DApp

This project follows the [Polkadot Hub Zero to Hero tutorial](https://docs.polkadot.com/smart-contracts/cookbook/dapps/zero-to-hero/).

## Project Structure

```
1963/
├── storage-contract/          # Hardhat project for smart contract
│   ├── contracts/
│   │   └── Storage.sol
│   ├── ignition/
│   │   └── modules/
│   │       └── Storage.ts
│   ├── hardhat.config.ts
│   ├── package.json
│   └── tsconfig.json
│
└── dapp/                 # Next.js dApp project
    ├── abis/
    │   └── Storage.json
    ├── app/
    │   ├── abis/
    │   │   └── Storage.json
    │   ├── components/
    │   │   ├── ReadContract.tsx
    │   │   ├── WalletConnect.tsx
    │   │   └── WriteContract.tsx
    │   ├── utils/
    │   │   ├── contract.ts
    │   │   └── viem.ts
    │   ├── favicon.ico
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── eslint.config.mjs
    ├── next.config.mjs
    ├── package.json
    ├── postcss.config.mjs
    ├── tailwind.config.ts
    └── tsconfig.json
```

## Quick Start

### 1. Deploy the Contract

**Deploy with Hardhat Ignition:**
```bash
cd storage-contract
npm install
# Set your PRIVATE_KEY using Hardhat keystore
npx hardhat keystore set PRIVATE_KEY
npm run compile
npm run deploy
```

### 2. Set Up the dApp

```bash
cd dapp
npm install
# Update CONTRACT_ADDRESS in app/utils/contract.ts with your deployed contract address
npm run dev
```

Open http://localhost:3000

## Network Configuration

- **Chain ID**: 420420417
- **RPC URL**: https://services.polkadothub-rpc.com/testnet
- **Network Name**: Polkadot Hub TestNet
- **Currency**: PAS (Polkadot Asset System)

## Security

This project uses Hardhat keystore for secure private key management. Private keys are stored encrypted in `.hardhat/` directory (automatically ignored by git) and never committed to the repository.

## Resources

- [Tutorial](https://docs.polkadot.com/smart-contracts/cookbook/dapps/zero-to-hero/)
- [Polkadot Hub Docs](https://docs.polkadot.com/smart-contracts/)
- [Faucet](https://docs.polkadot.com/smart-contracts/faucet/)
