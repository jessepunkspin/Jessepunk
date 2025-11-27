"use client";

import { ReactNode } from "react";
import {
  OnchainKitProvider,
  createOnchainKitClient,
} from "@coinbase/onchainkit";
import { base } from "wagmi/chains";
import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@coinbase/onchainkit/styles.css";

// Wagmi client (required)
const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
});

// React Query (required by OnchainKit)
const queryClient = new QueryClient();

// OnchainKit client
const okClient = createOnchainKitClient({
  apiKey: process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY!,
  chain: base,
});

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          client={okClient}
          config={{
            appearance: {
              mode: "auto",
            },
            wallet: {
              display: "modal",
              preference: "all",
            },
          }}
          miniKit={{
            enabled: true,
            autoConnect: true,
            notificationProxyUrl: "/api/minikit/notifications",
          }}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
