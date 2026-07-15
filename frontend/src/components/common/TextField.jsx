import { AlertCircle } from "lucide-react"

function TextField({
  id,
  label,
  error,
  className = "",
  type = "text",
  ...props
}) {
  return (
    <label className={`block ${className}`} htmlFor={id}>
      <span className="mb-2 block text-sm font-medium text-slate-200">
        {label}
      </span>
      <input
        id={id}
        type={type}
        className={`w-full rounded-lg border bg-ink-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 ${
          error ? "border-red-400/80" : "border-white/10"
        }`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error ? (
        <span
          id={`${id}-error`}
          className="mt-2 flex items-center gap-2 text-sm text-red-300"
        >
          <AlertCircle size={15} />
          {error}
        </span>
      ) : null}
    </label>
  )
}

export default TextField
