import { formatDateDivider } from "../../utils/dateFormatter"

function DateDivider({ value }) {
  return (
    <div className="my-5 flex items-center gap-3">
      <div className="h-px flex-1 bg-white/10" />
      <time className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-400">
        {formatDateDivider(value)}
      </time>
      <div className="h-px flex-1 bg-white/10" />
    </div>
  )
}

export default DateDivider
