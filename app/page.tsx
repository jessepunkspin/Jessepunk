"use client";
import { useState, useEffect } from "react";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { useMiniKit } from "@coinbase/onchainkit/minikit";

export default function Home() {
  const { setMiniAppReady, isMiniAppReady } = useMiniKit();
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!isMiniAppReady) setMiniAppReady();
  }, [isMiniAppReady, setMiniAppReady]);

  return (
    <div
      style={{
        padding: 20,
        textAlign: "center",
        color: "white",
        background: "#000",
        minHeight: "100vh",
      }}
    >
      <header style={{ marginBottom: 20 }}>
        <Wallet />
      </header>

      <h1 style={{ fontSize: 32, marginBottom: 10 }}>🔥 Jessepunk Mini-Game</h1>
      <p>Tap to increase your score</p>

      <h2 style={{ fontSize: 50, margin: "20px 0" }}>{score}</h2>

      <button
        style={{
          marginTop: 20,
          background: "#5b3df5",
          color: "white",
          padding: "15px 30px",
          fontSize: 24,
          borderRadius: 12,
        }}
        onClick={() => setScore(score + 1)}
      >
        +1
      </button>
    </div>
  );
    }
