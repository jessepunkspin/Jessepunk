"use client";

import { useState, useEffect } from "react";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { useMiniKit } from "@coinbase/onchainkit/minikit";

// FIXED: no more crashing date function
const getToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

export default function Home() {
  const { setMiniAppReady, isMiniAppReady } = useMiniKit();

  const [score, setScore] = useState(0);
  const [checkedIn, setCheckedIn] = useState(false);
  const [today, setToday] = useState(getToday());
  const [animate, setAnimate] = useState(false);

  // Mark MiniApp ready
  useEffect(() => {
    if (!isMiniAppReady) setMiniAppReady();
  }, [isMiniAppReady, setMiniAppReady]);

  // Load saved state
  useEffect(() => {
    const savedScore = localStorage.getItem("jp_score");
    const savedDay = localStorage.getItem("jp_checkin_day");
    const savedChecked = localStorage.getItem("jp_checked_in");

    const currentDay = getToday();
    setToday(currentDay);

    if (savedScore) setScore(Number(savedScore));

    // If new day → reset check-in
    if (savedDay !== currentDay) {
      localStorage.setItem("jp_checkin_day", currentDay);
      localStorage.setItem("jp_checked_in", "no");
      setCheckedIn(false);
    } else {
      setCheckedIn(savedChecked === "yes");
    }
  }, []);

  // Save score
  useEffect(() => {
    localStorage.setItem("jp_score", String(score));
  }, [score]);

  const increaseScore = () => {
    setAnimate(true);
    setTimeout(() => setAnimate(false), 120);
    setScore((prev) => prev + 1);
  };

  // Daily check-in
  const handleCheckIn = async () => {
    if (checkedIn) return;

    try {
      await fetch("/api/post", {
        method: "POST",
        body: JSON.stringify({
          action: "daily_checkin",
          date: today,
          score,
        }),
      });
    } catch (e) {
      console.log("Post failed (not configured).");
    }

    setCheckedIn(true);
    localStorage.setItem("jp_checked_in", "yes");
    localStorage.setItem("jp_checkin_day", today);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "black",
        color: "white",
        padding: 20,
        textAlign: "center",
      }}
    >
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Wallet />
      </div>

      <h1 style={{ marginTop: 20, fontSize: 28 }}>🔥 Jessepunk Mini-Game</h1>

      <h2
        style={{
          fontSize: 60,
          marginTop: 30,
          transition: "transform 0.12s ease",
          transform: animate ? "scale(1.18)" : "scale(1)",
        }}
      >
        {score}
      </h2>

      <button
        onClick={increaseScore}
        style={{
          background: "#5b3df5",
          padding: "16px 40px",
          color: "white",
          borderRadius: 12,
          border: "none",
          fontSize: 22,
          marginTop: 25,
        }}
      >
        +1
      </button>

      <div style={{ marginTop: 40 }}>
        <button
          onClick={handleCheckIn}
          disabled={checkedIn}
          style={{
            background: checkedIn ? "#666" : "#ffaa00",
            padding: "14px 32px",
            borderRadius: 12,
            border: "none",
            fontSize: 20,
            color: checkedIn ? "#aaa" : "black",
            fontWeight: "700",
          }}
        >
          {checkedIn ? "Checked In ✓" : "Daily Check-In"}
        </button>

        <p style={{ marginTop: 10, opacity: 0.7 }}>Today: {today}</p>
      </div>
    </div>
  );
}
