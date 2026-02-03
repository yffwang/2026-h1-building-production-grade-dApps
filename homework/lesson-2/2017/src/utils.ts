import { ethers } from "ethers";
import { getWsProvider } from 'polkadot-api/ws-provider';
import { createClient, TypedApi } from 'polkadot-api';
import { devnet } from '@polkadot-api/descriptors';
import { convertPublicKeyToSs58, getAlice } from './accounts';
import { getPolkadotSigner } from "polkadot-api/signer"

const LOCAL_URL = "http://localhost:8545";
const LOCAL_WS_URL = "http://localhost:9944";

// const HUB_URL = "https://services.polkadothub-rpc.com/testnet";
// const HUB_WS_URL = "wss://asset-hub-paseo-rpc.n.dwellir.com";

export function getProvider(): ethers.JsonRpcProvider {
    return new ethers.JsonRpcProvider(LOCAL_URL);
}

export function getApi(): TypedApi<typeof devnet> {
    return createClient(getWsProvider(LOCAL_WS_URL)).getTypedApi(devnet);
}


export async function setBalance(ss58Address: string, balance: bigint) {
    const api = getApi();
    const alice = getAlice();
    const polkadotSigner = getPolkadotSigner(
        alice.publicKey,
        "Sr25519",
        alice.sign,
    )

    const inner_call = api.tx.Balances.force_set_balance({ who: { type: "Id", value: ss58Address }, new_free: balance });
    const tx = api.tx.Sudo.sudo({ call: inner_call.decodedCall });
    const hash = await tx.signAndSubmit(polkadotSigner);
    console.log(`Transaction hash: ${hash.txHash}`);
}