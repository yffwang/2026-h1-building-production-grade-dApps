import { ethers } from "ethers";
import { getApi, getProvider, setBalance } from './utils';
import { accountId32ToH160, convertPublicKeyToSs58, getAlice, getRandomSubstrateKeypair, h160ToAccountId32 } from './accounts';


async function main(){
    console.log("=== Using Local Node ===");
    const alice = getAlice();
    const aliceSs58 = convertPublicKeyToSs58(alice.publicKey);
    console.log(`Alice SS58 address: ${aliceSs58}`);
    const aliceH160 = accountId32ToH160(alice.publicKey);
    console.log(`Alice H160 address: ${aliceH160}`);
    const addressSs58 = aliceSs58;
    const addressH160 = aliceH160;

    // console.log("\n=== Get Random Address ===");
    // const keypair = getRandomSubstrateKeypair();
    // const addressSs58 = convertPublicKeyToSs58(keypair.publicKey);
    // console.log(`Random SS58 address: ${addressSs58}`);
    // const addressH160 = accountId32ToH160(keypair.publicKey);
    // console.log(`Random H160 address: ${addressH160}`);

    console.log("\n=== Setting Balance ===");
    const newBalance = BigInt(7 ** 18); // 设置更大的余额: 10^18 planck
    console.log(`Setting balance to: ${newBalance.toString()} planck`);
    await setBalance(addressSs58, newBalance);

    console.log("\n=== Fetching Balances ===");
    const api = getApi();
    const provider = getProvider();

    // 获取完整的 Substrate 账户信息
    const balance = await api.query.System.Account.getValue(addressSs58);
    console.log(`Substrate balance details:`);
    console.log(`  - Free: ${balance.data.free}`);
    console.log(`  - Reserved: ${balance.data.reserved}`);
    console.log(`  - Frozen: ${balance.data.frozen}`);
    // 计算实际可用余额
    const availableBalance = balance.data.free - balance.data.frozen;
    console.log(`  - Available: ${availableBalance}`);
    // 获取最小存款额
    const existentialDeposit = await api.constants.Balances.ExistentialDeposit();
    console.log(`Existential Deposit: ${existentialDeposit.toString()} planck`);
    // 计算实际可转移余额
    const transferableBalance = balance.data.free - existentialDeposit;
    console.log(`Transferable Balance: ${transferableBalance.toString()} planck`);
    const transferableAsEth = Number(transferableBalance) / (10**12);
    console.log(`Transferable as Token: ${transferableAsEth}`);

    // 获取 Ethers 原始 wei 值
    const eth = await provider.getBalance(addressH160);
    console.log(`Ethers raw value (wei): ${eth.toString()}`);
    console.log(`Ethers Balance: ${ethers.formatEther(eth)} ETH`);

    console.log("\n=== Testing SHA256 Precompile ===");
    const hash_precompile = "0x0000000000000000000000000000000000000002";
    const data = "0x12345678";
    const result = await provider.call({
        to: hash_precompile,
        data: data
    });
    console.log("Result from precompile:", result);

    const hash = ethers.sha256(data);
    console.log("Result from ethers:", hash);
}

main();