"use client";

import { useState, useEffect } from "react";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { useMiniKit } from "@coinbase/onchainkit/minikit";

export default function Home() {
  const [score, setScore] = useState(0);
  const { setMiniAppReady, isMiniAppReady } = useMiniKit();

  // Required for MiniApp to load
  useEffect(() => {
    if (!isMiniAppReady) {
      setMiniAppReady();
    }
  }, [setMiniAppReady, isMiniAppReady]);

  return (
    <div
      style={{
        padding: 20,
        minHeight: "100vh",
        background: "black",
        textAlign: "center",
        color: "white",
      }}
    >
      {/* Wallet button */}
      <header style={{ display: "flex", justifyContent: "flex-end" }}>
        <Wallet />
      </header>

      <h1 style={{ fontSize: 32, marginTop: 20 }}>🔥 Jessepunk Mini-Game</h1>
      <p style={{ opacity: 0.8 }}>Tap the button to increase your score</p>

      {/* Score with pop animation */}
      <h2
        style={{
          fontSize: 60,
          margin: "30px 0",
          transition: "transform 0.15s ease",
          transform: score > 0 ? "scale(1.15)" : "scale(1)",
        }}
      >
        {score}
      </h2>

      {/* Tap Button */}
      <button
        style={{
          marginTop: 20,
          background: "#5b3df5",
          color: "white",
          padding: "18px 40px",
          fontSize: 24,
          borderRadius: 14,
          border: "none",
        }}
        onClick={() => {
          setScore(score + 1);

          // Reset animation after 150ms
          setTimeout(() => {
            // nothing needed, React re-renders automatically
          }, 150);
        }}
      >
        +1
      </button>
    </div>
  );
      }
