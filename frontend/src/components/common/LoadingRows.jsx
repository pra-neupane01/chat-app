function LoadingRows({ count = 5 }) {
  return (
    <div className="space-y-3 px-3 py-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          className="flex animate-pulse items-center gap-3 rounded-xl px-2 py-2"
          key={index}
        >
          <div className="h-11 w-11 rounded-2xl bg-white/10" />
          <div className="min-w-0 flex-1">
            <div className="h-3 w-2/5 rounded bg-white/10" />
            <div className="mt-3 h-3 w-4/5 rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default LoadingRows
