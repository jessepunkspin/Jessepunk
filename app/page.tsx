"use client";

import { useState, useEffect } from "react";
import { Wallet } from "@coinbase/onchainkit/wallet";

export default function Home() {
  const [score, setScore] = useState(0);

  // Load score from local storage
  useEffect(() => {
    const saved = localStorage.getItem("jp_score");
    if (saved) setScore(Number(saved));
  }, []);

  // Save score automatically
  useEffect(() => {
    localStorage.setItem("jp_score", score.toString());
  }, [score]);

  const handleClick = () => {
    setScore((prev) => prev + 1);
  };

  return (
    <div
      style={{
        background: "black",
        height: "100vh",
        padding: 20,
        textAlign: "center",
        color: "white",
      }}
    >
      {/* Wallet button */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Wallet />
      </div>

      <h1 style={{ fontSize: 28, marginTop: 20 }}>
        🔥 Jessepunk Mini-Game
      </h1>

      <p>Tap the button to increase your score</p>

      <h2 style={{ fontSize: 60, marginTop: 20 }}>{score}</h2>

      <button
        onClick={handleClick}
        style={{
          marginTop: 30,
          background: "#5b3df5",
          color: "white",
          padding: "15px 30px",
          fontSize: 22,
          borderRadius: 12,
          border: "none",
        }}
      >
        +1
      </button>
    </div>
  );
}
