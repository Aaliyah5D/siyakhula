import { useMemo } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider } from "@coral-xyz/anchor";
import { SiyakhulaSDK } from "@/lib/siyakhula";

/**
 * Hook to get the Siyakhula SDK instance.
 * Returns null if wallet is not connected.
 */
export function useProgram(): SiyakhulaSDK | null {
  const { connection } = useConnection();
  const { publicKey, signTransaction, signAllTransactions } = useWallet();

  const sdk = useMemo(() => {
    if (!publicKey || !signTransaction || !signAllTransactions) return null;

    const provider = new AnchorProvider(
      connection,
      { publicKey, signTransaction, signAllTransactions } as any,
      { commitment: "confirmed" }
    );

    return new SiyakhulaSDK(provider);
  }, [connection, publicKey, signTransaction, signAllTransactions]);

  return sdk;
}
