import { getContract } from "viem";
import { publicClient, getWalletClient } from "./viem";
import StorageABI from "../abis/Storage.json";

export const CONTRACT_ADDRESS = "0x922C65464E237a2C15BFc4c3E6267551A3E14899"; // TODO: change when the paseo asset hub RPC URL is available, and the contract is redeployed
export const CONTRACT_ABI = StorageABI.abi;

// Create a function to get a contract instance for reading
export const getContractInstance = () => {
  return getContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    client: publicClient,
  });
};

// Create a function to get a contract instance with a signer for writing
export const getSignedContract = async () => {
  const walletClient = await getWalletClient();
  return getContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    client: walletClient,
  });
};
