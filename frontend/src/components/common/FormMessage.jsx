import { AlertTriangle, CheckCircle2 } from "lucide-react"

function FormMessage({ children, tone = "error" }) {
  if (!children) {
    return null
  }

  const isError = tone === "error"
  const Icon = isError ? AlertTriangle : CheckCircle2

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${
        isError
          ? "border-red-500/30 bg-red-500/10 text-red-100"
          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
      }`}
      role={isError ? "alert" : "status"}
    >
      <Icon className="mt-0.5 shrink-0" size={17} />
      <span>{children}</span>
    </div>
  )
}

export default FormMessage
