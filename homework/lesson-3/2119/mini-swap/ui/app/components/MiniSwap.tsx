"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import MiniSwapArtifact from "../artifacts/MiniSwap.json";
import IERC20Artifact from "../artifacts/MockERC20.json"; // Using MockERC20 ABI for standard ERC20 calls
import { ArrowRight, Wallet, Settings, RefreshCw, Plus, Minus } from "lucide-react";

export default function MiniSwapInterface() {
  const [account, setAccount] = useState<string>("");
  const [provider, setProvider] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);

  // Configuration
  const [miniSwapAddress, setMiniSwapAddress] = useState<string>("");
  const [tokenAAddress, setTokenAAddress] = useState<string>("");
  const [tokenBAddress, setTokenBAddress] = useState<string>("");

  // Tabs: 'swap' | 'add' | 'remove'
  const [activeTab, setActiveTab] = useState<string>("swap");

  // Inputs
  const [amountA, setAmountA] = useState<string>("");
  const [amountB, setAmountB] = useState<string>(""); // For output or liquidity
  const [swapDirection, setSwapDirection] = useState<boolean>(true); // true: A -> B, false: B -> A

  // Status
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Balances
  const [balanceA, setBalanceA] = useState<string>("0");
  const [balanceB, setBalanceB] = useState<string>("0");
  const [liquidity, setLiquidity] = useState<string>("0");

  useEffect(() => {
    if ((window as any).ethereum) {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      setProvider(provider);
    }
  }, []);

  useEffect(() => {
    if (account && tokenAAddress && tokenBAddress && miniSwapAddress) {
      fetchBalances();
    }
  }, [account, tokenAAddress, tokenBAddress, miniSwapAddress, provider]);

  const connectWallet = async () => {
    if (!provider) {
      setStatus("Please install MetaMask");
      return;
    }
    try {
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      setAccount(accounts[0]);
      setSigner(signer);
      setStatus("Wallet connected");
    } catch (error: any) {
      setStatus("Connection failed: " + error.message);
    }
  };

  const fetchBalances = async () => {
    if (!provider || !account) return;
    try {
      const tokenA = new ethers.Contract(tokenAAddress, IERC20Artifact.abi, provider);
      const tokenB = new ethers.Contract(tokenBAddress, IERC20Artifact.abi, provider);
      const miniSwap = new ethers.Contract(miniSwapAddress, MiniSwapArtifact.abi, provider);

      const balA = await tokenA.balanceOf(account);
      const balB = await tokenB.balanceOf(account);
      const liq = await miniSwap.getLiquidity(account, tokenAAddress, tokenBAddress);

      setBalanceA(ethers.formatEther(balA));
      setBalanceB(ethers.formatEther(balB));
      setLiquidity(ethers.formatEther(liq));
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  };

  const approveToken = async (tokenAddress: string, amount: string) => {
    const token = new ethers.Contract(tokenAddress, IERC20Artifact.abi, signer);
    const tx = await token.approve(miniSwapAddress, ethers.parseEther(amount));
    setStatus(`Approving ${tokenAddress}...`);
    await tx.wait();
    setStatus("Approved");
  };

  const handleSwap = async () => {
    if (!miniSwapAddress || !tokenAAddress || !tokenBAddress) return;
    setLoading(true);
    try {
      const miniSwap = new ethers.Contract(miniSwapAddress, MiniSwapArtifact.abi, signer);
      const amount = ethers.parseEther(amountA);
      
      const tokenIn = swapDirection ? tokenAAddress : tokenBAddress;
      const tokenOut = swapDirection ? tokenBAddress : tokenAAddress;

      // Check allowance
      const tokenContract = new ethers.Contract(tokenIn, IERC20Artifact.abi, signer);
      const allowance = await tokenContract.allowance(account, miniSwapAddress);
      if (allowance < amount) {
        await approveToken(tokenIn, amountA);
      }

      const tx = await miniSwap.swap(tokenIn, tokenOut, amount);
      setStatus("Swapping...");
      await tx.wait();
      setStatus("Swap successful!");
      fetchBalances();
    } catch (error: any) {
      setStatus("Swap failed: " + error.message);
    }
    setLoading(false);
  };

  const handleAddLiquidity = async () => {
    if (!miniSwapAddress || !tokenAAddress || !tokenBAddress) return;
    setLoading(true);
    try {
      const miniSwap = new ethers.Contract(miniSwapAddress, MiniSwapArtifact.abi, signer);
      const amount = ethers.parseEther(amountA);

      // Approve both
      const tokenA = new ethers.Contract(tokenAAddress, IERC20Artifact.abi, signer);
      const allowanceA = await tokenA.allowance(account, miniSwapAddress);
      if (allowanceA < amount) await approveToken(tokenAAddress, amountA);

      const tokenB = new ethers.Contract(tokenBAddress, IERC20Artifact.abi, signer);
      const allowanceB = await tokenB.allowance(account, miniSwapAddress);
      if (allowanceB < amount) await approveToken(tokenBAddress, amountA);

      const tx = await miniSwap.addLiquidity(tokenAAddress, tokenBAddress, amount);
      setStatus("Adding liquidity...");
      await tx.wait();
      setStatus("Liquidity added!");
      fetchBalances();
    } catch (error: any) {
      setStatus("Add liquidity failed: " + error.message);
    }
    setLoading(false);
  };

  const handleRemoveLiquidity = async () => {
    if (!miniSwapAddress || !tokenAAddress || !tokenBAddress) return;
    setLoading(true);
    try {
      const miniSwap = new ethers.Contract(miniSwapAddress, MiniSwapArtifact.abi, signer);
      const amount = ethers.parseEther(amountA);

      const tx = await miniSwap.removeLiquidity(tokenAAddress, tokenBAddress, amount);
      setStatus("Removing liquidity...");
      await tx.wait();
      setStatus("Liquidity removed!");
      fetchBalances();
    } catch (error: any) {
      setStatus("Remove liquidity failed: " + error.message);
    }
    setLoading(false);
  };

  const handleMint = async (tokenAddress: string) => {
    if (!tokenAddress) return;
    setLoading(true);
    try {
      const token = new ethers.Contract(tokenAddress, IERC20Artifact.abi, signer);
      // Check if mint function exists (it does in MockERC20)
      const tx = await token.mint(account, ethers.parseEther("1000"));
      setStatus(`Minting 1000 tokens...`);
      await tx.wait();
      setStatus("Minted 1000 tokens");
      fetchBalances();
    } catch (error: any) {
      setStatus("Mint failed: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white text-gray-900 rounded-xl shadow-lg mt-10">
      <h1 className="text-2xl font-bold mb-4 text-center">MiniSwap</h1>
      
      {!account ? (
        <button
          onClick={connectWallet}
          className="w-full bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700"
        >
          <Wallet size={20} /> Connect Wallet
        </button>
      ) : (
        <div className="text-sm text-center mb-4 text-gray-600">
          Connected: {account.slice(0, 6)}...{account.slice(-4)}
        </div>
      )}

      {/* Configuration Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Settings size={16} /> Configuration
        </h2>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="MiniSwap Contract Address"
            className="w-full p-2 border rounded text-xs text-gray-900 bg-white"
            value={miniSwapAddress}
            onChange={(e) => setMiniSwapAddress(e.target.value)}
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Token A Address"
              className="w-full p-2 border rounded text-xs text-gray-900 bg-white"
              value={tokenAAddress}
              onChange={(e) => setTokenAAddress(e.target.value)}
            />
            <button onClick={() => handleMint(tokenAAddress)} className="bg-gray-200 px-2 rounded text-xs hover:bg-gray-300 text-gray-800" title="Mint 1000 Tokens">Mint</button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Token B Address"
              className="w-full p-2 border rounded text-xs text-gray-900 bg-white"
              value={tokenBAddress}
              onChange={(e) => setTokenBAddress(e.target.value)}
            />
            <button onClick={() => handleMint(tokenBAddress)} className="bg-gray-200 px-2 rounded text-xs hover:bg-gray-300 text-gray-800" title="Mint 1000 Tokens">Mint</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mb-4 border-b">
        {['swap', 'add', 'remove'].map((tab) => (
          <button
            key={tab}
            className={`flex-1 py-2 capitalize ${activeTab === tab ? 'border-b-2 border-blue-600 font-bold' : 'text-gray-500'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'add' ? 'Add Liquidity' : tab === 'remove' ? 'Remove Liquidity' : 'Swap'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'swap' && (
          <div className="space-y-4">
             <div className="flex justify-between items-center bg-gray-100 p-3 rounded-lg">
                <span className="font-bold">{swapDirection ? "Token A" : "Token B"}</span>
                <span className="text-xs text-gray-500">Bal: {swapDirection ? balanceA : balanceB}</span>
             </div>
             <input
              type="number"
              placeholder="Amount"
              className="w-full p-3 border rounded-lg text-lg text-gray-900 bg-white"
              value={amountA}
              onChange={(e) => setAmountA(e.target.value)}
            />
            <div className="flex justify-center">
              <button 
                onClick={() => setSwapDirection(!swapDirection)}
                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 text-gray-700"
              >
                <ArrowRight className="transform rotate-90" />
              </button>
            </div>
            <div className="flex justify-between items-center bg-gray-100 p-3 rounded-lg">
                <span className="font-bold">{swapDirection ? "Token B" : "Token A"}</span>
                <span className="text-xs text-gray-500">Bal: {swapDirection ? balanceB : balanceA}</span>
             </div>
             <div className="w-full p-3 border rounded-lg text-lg bg-gray-50 text-gray-500">
               {amountA || "0"}
             </div>
             
             <button
              onClick={handleSwap}
              disabled={loading || !amountA}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Swapping..." : "Swap"}
            </button>
          </div>
        )}

        {activeTab === 'add' && (
          <div className="space-y-4">
             <div className="text-sm text-gray-600 mb-2">Add equal amounts of Token A and Token B (1:1 Ratio)</div>
             <input
              type="number"
              placeholder="Amount"
              className="w-full p-3 border rounded-lg text-lg text-gray-900 bg-white"
              value={amountA}
              onChange={(e) => setAmountA(e.target.value)}
            />
            <div className="flex justify-between text-xs text-gray-500">
               <span>Token A Bal: {balanceA}</span>
               <span>Token B Bal: {balanceB}</span>
            </div>
            <button
              onClick={handleAddLiquidity}
              disabled={loading || !amountA}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Liquidity"}
            </button>
            <div className="text-center text-sm text-gray-600 mt-2">
               Your Liquidity: {liquidity}
            </div>
          </div>
        )}

        {activeTab === 'remove' && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-2">Remove liquidity to receive Token A and Token B</div>
             <input
              type="number"
              placeholder="Amount to remove"
              className="w-full p-3 border rounded-lg text-lg text-gray-900 bg-white"
              value={amountA}
              onChange={(e) => setAmountA(e.target.value)}
            />
            <div className="text-right text-xs text-gray-500">
               Your Liquidity: {liquidity}
            </div>
            <button
              onClick={handleRemoveLiquidity}
              disabled={loading || !amountA}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Removing..." : "Remove Liquidity"}
            </button>
          </div>
        )}

        {status && (
          <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded text-sm text-center">
            {status}
          </div>
        )}
      </div>
    </div>
  );
}

