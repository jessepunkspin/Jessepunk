"use client";

import { useEffect, useState } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { Wallet } from "@coinbase/onchainkit/wallet";

export default function Home() {
  const { context, setMiniAppReady, isMiniAppReady } = useMiniKit();

  const [walletAddress, setWalletAddress] = useState<string>("");
  const [fid, setFid] = useState<number | null>(null);
  const [displayName, setDisplayName] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Client-side check-in helper
  async function doCheckIn(walletAddress: string, fid?: number, displayName?: string) {
    try {
      const res = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, fid, displayName }),
      });
      const json = await res.json();
      console.log("check-in response", json);
      return json;
    } catch (err) {
      console.error("check-in failed", err);
      return { ok: false, error: String(err) };
    }
  }

  // MiniKit ready setup
  useEffect(() => {
    if (!isMiniAppReady) setMiniAppReady();
  }, [isMiniAppReady, setMiniAppReady]);

  // Read MiniKit user data (FID, display name, connected wallet)
  useEffect(() => {
    const user = context?.user;

    if (user) {
      if (user.fid) setFid(user.fid);
      if (user.displayName) setDisplayName(user.displayName);
      if (user.wallet && user.wallet.address) {
        setWalletAddress(user.wallet.address);
      }
    }
  }, [context]);

  async function handleCheckIn() {
    if (!walletAddress) {
      alert("Connect wallet first.");
      return;
    }

    setLoading(true);

    const resp = await doCheckIn(walletAddress, fid || undefined, displayName);

    setResult(resp);
    setLoading(false);
  }

  return (
    <div
      style={{
        padding: 20,
        color: "white",
        textAlign: "center",
        minHeight: "100vh",
        background: "black",
      }}
    >
      {/* Wallet button */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Wallet />
      </div>

      <h1 style={{ fontSize: 34, marginTop: 20 }}>🔥 Jessepunk Daily Check-In</h1>

      {/* Show user info */}
      <div style={{ marginTop: 20, fontSize: 16, opacity: 0.7 }}>
        {fid ? (
          <>
            <p>FID: {fid}</p>
            <p>Wallet: {walletAddress}</p>
            <p>User: {displayName}</p>
          </>
        ) : (
          <p>Waiting for MiniKit user context…</p>
        )}
      </div>

      {/* Check in button */}
      <button
        onClick={handleCheckIn}
        disabled={loading}
        style={{
          marginTop: 30,
          padding: "14px 26px",
          background: "#5b3df5",
          borderRadius: 10,
          fontSize: 20,
          color: "white",
        }}
      >
        {loading ? "Checking in…" : "Daily Check-In"}
      </button>

      {/* Results */}
      {result && (
        <div
          style={{
            marginTop: 40,
            padding: 20,
            border: "1px solid #333",
            borderRadius: 12,
            background: "#111",
            textAlign: "left",
            maxWidth: 400,
            marginInline: "auto",
          }}
        >
          <h3 style={{ marginBottom: 10 }}>Result:</h3>

          <pre style={{ fontSize: 12, whiteSpace: "pre-wrap" }}>
{JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
          }
