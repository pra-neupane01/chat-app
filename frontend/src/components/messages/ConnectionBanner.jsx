import { Loader2, WifiOff } from "lucide-react"

function ConnectionBanner({ connectionState, lastError }) {
  if (connectionState === "connected") {
    return null
  }

  const connecting = connectionState === "connecting"

  return (
    <div className="flex items-center justify-center gap-2 border-b border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm text-amber-100">
      {connecting ? (
        <Loader2 className="animate-spin" size={16} />
      ) : (
        <WifiOff size={16} />
      )}
      <span>
        {connecting
          ? "Connecting to realtime chat..."
          : lastError || "Realtime chat is disconnected. Reconnecting..."}
      </span>
    </div>
  )
}

export default ConnectionBanner
