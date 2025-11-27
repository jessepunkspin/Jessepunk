const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
  "http://localhost:3000";

/**
 * MiniApp Manifest (Base + Farcaster compliant)
 * Everything below follows the official MiniKit spec.
 */
export const minikitConfig = {
  version: "1",

  miniapp: {
    version: "1.0.0",
    id: "jessepunk-miniapp",
    name: "Jessepunk Mini-Game",
    subtitle: "Daily check-in game",
    description: "A simple daily-tap game that rewards active users.",
    tagline: "Stay active, get rewarded.",
    
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#000000",
    heroImageUrl: `${ROOT_URL}/hero.png`,

    screenshotUrls: [
      `${ROOT_URL}/screenshot.png`
    ],

    primaryCategory: "utility",
    tags: ["game", "miniapp", "jessepunk"],

    homeUrl: ROOT_URL,  // Your Vercel domain after deploy
    webhookUrl: `${ROOT_URL}/api/webhook`,

    ogTitle: "Jessepunk Mini-Game",
    ogDescription: "Tap daily, increase your score, and unlock rewards.",
    ogImageUrl: `${ROOT_URL}/hero.png`,

    button: {
      title: "Launch Jessepunk Game",
      action: {
        type: "launch_miniapp",
        name: "Launch Jessepunk Mini-Game"
      }
    }
  },

  // Optional but valid
  accountAssociation: {
    header: "",
    payload: "",
    signature: "",
  },

  baseBuilder: {
    ownerAddress: "",
  },
} as const;
