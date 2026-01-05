"use client"

import dynamic from "next/dynamic"
import { PropsWithChildren, createContext, useContext } from "react"

const RazorWalletProvider = dynamic(
  () => import("@razorlabs/razorkit").then((mod) => {
    require("@razorlabs/razorkit/style.css")
    return mod.WalletProvider
  }),
  { ssr: false }
)

export function WalletProvider({ children }: PropsWithChildren) {
  return (
    <RazorWalletProvider>
      {children}
    </RazorWalletProvider>
  )
}

// Re-export hooks and components with dynamic loading for SSR safety
export const useWallet = () => {
  // Return empty wallet state during SSR
  if (typeof window === "undefined") {
    return {
      address: null,
      connected: false,
      disconnect: async () => {},
      signAndSubmitTransaction: async () => ({}),
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const razorkit = require("@razorlabs/razorkit")
  return razorkit.useWallet()
}

export const ConnectButton = dynamic(
  () => import("@razorlabs/razorkit").then((mod) => mod.ConnectButton),
  { ssr: false }
)
