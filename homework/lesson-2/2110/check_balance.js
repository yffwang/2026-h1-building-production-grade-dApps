require("dotenv").config();

const { ApiPromise, WsProvider } = require("@polkadot/api");
const { encodeAddress, cryptoWaitReady } = require("@polkadot/util-crypto");
const { u8aToHex } = require("@polkadot/util");
const { ethers } = require("ethers");

/**
 * Passet/Polkadot Hub 的 EVM→Substrate 映射（AccountId32Mapper / pallet_revive）：
 * AccountId32 = H160(20 bytes) + 0xEE * 12 bytes
 * 参考官方 docs：20-byte 以 12 个 0xEE 结尾补齐到 32-byte。:contentReference[oaicite:4]{index=4}
 */
function evmToAccountId32Bytes(evmAddress) {
  const addr = ethers.getAddress(evmAddress); // checksum
  const h160 = ethers.getBytes(addr); // Uint8Array(20)
  const suffix = new Uint8Array(12).fill(0xee); // 12 bytes of 0xEE
  const out = new Uint8Array(32);
  out.set(h160, 0);
  out.set(suffix, 20);
  return out; // Uint8Array(32)
}

function toSs58(accountId32Bytes, ss58Prefix) {
  return encodeAddress(accountId32Bytes, ss58Prefix);
}

async function getSs58Prefix(api) {
  // 优先从 runtime 常量拿 ss58Prefix
  try {
    if (api.consts?.system?.ss58Prefix) {
      return api.consts.system.ss58Prefix.toNumber();
    }
  } catch (_) {}

  // 兜底：registry 的 chainSS58
  if (typeof api.registry.chainSS58 === "number") return api.registry.chainSS58;

  // 最后兜底
  return 42;
}

function bigintFromBnLike(x) {
  // polkadot.js Balance 通常可 toString
  return BigInt(x.toString());
}

async function compareBalances({ evmRpc, substrateWs, evmAddress }) {
  // EVM 余额（wei）
  const evmProvider = new ethers.JsonRpcProvider(evmRpc);
  const evmBal = await evmProvider.getBalance(evmAddress); // bigint

  // Substrate 余额（Balances pallet）
  const api = await ApiPromise.create({ provider: new WsProvider(substrateWs) });
  const ss58Prefix = await getSs58Prefix(api);

  const accountId32 = evmToAccountId32Bytes(evmAddress);
  const substrateAddr = toSs58(accountId32, ss58Prefix);

  const info = await api.query.system.account(substrateAddr);
  const free = bigintFromBnLike(info.data.free);
  const reserved = bigintFromBnLike(info.data.reserved);
  const total = free + reserved;

  await api.disconnect();

  return {
    ss58Prefix,
    evmAddress: ethers.getAddress(evmAddress),
    accountId32Hex: u8aToHex(accountId32),
    substrateAddr,
    evmBalanceWei: evmBal,
    substrateFree: free,
    substrateReserved: reserved,
    substrateTotal: total,
    // 通常对齐的是 free；但我也给你 total 一起比，避免老师环境里有 reserved 造成误判
    matchFree: free === evmBal,
    matchTotal: total === evmBal
  };
}

async function callSha256Precompile(evmRpc, inputString) {
  const provider = new ethers.JsonRpcProvider(evmRpc);

  // 标准 EVM precompile：SHA256 地址 0x...02
  const sha256Precompile = "0x0000000000000000000000000000000000000002";

  const inputBytes = ethers.toUtf8Bytes(inputString);
  const data = ethers.hexlify(inputBytes);

  // 链上 eth_call
  const onchain = await provider.call({ to: sha256Precompile, data });

  // 本地对照
  const local = ethers.sha256(inputBytes);

  return {
    precompile: sha256Precompile,
    input: data,
    onchain,
    local,
    same: onchain.toLowerCase() === local.toLowerCase()
  };
}

async function main() {
  const evmAddress = process.env.EVM_ADDRESS;
  const evmRpc = process.env.EVM_RPC;
  const substrateWs = process.env.SUBSTRATE_WS;
  const preInput = process.env.PRECOMPILE_INPUT || "polkadot-precompile-test";

  if (!evmAddress || !evmRpc || !substrateWs) {
    throw new Error("请先配置 .env：EVM_ADDRESS, EVM_RPC, SUBSTRATE_WS");
  }

  await cryptoWaitReady();

  console.log("=== (1) EVM地址 -> Substrate地址（AccountId32）映射 ===");
  const accountId32 = evmToAccountId32Bytes(evmAddress);
  console.log("EVM Address:     ", ethers.getAddress(evmAddress));
  console.log("AccountId32 Hex: ", u8aToHex(accountId32), "(H160 + 0xEE*12)"); // :contentReference[oaicite:5]{index=5}

  console.log("\n=== (2) 余额一致性对比：eth_getBalance vs system.account ===");
  const r = await compareBalances({ evmRpc, substrateWs, evmAddress });
  console.log("Substrate ss58Prefix:", r.ss58Prefix);
  console.log("Substrate Address:   ", r.substrateAddr);
  console.log("EVM balance (wei):   ", r.evmBalanceWei.toString());
  console.log("Substrate free:      ", r.substrateFree.toString());
  console.log("Substrate reserved:  ", r.substrateReserved.toString());
  console.log("Substrate total:     ", r.substrateTotal.toString());
  console.log("Match free?          ", r.matchFree);
  console.log("Match total?         ", r.matchTotal);

  console.log("\n=== (3) 调用 EVM precompile：SHA256(0x02) 并校验 ===");
  const p = await callSha256Precompile(evmRpc, preInput);
  console.log("Precompile:", p.precompile);
  console.log("Input:     ", p.input);
  console.log("On-chain:  ", p.onchain);
  console.log("Local:     ", p.local);
  console.log("Same?      ", p.same);

  console.log("\n✅ Done.");
}

main().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
