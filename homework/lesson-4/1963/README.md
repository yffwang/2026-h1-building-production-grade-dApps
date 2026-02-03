# Lesson 4 Homework - Upgradeable Contract on Polkadot Test Hub

This project demonstrates an upgradeable smart contract deployed on Polkadot test Hub, with two versions showing storage compatibility during upgrades.

## ✅ Deployment Results

### Local Testing (Anvil) ✅

**Network:** Local Anvil (http://127.0.0.1:8545)  
**Status:** Successfully tested complete workflow

**Test Results:**
- ✅ V1 implementation deployed
- ✅ Proxy contract deployed
- ✅ Storage read (before upgrade) - Version 1 confirmed
- ✅ V2 implementation deployed
- ✅ Proxy upgraded to V2
- ✅ Upgrade function called - Version updated to 2
- ✅ Storage read (after upgrade) - All values preserved correctly

**Note:** Local testing completed successfully. Contracts are deleted when Anvil restarts.

### Polkadot Test Hub Deployment ✅

**Network:** Polkadot Hub TestNet (PAsset Hub)  
**RPC Endpoint:** `https://testnet-passet-hub-eth-rpc.polkadot.io`  
**Chain ID:** `420420422`  
**Block Explorer:** `https://blockscout-passet-hub.parity-testnet.parity.io/`  
**Deployment Account:** `0x5e0774b9f1B5737c2c5e2eb88a6ca2eD08D9D629`

**Contract Addresses:**
- Proxy Address: `0xAb07F903893FE503887c0B57Dba032CaAf86E52C`
- V1 Implementation: `0x6C8B1A06bF95313fa9EA8752D9400dDF250b037B`
- V2 Implementation: `0x0FD51eD3dcc47cB566E6890Be5F860d52F29E24A`

**Transaction Hashes:**
- V1 Deployment TX: `0x85b6eab072012be75616ebdb342417ee80d1e1c8aff76b0e706aecb8d7ca5cfe`
- Proxy Deployment TX: `0xd9658633b7658ab0e67d7d8842f23e7b386b84aa74c3a51a354ff855fc4f7600`
- V2 Deployment TX: `0x00af6a1cc0ae3a59e2d16cef808a4a8bc26e9ce997d6b8602e30be4f14de5a96`
- Upgrade TX: `0xb50ba76b289d4eb574986c6516454c74c0e10816670ff496314795d8526783c8`
- Upgrade Function TX: `0x83362d0bfdc2024830e26af90a8cd042fb670008596c73a530740e4e5fe3d44d`

**Deployment Status:** ✅ Successfully deployed and upgraded on Polkadot Test Hub

### Storage Comparison Results

**Before Upgrade (V1):**
- Version: `1`
- Stored Value: `100`
- Stored String: `"Hello from V1"`
- Owner: `0x5e0774b9f1B5737c2c5e2eb88a6ca2eD08D9D629`

**After Upgrade (V2):**
- Version: `2` ✅ **CHANGED**
- Stored Value: `100` ✅ **UNCHANGED**
- Stored String: `"Hello from V1"` ✅ **UNCHANGED**
- Owner: `0x5e0774b9f1B5737c2c5e2eb88a6ca2eD08D9D629` ✅ **UNCHANGED**
- New Value: `0` ➕ **NEW**
- Is Upgraded: `true` ➕ **NEW**

**Conclusion:** The upgrade successfully demonstrates that:
- ✅ Storage values are preserved via delegatecall
- ✅ Version can be updated after upgrade
- ✅ New variables can be added without affecting existing data

## Project Structure

```
.
├── contracts/
│   ├── Proxy.sol              # Custom UUPS proxy with delegatecall & assembly
│   ├── SimpleStorageV1.sol    # Version 1 implementation contract
│   └── SimpleStorageV2.sol    # Version 2 implementation contract
├── scripts/
│   ├── deploy-simple.ts       # Deploy V1 as upgradeable proxy (ethers.js)
│   ├── upgrade-simple.ts      # Upgrade from V1 to V2 (ethers.js)
│   ├── readStorage-simple.ts  # Read and compare storage values (ethers.js)
│   └── fullWorkflow.ts        # Complete workflow: deploy → upgrade → read (all in one)
├── foundry.toml               # Foundry configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies and scripts
```

## Contracts Overview

### SimpleStorageV1
- **Storage Variables:**
  - `storedValue` (uint256): A numeric value
  - `storedString` (string): A string value
  - `owner` (address): Contract owner
  - `version` (uint8): Contract version (set to 1)

### SimpleStorageV2
- **Inherits from SimpleStorageV1** (maintains storage compatibility)
- **Additional Storage Variables:**
  - `newValue` (uint256): New variable added in V2
  - `isUpgraded` (bool): Flag indicating upgrade status
- **New Functions:**
  - `upgrade()`: Updates version from 1 to 2
  - `setNewValue()`: Sets the new value
  - `getCombinedValue()`: Returns sum of storedValue and newValue

## Setup

This project uses **Foundry** for compilation and **ethers.js** for deployment (no Hardhat).

### Prerequisites

- Node.js and npm
- Foundry (install with: `curl -L https://foundry.paradigm.xyz | bash && foundryup`)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
PRIVATE_KEY=your_private_key_here
POLKADOT_TEST_HUB_RPC=https://testnet-passet-hub-eth-rpc.polkadot.io
PROXY_ADDRESS=  # Will be set after deployment
```

**Note:** For local testing, use `POLKADOT_TEST_HUB_RPC=http://127.0.0.1:8545` and start Anvil.

3. Compile contracts:
```bash
npm run compile
# or directly: forge build
```

This uses Foundry to compile contracts (faster and no npm dependency issues).

## Deployment

### Option 1: Complete Workflow (Recommended)

Run everything in one go to avoid nonce issues:

```bash
npm run full
```

This script will:
1. Deploy V1 Implementation
2. Deploy Proxy Contract
3. Read storage (before upgrade)
4. Deploy V2 Implementation
5. Upgrade Proxy to V2
6. Call upgrade() function
7. Read storage (after upgrade)
8. Display storage comparison

**Output includes:**
- All contract addresses
- All transaction hashes
- Storage values before and after upgrade
- Complete storage comparison

### Option 2: Step-by-Step Deployment

#### Step 1: Deploy V1 Contract

```bash
npm run deploy
```

**Deployment Transaction Hash:**
```
[Fill with actual transaction hash from deployment output]
```

**Proxy Address:**
```
0x5FC8d32690cc91D4c39d9d3abcBD16989F875707
```
*(Example from local Anvil deployment - will be different on Polkadot)*

After deployment, update your `.env` file with the `PROXY_ADDRESS`.

#### Step 2: Read Storage (Before Upgrade)

```bash
npm run read-storage
```

**Pre-Upgrade Storage Values:**
```
Version: 1
Stored Value: 100
Stored String: Hello from V1
Owner: [your deployer address]
```

#### Step 3: Upgrade to V2

```bash
npm run upgrade
```

**Upgrade Transaction Hash:**
```
[Fill with actual upgrade transaction hash]
```

**Upgrade Function Transaction Hash:**
```
[Fill with actual upgrade function transaction hash]
```

#### Step 4: Read Storage (After Upgrade)

```bash
npm run read-storage
```

**Post-Upgrade Storage Values:**
```
Version: 2
Stored Value: 100 (unchanged)
Stored String: Hello from V1 (unchanged)
Owner: [same address, unchanged]
New Value: 0
Is Upgraded: true
```

## Storage Comparison Results

### Changed Storage (Modified during upgrade)
- **version**: `1` → `2`
  - Changed when `upgrade()` function was called
  - This demonstrates that the version variable can be updated after proxy upgrade

### Unchanged Storage (Preserved after upgrade)
- **storedValue**: `100` (unchanged)
  - Preserved because storage is in the proxy contract, not the implementation
- **storedString**: `"Hello from V1"` (unchanged)
  - Preserved via delegatecall mechanism
- **owner**: `[deployer address]` (unchanged)
  - Preserved because storage layout is compatible between V1 and V2
  
**Why these remain unchanged:**
- All storage is stored in the **Proxy contract**, not the implementation
- When we upgrade, we only change the implementation address
- The proxy's storage (including all these values) remains untouched
- This is the power of the delegatecall pattern!

### New Storage (Added in V2)
- **newValue**: `0` (initialized to 0)
  - New variable added in V2, placed at the end of storage layout
- **isUpgraded**: `true` (set during upgrade)
  - Flag set to `true` when `upgrade()` function is called
  
**Why new variables work:**
- V2 inherits from V1, preserving all V1 storage variables in the same order
- New variables are added **at the end** to avoid storage slot conflicts
- This maintains storage layout compatibility

## TypeScript Call Results

### Before Upgrade (V1)

Running `npm run read-storage` before upgrade shows:

```
=== Current Contract State ===

📋 Storage Values:
  Version: 1
  Stored Value (uint256): 100
  Stored String: Hello from V1
  Owner: 0x5e0774b9f1B5737c2c5e2eb88a6ca2eD08D9D629

=== Storage Analysis ===

✅ UNCHANGED Storage (preserved after upgrade):
  - storedValue: 100
  - storedString: Hello from V1
  - owner: 0x5e0774b9f1B5737c2c5e2eb88a6ca2eD08D9D629
  → These values remain the same because storage layout is compatible

ℹ️  Contract is still at V1 (not upgraded yet)
```

### After Upgrade (V2)

Running `npm run read-storage` after upgrade shows:

```
=== Current Contract State ===

📋 Storage Values:
  Version: 2
  Stored Value (uint256): 100
  Stored String: Hello from V1
  Owner: 0x5e0774b9f1B5737c2c5e2eb88a6ca2eD08D9D629

📋 V2 Additional Storage:
  New Value (uint256): 0
  Is Upgraded (bool): true
  Combined Value (storedValue + newValue): 100

=== Storage Analysis ===

✅ UNCHANGED Storage (preserved after upgrade):
  - storedValue: 100
  - storedString: Hello from V1
  - owner: 0x5e0774b9f1B5737c2c5e2eb88a6ca2eD08D9D629
  → These values remain the same because storage layout is compatible

🔄 CHANGED Storage (modified during upgrade):
  - version: 1 → 2
  → Version number changed from 1 to 2

➕ NEW Storage (added in V2):
  - newValue: 0 (initialized to 0)
  - isUpgraded: true
  → These are new variables added in V2
```

### Key Observations

1. **Storage Preservation**: All V1 storage values (`storedValue`, `storedString`, `owner`) remain exactly the same after upgrade
2. **Version Update**: The `version` variable successfully changed from 1 to 2
3. **New Functionality**: V2 adds new storage variables (`newValue`, `isUpgraded`) without affecting existing data
4. **delegatecall Works**: This proves that delegatecall preserves storage in the proxy contract

## Technical Details

### Upgradeable Pattern - Custom UUPS Implementation

This project implements a **custom UUPS (Universal Upgradeable Proxy Standard) proxy** that demonstrates the core concepts:

#### 1. **delegatecall** - The Core Mechanism
```solidity
// In Proxy.sol fallback() function
delegatecall(gas(), implementation, 0, calldatasize(), 0, 0)
```

**How it works:**
- `delegatecall` executes the implementation contract's code
- BUT it executes in the **proxy's storage context**
- This means all storage reads/writes happen in the proxy contract
- `msg.sender` and `msg.value` are preserved
- This is why storage persists across upgrades!

**Example:**
- When you call `setValue(100)` on the proxy:
  1. Proxy's `fallback()` receives the call
  2. Proxy uses `delegatecall` to execute `SimpleStorageV1.setValue(100)`
  3. The `storedValue` variable is written to the **proxy's storage slot**
  4. After upgrade, the same storage slot is read by V2

#### 2. **Assembly Code** - Low-Level Operations

The proxy uses assembly for:
- **Storage operations**: `sstore` (write) and `sload` (read)
- **Calldata handling**: `calldatacopy` and `returndatacopy`
- **Control flow**: `switch` statements for error handling

```solidity
// Reading implementation address from storage
assembly {
    implementation := sload(IMPLEMENTATION_SLOT)
}

// Writing new implementation address
assembly {
    sstore(IMPLEMENTATION_SLOT, newImplementation)
}

// Performing delegatecall
assembly {
    let result := delegatecall(gas(), implementation, 0, calldatasize(), 0, 0)
    // Handle result...
}
```

#### 3. **EIP-1967 Storage Slots**

To avoid storage collisions, we use specific storage slots:
- **Implementation slot**: `0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc`
- **Admin slot**: `0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103`

These are keccak-256 hashes that ensure the proxy's internal storage doesn't conflict with implementation storage.

#### 4. **Storage Layout Compatibility**

- V2 inherits from V1, ensuring all V1 storage variables remain in the same order
- New variables are added at the end to avoid storage slot conflicts
- This ensures data integrity during upgrades

**Storage Layout:**
```
Proxy Contract Storage:
├── Slot 0x3608...: Implementation address (EIP-1967)
├── Slot 0xb531...: Admin address (EIP-1967)
├── Slot 0: storedValue (uint256)
├── Slot 1: storedString (string)
├── Slot 2: owner (address)
├── Slot 3: version (uint8)
├── Slot 4: newValue (uint256) - V2 only
└── Slot 5: isUpgraded (bool) - V2 only
```

### How the Upgrade Works

1. **Deploy V1 Implementation**: Logic contract with V1 functions
2. **Deploy Proxy**: Points to V1, stores all state
3. **User calls proxy**: Proxy uses `delegatecall` to execute V1 code
4. **Upgrade to V2**: 
   - Deploy V2 Implementation
   - Update proxy's implementation slot (via assembly)
   - Storage remains unchanged in proxy
5. **User calls proxy**: Now uses `delegatecall` to execute V2 code
6. **Storage preserved**: All V1 data is still accessible because it's in the proxy!

## Network Configuration

The project uses ethers.js directly. Configure networks in your `.env` file:
- `POLKADOT_TEST_HUB_RPC`: RPC endpoint URL
- `PRIVATE_KEY`: Your deployment account private key

For local testing, you can use Foundry's Anvil:
```bash
anvil  # Starts local node on http://127.0.0.1:8545
# Then set POLKADOT_TEST_HUB_RPC=http://127.0.0.1:8545 in .env
```

**Note:** When you restart Anvil, all contracts are deleted. You'll need to redeploy.

## Quick Start (Local Testing)

1. **Start Anvil:**
   ```bash
   anvil
   ```

2. **Update `.env`:**
   ```env
   POLKADOT_TEST_HUB_RPC=http://127.0.0.1:8545
   PRIVATE_KEY=your_private_key_here
   ```
   (Use one of Anvil's pre-funded account private keys shown when you start Anvil)

3. **Run complete workflow:**
   ```bash
   npm run full
   ```

This will deploy, upgrade, and show storage comparison in one go!

## Available Scripts

- `npm run compile` - Compile contracts using Foundry
- `npm run deploy` - Deploy V1 implementation and proxy
- `npm run upgrade` - Upgrade proxy to V2 implementation
- `npm run read-storage` - Read and analyze storage values
- `npm run full` - Complete workflow: deploy → upgrade → read (recommended for local testing)

## Homework Requirements Checklist

✅ **Two versions of contracts:**
- SimpleStorageV1.sol (Version 1)
- SimpleStorageV2.sol (Version 2)

✅ **Complete Foundry project:**
- Foundry for compilation
- ethers.js for deployment scripts
- TypeScript for interaction scripts

✅ **TypeScript code to read storage:**
- `readStorage-simple.ts` - Shows storage before and after upgrade
- Demonstrates changed/unchanged storage

✅ **README with deployment information:**
- Deployment transaction hash (see "Deployment Results" section above)
- Upgrade transaction hash (see "Deployment Results" section above)
- TypeScript call results (see "TypeScript Call Results" section)
- Storage comparison (see "Storage Comparison Results" section)

## Deployment Instructions

### Local Testing

1. Start Anvil: `anvil`
2. Update `.env` with local RPC: `POLKADOT_TEST_HUB_RPC=http://127.0.0.1:8545`
3. Run: `npm run full`

### Polkadot Test Hub Deployment

1. Update `.env`:
   ```env
   POLKADOT_TEST_HUB_RPC=https://testnet-passet-hub-eth-rpc.polkadot.io
   PRIVATE_KEY=your_test_account_private_key
   ```
2. Run: `npm run full`
3. Copy deployment information from output
4. Update README with actual contract addresses and transaction hashes

## License

MIT
