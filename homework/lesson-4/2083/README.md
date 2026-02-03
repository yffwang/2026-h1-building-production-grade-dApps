# Upgradeable Contract Assignment

This project contains a simple upgradeable smart contract system deployed to Polkadot Test Hub (Westend Asset Hub).

## Contracts
- **V1 (Box.sol)**: Stores a single `uint256` value.
- **V2 (BoxV2.sol)**: Adds `string name` state variable and `increment()` function.

## Prerequisites
- Node.js (v20+ recommended)
- Hardhat
- A Polkadot Test Hub account with tokens.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment:
   Copy `.env.example` to `.env` and fill in your details:
   ```bash
   RPC_URL=https://westend-asset-hub-eth-rpc.polkadot.io
   PRIVATE_KEY=your_private_key_without_0x
   ```

## Deployment & Verification
1. **Deploy V1**:
   ```bash
   npx hardhat run scripts/deploy.ts --network polkadot_test_hub
   ```
   *Note the Proxy Address deployed.*

2. **Upgrade to V2**:
   Set `PROXY_ADDRESS` in `.env` or pass it inline.
   ```bash
   set PROXY_ADDRESS=your_proxy_address
   npx hardhat run scripts/upgrade.ts --network polkadot_test_hub
   ```

3. **Verify Storage**:
   Run the TypeScript verification script to check storage changes.
   ```bash
   npx hardhat run scripts/verify-storage.ts --network polkadot_test_hub
   ```

## Deployment Results
*(Fill this after deployment)*
- **Network**: Polkadot Asset Hub (Westend)
- **Deployment Tx**: [Pending]
- **Upgrade Tx**: [Pending]
- **Proxy Address**: [Pending]

### Verification Output
```
(Paste output from verify-storage.ts here)
```
