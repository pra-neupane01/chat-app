function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex h-full items-center justify-center px-6 py-12 text-center">
      <div className="max-w-sm">
        {Icon ? (
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-emerald-300">
            <Icon size={28} />
          </div>
        ) : null}
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {description ? (
          <p className="mt-3 text-sm leading-6 text-slate-400">
            {description}
          </p>
        ) : null}
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    </div>
  )
}

export default EmptyState
