import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("Incoming auto-post:", body);

    // You will integrate real Farcaster post here
    // For now, just return success so the app does not crash
    return NextResponse.json({ status: "ok", message: "Auto-post accepted." });
  } catch (err) {
    console.error("POST error:", err);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
