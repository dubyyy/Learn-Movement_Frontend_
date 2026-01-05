"use client"

import { Button } from "@/components/ui/button"
import { ConnectButton } from "@/components/wallet-provider"
import { CheckCircle2, Copy, XCircle } from "lucide-react"


interface HeaderProps {
  isConnected: boolean
  onDisconnect: () => void | Promise<void>
  walletAddress?: string | null
}

export function Header({ isConnected, onDisconnect, walletAddress }: HeaderProps) {
  const shortAddress = walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-6)}` : null

  const handleCopyAddress = async () => {
    if (!walletAddress) return
    try {
      await navigator.clipboard.writeText(walletAddress)
    } catch {
      // ignore
    }
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-3 sm:px-6 py-2 sm:py-3 gap-2 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-primary to-accent rounded flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs sm:text-sm">MV</span>
            </div>
            <h1 className="text-base sm:text-lg font-semibold">
              <span className="text-foreground">LEARN</span>
              <span className="text-yellow-400">MOVEMENT</span>
            </h1>
          </div>
          <span className="text-[10px] sm:text-xs text-muted-foreground px-1.5 sm:px-2 py-0.5 sm:py-1 bg-secondary rounded">Testnet</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
          <div
            className={`inline-flex items-center gap-1 sm:gap-2 px-1.5 sm:px-2 py-1 rounded text-[10px] sm:text-xs border ${
              isConnected
                ? "bg-secondary text-white border-border"
                : "bg-card text-white border-border"
            }`}
          >
            {isConnected ? (
              <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-success" />
            ) : (
              <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
            )}
            <span className="hidden xs:inline">{isConnected ? "Connected" : "Disconnected"}</span>
            {isConnected && shortAddress && (
              <span className="font-mono text-[10px] sm:text-xs text-muted-foreground">{shortAddress}</span>
            )}
            {isConnected && walletAddress && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="h-6 w-6 sm:h-7 sm:w-7"
                onClick={handleCopyAddress}
                aria-label="Copy wallet address"
                title="Copy address"
              >
                <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            )}
          </div>

          {isConnected ? (
            <Button onClick={onDisconnect} variant="secondary" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
              Disconnect
            </Button>
          ) : (
            <div className="flex items-center justify-center bg-yellow-400 rounded-full h-7 sm:h-8 px-1">
              <ConnectButton>Connect Wallet</ConnectButton>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
