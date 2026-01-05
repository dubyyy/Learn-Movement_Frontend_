"use client"

import { Button } from "@/components/ui/button"
import { Play, Upload, Trash2, Loader2 } from "lucide-react"

interface ToolbarProps {
  onCompile: () => void
  onDeploy: () => void
  onClearConsole: () => void
  isCompiling: boolean
  isDeploying: boolean
  isConnected: boolean
  isCompiled?: boolean
}

export function Toolbar({ onCompile, onDeploy, onClearConsole, isCompiling, isDeploying, isConnected, isCompiled }: ToolbarProps) {
  return (
    <div className="border-b border-border bg-card">
      <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-1.5 sm:py-2">
        <Button onClick={onCompile} disabled={isCompiling} variant="default" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
          {isCompiling ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          <span className="hidden xs:inline">Compile</span>
        </Button>

        <Button
          onClick={onDeploy}
          disabled={isDeploying || !isConnected || !isCompiled}
          title={!isCompiled ? 'Compile the project before deploying' : undefined}
          variant="secondary"
          size="sm"
          className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
        >
          {isDeploying ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          <span className="hidden xs:inline">Deploy</span>
        </Button>

        <div className="flex-1" />

        <Button onClick={onClearConsole} variant="ghost" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Clear</span>
        </Button>
      </div>
    </div>
  )
}
