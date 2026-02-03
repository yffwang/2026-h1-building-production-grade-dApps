# MiniSwap (Lesson 3 - 2074)

This homework implements a minimal MiniSwap that supports:

- `addLiquidity(tokenA, tokenB, amount)` (deposit `amount` of each token)
- `removeLiquidity(tokenA, tokenB, liquidity)` (burn `liquidity` shares)
- `swap(tokenIn, tokenOut, amountIn)` (1:1, no fees)

## Contract

Location:

- `contracts/MiniSwap.sol`
- `contracts/MockERC20.sol` (demo / local testing)

### Install & build

```bash
npm install
npx hardhat build
```

### Run unit tests

```bash
npx hardhat test
```

### Deploy (local)

Start a local node in one terminal:

```bash
npx hardhat node
```

Deploy the contract:

```bash
npx hardhat run scripts/deploy.ts --network localhost
```

Optional: deploy demo tokens + seed initial liquidity:

```bash
npx hardhat run scripts/deploy-demo-local.ts --network localhost
```

### Deploy (Polkadot Test Hub / Asset Hub EVM RPC)

Copy `env.example` to `.env` (or export env vars in your shell) and set:

- `PASSET_HUB_RPC_URL` (default: `https://testnet-passet-hub-eth-rpc.polkadot.io`)
- `PASSET_HUB_PRIVATE_KEY` (0x-prefixed private key)

Then:

```bash
npx hardhat run scripts/deploy.ts --network passetHub
```

## UI

Location: `ui/`

The UI is based on `course/lesson-3/ui` and supports:

- Connect MetaMask
- Add Liquidity / Remove Liquidity / Swap
- Configure token addresses manually

### Run UI

```bash
cd ui
npm install
```

Create a `.env` file based on `env.example` and set:

- `VITE_MINISWAP_ADDRESS=<deployed MiniSwap address>`

Then start:

```bash
npm run dev
```
