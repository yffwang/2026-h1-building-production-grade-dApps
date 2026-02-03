import { useState } from "react";
import { ethers } from "ethers";
import { ERC20_ABI, MINISWAP_ABI, MINISWAP_ADDRESS } from "../constants";

interface SwapProps {
  provider: ethers.BrowserProvider;
  account: string;
}

export const Swap = ({ provider, account }: SwapProps) => {
  const [tokenIn, setTokenIn] = useState("");
  const [tokenOut, setTokenOut] = useState("");
  const [amountIn, setAmountIn] = useState("");
  const [status, setStatus] = useState("");

  const parseAddressOrSetError = (value: string, label: string): string | null => {
    const v = value.trim();
    if (!ethers.isAddress(v)) {
      setStatus(`${label} must be a valid 0x address (ENS is not supported on this network).`);
      return null;
    }
    return ethers.getAddress(v);
  };

  const handleSwap = async () => {
    setStatus("Swapping...");
    try {
      const signer = await provider.getSigner();
      const miniSwapAddress = parseAddressOrSetError(MINISWAP_ADDRESS, "MiniSwap address");
      const tokenInAddress = parseAddressOrSetError(tokenIn, "Token In address");
      const tokenOutAddress = parseAddressOrSetError(tokenOut, "Token Out address");
      if (!miniSwapAddress || !tokenInAddress || !tokenOutAddress) return;

      const miniSwap = new ethers.Contract(miniSwapAddress, MINISWAP_ABI, signer);
      const tokenInContract = new ethers.Contract(tokenInAddress, ERC20_ABI, signer);

      const amountInWei = ethers.parseEther(amountIn || "0");
      if (amountInWei <= 0n) {
        setStatus("Amount must be > 0");
        return;
      }

      const allowance = await tokenInContract.allowance(account, miniSwapAddress);
      if (allowance < amountInWei) {
        setStatus("Approving token...");
        const txApprove = await tokenInContract.approve(miniSwapAddress, amountInWei);
        await txApprove.wait();
      }

      const tx = await miniSwap.swap(tokenInAddress, tokenOutAddress, amountInWei);
      await tx.wait();
      setStatus("Swap successful!");
    } catch (err: any) {
      console.error(err);
      setStatus(`Swap failed: ${err?.message ?? String(err)}`);
    }
  };

  return (
    <div className="card">
      <h2>Swap (1:1, no fees)</h2>

      <div className="input-group">
        <label>Token In Address</label>
        <input placeholder="0x..." value={tokenIn} onChange={(e) => setTokenIn(e.target.value)} />
        <input placeholder="Amount" value={amountIn} onChange={(e) => setAmountIn(e.target.value)} />
      </div>

      <div className="input-group">
        <label>Token Out Address</label>
        <input placeholder="0x..." value={tokenOut} onChange={(e) => setTokenOut(e.target.value)} />
      </div>

      <button onClick={handleSwap} disabled={!tokenIn || !tokenOut || !amountIn}>
        Swap
      </button>
      <div className="hint">MiniSwap: {MINISWAP_ADDRESS}</div>
      {status && <p className="status-msg">{status}</p>}
    </div>
  );
};

