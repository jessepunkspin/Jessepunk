// /app/api/post/route.ts
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { ethers } from "ethers";

/**
 * Server-side daily check-in handler
 *
 * - Reads incoming { walletAddress, fid, displayName? }
 * - Checks ERC20 balance on Base
 * - Calculates tier & bonus XP
 * - Persists a small record to disk (MVP; replace with a real DB later)
 * - Optionally publishes a Farcaster cast via Neynar (if NEYNAR_API_KEY + SIGNER_UUID set)
 */

// Minimal ERC20 ABI
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

const CREATOR_TOKEN_ADDRESS =
  process.env.CREATOR_TOKEN_ADDRESS || "0x1a4415993eb75ce59c200989abc4201771307cb5";

const BASE_RPC_URL = process.env.BASE_RPC_URL || "https://mainnet.base.org";
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
const NEYNAR_SIGNER_UUID = process.env.NEYNAR_SIGNER_UUID;
const STORAGE_PATH = process.env.STORAGE_PATH || path.resolve(".data", "streaks.json");

// Ensure folder exists and file exists (helper)
async function ensureStorage() {
  try {
    await fs.mkdir(path.dirname(STORAGE_PATH), { recursive: true });
    try {
      await fs.access(STORAGE_PATH);
    } catch {
      await fs.writeFile(STORAGE_PATH, JSON.stringify({ users: {} }, null, 2), "utf8");
    }
  } catch (err) {
    console.error("storage init error:", err);
  }
}

async function readStorage() {
  try {
    const raw = await fs.readFile(STORAGE_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return { users: {} };
  }
}

async function writeStorage(obj: any) {
  await fs.writeFile(STORAGE_PATH, JSON.stringify(obj, null, 2), "utf8");
}

function tierForBalance(balanceFloat: number) {
  if (balanceFloat >= 500) return { name: "Legend", bonusXP: 100 };
  if (balanceFloat >= 100) return { name: "VIP", bonusXP: 50 };
  if (balanceFloat >= 10) return { name: "Holder", bonusXP: 50 };
  if (balanceFloat >= 1) return { name: "Supporter", bonusXP: 10 };
  return { name: "None", bonusXP: 0 };
}

async function postToNeynar(text: string, fid?: number) {
  if (!NEYNAR_API_KEY || !NEYNAR_SIGNER_UUID) {
    console.log("Neynar not configured; skipping cast.");
    return { ok: false, reason: "no-key" };
  }

  const url = "https://api.neynar.com/v1/casts"; // docs reference this path
  const body = {
    signerUuid: NEYNAR_SIGNER_UUID,
    text,
    // optionally include other fields (replyTo, embed, etc.)
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": NEYNAR_API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const t = await res.text();
    console.error("neynar publish error:", res.status, t);
    return { ok: false, status: res.status, text: t };
  }

  const json = await res.json();
  return { ok: true, res: json };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Required fields
    const walletAddress = (body.walletAddress || "").toString().trim();
    const fid = body.fid ? Number(body.fid) : undefined;
    const displayName = body.displayName || "";

    if (!walletAddress || !ethers.utils.isAddress(walletAddress)) {
      return NextResponse.json({ ok: false, error: "invalid wallet address" }, { status: 400 });
    }

    // Setup provider + contract
    const provider = new ethers.providers.JsonRpcProvider(BASE_RPC_URL);
    const token = new ethers.Contract(CREATOR_TOKEN_ADDRESS, ERC20_ABI, provider);

    // Read decimals & balance
    const [rawBalance, decimals] = await Promise.all([
      token.balanceOf(walletAddress),
      // decimals may fail on some tokens; default to 18 on error
      token.decimals().catch(() => 18),
    ]);

    const balanceFloat = Number(ethers.utils.formatUnits(rawBalance, decimals));

    // choose tier
    const tier = tierForBalance(balanceFloat);

    // Persist simple streaks + xp
    await ensureStorage();
    const storage = await readStorage();

    const id = walletAddress.toLowerCase();
    const now = new Date().toISOString();

    storage.users = storage.users || {};
    const user = storage.users[id] || {
      wallet: walletAddress,
      fid: fid || null,
      lastCheckIn: null,
      streak: 0,
      xp: 0,
      tier: "None",
    };

    // daily reset logic - naive: check lastCheckIn date string
    const last = user.lastCheckIn ? new Date(user.lastCheckIn) : null;
    const today = new Date();
    const isSameDay = last && last.toDateString() === today.toDateString();

    if (!isSameDay) {
      // increment streak (if yesterday was lastCheckIn then streak+1, else reset)
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const wasYesterday =
        last && last.toDateString() === yesterday.toDateString() ? true : false;

      user.streak = wasYesterday ? (user.streak || 0) + 1 : 1;
      user.lastCheckIn = now;
      const gainedXP = 10 + tier.bonusXP; // base 10 + holder bonus
      user.xp = (user.xp || 0) + gainedXP;
      user.tier = tier.name;
      user.lastBalance = balanceFloat;

      storage.users[id] = user;
      await writeStorage(storage);

      // Compose a cast text
      const castText = `${displayName || walletAddress} checked in on Jessepunk MiniApp — Tier: ${tier.name} (+${tier.bonusXP} XP). Streak: ${user.streak}. 🎮`;

      // Try to publish a cast (best-effort)
      const neynarResp = await postToNeynar(castText, fid);

      return NextResponse.json({
        ok: true,
        result: {
          checked: true,
          streak: user.streak,
          gainedXP: 10 + tier.bonusXP,
          tier,
          balance: balanceFloat,
          neynar: neynarResp,
        },
      });
    }

    // Already checked-in today
    return NextResponse.json({
      ok: true,
      result: {
        checked: false,
        message: "Already checked in today",
        streak: user.streak,
        tier,
        balance: balanceFloat,
      },
    });
  } catch (err) {
    console.error("❌ POST /api/post error:", err);
    return NextResponse.json({ ok: false, error: "internal error" }, { status: 500 });
  }
                                                }
