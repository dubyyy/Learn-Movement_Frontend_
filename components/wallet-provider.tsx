"use client"

import dynamic from "next/dynamic"
import { PropsWithChildren, createContext, useContext, useState, useEffect } from "react"

// Context to hold razorkit exports once loaded
const RazorkitContext = createContext<any>(null)

// Inner component that will be rendered inside the dynamic provider
function RazorkitInner({ children }: PropsWithChildren) {
  const [razorkit, setRazorkit] = useState<any>(null)

  useEffect(() => {
    import("@razorlabs/razorkit").then((mod) => {
      // Import CSS on client side
      import("@razorlabs/razorkit/style.css")
      setRazorkit(mod)
    })
  }, [])

  if (!razorkit) {
    return <>{children}</>
  }

  const { WalletProvider: RazorWalletProvider } = razorkit

  return (
    <RazorkitContext.Provider value={razorkit}>
      <RazorWalletProvider>
        {children}
      </RazorWalletProvider>
    </RazorkitContext.Provider>
  )
}

// Main provider - uses dynamic to prevent SSR
const DynamicRazorkitInner = dynamic(() => Promise.resolve(RazorkitInner), { ssr: false })

export function WalletProvider({ children }: PropsWithChildren) {
  return <DynamicRazorkitInner>{children}</DynamicRazorkitInner>
}

// Hook to access wallet - returns empty state during SSR or before razorkit loads
export function useWallet() {
  const razorkit = useContext(RazorkitContext)
  
  if (!razorkit) {
    return {
      address: null,
      connected: false,
      disconnect: async () => {},
      signAndSubmitTransaction: async () => ({}),
    }
  }
  
  return razorkit.useWallet()
}

// Dynamic ConnectButton component
export const ConnectButton = dynamic(
  () => import("@razorlabs/razorkit").then((mod) => mod.ConnectButton),
  { ssr: false }
)
