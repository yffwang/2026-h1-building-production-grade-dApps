import { useState } from "react";
import { ethers } from "ethers";
import { ERC20_ABI, MINISWAP_ABI, MINISWAP_ADDRESS } from "../constants";

interface LiquidityProps {
  provider: ethers.BrowserProvider;
  account: string;
}

export const Liquidity = ({ provider, account }: LiquidityProps) => {
  const [mode, setMode] = useState<"add" | "remove">("add");
  const [tokenA, setTokenA] = useState("");
  const [tokenB, setTokenB] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");

  const parseAddressOrSetError = (value: string, label: string): string | null => {
    const v = value.trim();
    if (!ethers.isAddress(v)) {
      setStatus(`${label} must be a valid 0x address (ENS is not supported on this network).`);
      return null;
    }
    return ethers.getAddress(v);
  };

  const handleAddLiquidity = async () => {
    setStatus("Adding liquidity...");
    try {
      const signer = await provider.getSigner();
      const miniSwapAddress = parseAddressOrSetError(MINISWAP_ADDRESS, "MiniSwap address");
      const tokenAAddress = parseAddressOrSetError(tokenA, "Token A address");
      const tokenBAddress = parseAddressOrSetError(tokenB, "Token B address");
      if (!miniSwapAddress || !tokenAAddress || !tokenBAddress) return;

      const miniSwap = new ethers.Contract(miniSwapAddress, MINISWAP_ABI, signer);
      const tokenAContract = new ethers.Contract(tokenAAddress, ERC20_ABI, signer);
      const tokenBContract = new ethers.Contract(tokenBAddress, ERC20_ABI, signer);

      const amountWei = ethers.parseEther(amount || "0");
      if (amountWei <= 0n) {
        setStatus("Amount must be > 0");
        return;
      }

      const allowanceA = await tokenAContract.allowance(account, miniSwapAddress);
      if (allowanceA < amountWei) {
        setStatus("Approving Token A...");
        const txA = await tokenAContract.approve(miniSwapAddress, amountWei);
        await txA.wait();
      }

      const allowanceB = await tokenBContract.allowance(account, miniSwapAddress);
      if (allowanceB < amountWei) {
        setStatus("Approving Token B...");
        const txB = await tokenBContract.approve(miniSwapAddress, amountWei);
        await txB.wait();
      }

      setStatus("Submitting addLiquidity...");
      const tx = await miniSwap.addLiquidity(tokenAAddress, tokenBAddress, amountWei);
      await tx.wait();
      setStatus("Liquidity added!");
    } catch (err: any) {
      console.error(err);
      setStatus(`Failed: ${err?.message ?? String(err)}`);
    }
  };

  const handleRemoveLiquidity = async () => {
    setStatus("Removing liquidity...");
    try {
      const signer = await provider.getSigner();
      const miniSwapAddress = parseAddressOrSetError(MINISWAP_ADDRESS, "MiniSwap address");
      const tokenAAddress = parseAddressOrSetError(tokenA, "Token A address");
      const tokenBAddress = parseAddressOrSetError(tokenB, "Token B address");
      if (!miniSwapAddress || !tokenAAddress || !tokenBAddress) return;

      const miniSwap = new ethers.Contract(miniSwapAddress, MINISWAP_ABI, signer);

      const amountWei = ethers.parseEther(amount || "0");
      if (amountWei <= 0n) {
        setStatus("Liquidity must be > 0");
        return;
      }

      setStatus("Submitting removeLiquidity...");
      const tx = await miniSwap.removeLiquidity(tokenAAddress, tokenBAddress, amountWei);
      await tx.wait();
      setStatus("Liquidity removed!");
    } catch (err: any) {
      console.error(err);
      setStatus(`Failed: ${err?.message ?? String(err)}`);
    }
  };

  return (
    <div className="card">
      <h2>Liquidity</h2>

      <div className="tabs">
        <button className={mode === "add" ? "active" : ""} onClick={() => setMode("add")}>
          Add
        </button>
        <button className={mode === "remove" ? "active" : ""} onClick={() => setMode("remove")}>
          Remove
        </button>
      </div>

      <div className="input-group">
        <label>Token A Address</label>
        <input placeholder="0x..." value={tokenA} onChange={(e) => setTokenA(e.target.value)} />
      </div>

      <div className="input-group">
        <label>Token B Address</label>
        <input placeholder="0x..." value={tokenB} onChange={(e) => setTokenB(e.target.value)} />
      </div>

      <div className="input-group">
        <label>{mode === "add" ? "Deposit Amount (each token)" : "Liquidity to Burn"}</label>
        <input placeholder="0.0" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>

      {mode === "add" ? (
        <button onClick={handleAddLiquidity} disabled={!tokenA || !tokenB || !amount}>
          Add Liquidity
        </button>
      ) : (
        <button onClick={handleRemoveLiquidity} disabled={!tokenA || !tokenB || !amount}>
          Remove Liquidity
        </button>
      )}

      <div className="hint">MiniSwap: {MINISWAP_ADDRESS}</div>
      {status && <p className="status-msg">{status}</p>}
    </div>
  );
};

