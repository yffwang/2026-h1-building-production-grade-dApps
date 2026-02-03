import { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import { ConnectWallet } from "./components/ConnectWallet";
import { Liquidity } from "./components/Liquidity";
import { Swap } from "./components/Swap";

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [chainId, setChainId] = useState<string>("");

  const handleConnect = (connectedAccount: string, connectedProvider: ethers.BrowserProvider) => {
    setAccount(connectedAccount);
    setProvider(connectedProvider);
  };

  useEffect(() => {
    if (!provider) return;
    provider
      .getNetwork()
      .then((n) => setChainId(n.chainId.toString()))
      .catch(() => setChainId(""));
  }, [provider]);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>MiniSwap Interface</h1>
        {account ? (
          <div className="account-display">
            Connected: {account.slice(0, 6)}...{account.slice(-4)}
          </div>
        ) : (
          <ConnectWallet onConnect={handleConnect} />
        )}
      </header>

      <main>
        {account && provider ? (
          <div className="dashboard">
            <Swap provider={provider} account={account} />
            <Liquidity provider={provider} account={account} />
            {chainId && <div className="hint">ChainId: {chainId}</div>}
          </div>
        ) : (
          <p className="welcome-msg">Please connect your wallet to start.</p>
        )}
      </main>
    </div>
  );
}

export default App;

