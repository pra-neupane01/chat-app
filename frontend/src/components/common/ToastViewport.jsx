import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react"
import { useToast } from "../../hooks/useToast"

const toneStyles = {
  error: {
    icon: AlertTriangle,
    className: "border-red-500/30 bg-red-500/15 text-red-50",
  },
  success: {
    icon: CheckCircle2,
    className: "border-emerald-500/30 bg-emerald-500/15 text-emerald-50",
  },
  info: {
    icon: Info,
    className: "border-white/10 bg-ink-800 text-slate-100",
  },
}

function ToastViewport() {
  const { dismissToast, toasts } = useToast()

  if (toasts.length === 0) {
    return null
  }

  return (
    <div className="fixed right-4 top-4 z-[90] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
      {toasts.map((toast) => {
        const style = toneStyles[toast.tone] || toneStyles.info
        const Icon = style.icon

        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 rounded-xl border p-4 shadow-soft ${style.className}`}
            role={toast.tone === "error" ? "alert" : "status"}
          >
            <Icon className="mt-0.5 shrink-0" size={18} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{toast.title}</p>
              <p className="mt-1 text-sm opacity-85">{toast.message}</p>
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              className="rounded-md p-1 opacity-70 transition hover:bg-white/10 hover:opacity-100"
              onClick={() => dismissToast(toast.id)}
            >
              <X size={16} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default ToastViewport
