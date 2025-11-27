"use client";

import { useState, useEffect } from "react";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { useMiniKit } from "@coinbase/onchainkit/minikit";

// Format today as YYYY-M-D
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

  // =============================
  // MiniKit Initialization
  // =============================
  useEffect(() => {
    if (!isMiniAppReady) {
      setMiniAppReady();
    }
  }, [setMiniAppReady, isMiniAppReady]);

  // =============================
  // Load saved score + checkin state
  // =============================
  useEffect(() => {
    const savedScore = localStorage.getItem("jp_score");
    const savedDay = localStorage.getItem("jp_checkin_day");
    const savedChecked = localStorage.getItem("jp_checked_in");

    const currentDay = getToday();
    setToday(currentDay);

    // Restore score
    if (savedScore) setScore(Number(savedScore));

    // Reset check-in if new day
    if (savedDay !== currentDay) {
      localStorage.setItem("jp_checkin_day", currentDay);
      localStorage.setItem("jp_checked_in", "no");
      setCheckedIn(false);
    } else {
      setCheckedIn(savedChecked === "yes");
    }
  }, []);

  // =============================
  // Save score automatically
  // =============================
  useEffect(() => {
    localStorage.setItem("jp_score", String(score));
  }, [score]);

  // =============================
  // Tap Button (with animation)
  // =============================
  const increaseScore = () => {
    setAnimate(true);
    setTimeout(() => setAnimate(false), 120);
    setScore((prev) => prev + 1);
  };

  // =============================
  // Daily Check-In Logic
  // =============================
  const handleCheckIn = async () => {
    if (checkedIn) return;

    try {
      // auto-post placeholder
      await fetch("/api/post", {
        method: "POST",
        body: JSON.stringify({
          action: "checkin",
          date: today,
        }),
      });
    } catch (err) {
      console.log("Post route not configured yet.");
    }

    setCheckedIn(true);
    localStorage.setItem("jp_checked_in", "yes");
    localStorage.setItem("jp_checkin_day", today);
  };

  // =============================
  // UI
  // =============================
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "black",
        color: "white",
        textAlign: "center",
        padding: 20,
      }}
    >
      {/* Wallet Connect */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Wallet />
      </div>

      <h1 style={{ marginTop: 20, fontSize: 28 }}>🔥 Jessepunk Mini-Game</h1>
      <p style={{ opacity: 0.8 }}>Earn points daily and check in once per day.</p>

      {/* Score */}
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

      {/* Score Button */}
      <button
        onClick={increaseScore}
        style={{
          background: "#5b3df5",
          padding: "16px 40px",
          borderRadius: 12,
          fontSize: 22,
          border: "none",
          marginTop: 25,
          color: "white",
        }}
      >
        +1
      </button>

      {/* Check In Button */}
      <div style={{ marginTop: 40 }}>
        <button
          onClick={handleCheckIn}
          disabled={checkedIn}
          style={{
            background: checkedIn ? "#555" : "#ffaa00",
            padding: "16px 35px",
            borderRadius: 12,
            fontSize: 20,
            border: "none",
            color: checkedIn ? "#aaa" : "black",
            fontWeight: "700",
          }}
        >
          {checkedIn ? "Checked In ✓" : "Daily Check-In"}
        </button>

        <p style={{ marginTop: 10, fontSize: 13, opacity: 0.7 }}>
          Today: {today}
        </p>
      </div>
    </div>
  );
}
