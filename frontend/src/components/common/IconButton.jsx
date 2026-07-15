function IconButton({ label, icon: Icon, className = "", ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      <Icon size={18} />
    </button>
  )
}

export default IconButton
