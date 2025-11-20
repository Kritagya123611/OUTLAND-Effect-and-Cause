import { useCallback, useEffect } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { useNavigate } from "react-router-dom";

export default function LoginWrapper() {
  const endpoint = "https://api.mainnet-beta.solana.com";

  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter({ network: WalletAdapterNetwork.Mainnet })
  ];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <Login />
      </WalletProvider>
    </ConnectionProvider>
  );
}

function Login() {
    const navigate = useNavigate();
  const { connect, disconnect, select, connected, connecting, wallet } = useWallet();

  const connectWallet = useCallback(
    async (walletName: string) => {
      try {
        select(walletName as any); // correct type casting
        await connect();
      } catch (e) {
        console.error("Wallet connection error:", e);
      }
    },
    [select, connect]
  );

  useEffect(() => {
    if (connected) {
      navigate("/game");
    }
  }, [connected, navigate]);

  return (
    <div className="min-h-screen bg-black text-gray-200 flex flex-col font-mono">
      <header className="border-b border-gray-800 py-6 flex justify-center">
        <h1 className="text-2xl tracking-widest font-bold text-lime-400">
          OUTLAND — EFFECT & CAUSE
        </h1>
      </header>

      <main className="flex-1 flex justify-center items-center px-6">
        <div className="w-full max-w-lg border border-gray-800 p-10 bg-black/50 shadow-lg">

          <h2 className="text-4xl font-bold text-center">Enter the Arena</h2>

          <p className="mt-3 text-center text-xs tracking-[0.35em] text-gray-500">
            CHOOSE YOUR SOLANA WALLET
          </p>

          <div className="mt-10 border border-gray-800">
            <button
              onClick={() => connectWallet("Phantom")}
              disabled={connecting}
              className="h-14 w-full flex items-center gap-4 px-4 border-b border-gray-800 hover:bg-gray-900"
            >
              <span className="inline-block h-5 w-5 rounded bg-[#7b5cff]" />
              <span className="text-sm font-semibold">CONNECT PHANTOM</span>
            </button>

            <button
              onClick={() => connectWallet("Solflare")}
              disabled={connecting}
              className="h-14 w-full flex items-center gap-4 px-4 hover:bg-gray-900"
            >
              <span className="inline-block h-5 w-5 rounded bg-orange-500" />
              <span className="text-sm font-semibold">CONNECT SOLFLARE</span>
            </button>
          </div>

          {connected && (
            <div className="mt-6 text-center">
              <p className="text-lime-400">WALLET CONNECTED </p>
              <button
                onClick={disconnect}
                className="mt-2 px-4 py-2 border border-gray-700 hover:bg-gray-800"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
