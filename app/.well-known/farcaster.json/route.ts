import { withValidManifest } from "@coinbase/onchainkit/minikit";
import { minikitConfig } from "../../../minikit.config";

export const dynamic = "force-static"; // ensure static manifest cache

export async function GET() {
  const manifest = withValidManifest(minikitConfig);

  return new Response(JSON.stringify(manifest), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=86400"
    },
  });
}
