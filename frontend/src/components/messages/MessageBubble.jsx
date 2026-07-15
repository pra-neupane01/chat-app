import { Check, CheckCheck, Download } from "lucide-react"
import { API_BASE_URL } from "../../api/axiosInstance"
import { formatFileSize, formatMessageTime } from "../../utils/dateFormatter"

function attachmentUrlFor(message) {
  if (!message.attachmentUrl) {
    return ""
  }

  if (/^https?:\/\//i.test(message.attachmentUrl)) {
    return message.attachmentUrl
  }

  return `${API_BASE_URL.replace("/api/v1", "")}${message.attachmentUrl}`
}

function MessageStatus({ status }) {
  if (status === "READ") {
    return <CheckCheck className="text-emerald-300" size={15} />
  }

  if (status === "DELIVERED") {
    return <CheckCheck className="text-slate-400" size={15} />
  }

  return <Check className="text-slate-400" size={15} />
}

function MessageBubble({ message, own }) {
  const attachmentUrl = attachmentUrlFor(message)
  const deleted = message.deleted

  return (
    <div className={`flex ${own ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[82%] rounded-2xl px-4 py-2.5 shadow-sm sm:max-w-[68%] ${
          own
            ? "rounded-br-md bg-emerald-500 text-ink-950"
            : "rounded-bl-md bg-ink-800 text-slate-100"
        } ${deleted ? "italic opacity-80" : ""}`}
      >
        {message.messageType === "IMAGE" && attachmentUrl && !deleted ? (
          <a href={attachmentUrl} target="_blank" rel="noreferrer">
            <img
              alt={message.attachmentFileName || "Attachment"}
              className="mb-2 max-h-72 rounded-xl object-cover"
              src={attachmentUrl}
            />
          </a>
        ) : null}

        {message.messageType === "FILE" && attachmentUrl && !deleted ? (
          <a
            className={`mb-2 flex items-center gap-3 rounded-xl border px-3 py-3 ${
              own
                ? "border-ink-950/10 bg-ink-950/10"
                : "border-white/10 bg-white/5"
            }`}
            href={attachmentUrl}
            target="_blank"
            rel="noreferrer"
          >
            <Download size={18} />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">
                {message.attachmentFileName || "Download file"}
              </span>
              <span className="block text-xs opacity-75">
                {formatFileSize(message.attachmentSize)}
              </span>
            </span>
          </a>
        ) : null}

        <p className="whitespace-pre-wrap break-words text-sm leading-6">
          {deleted ? "This message was deleted." : message.content}
        </p>

        <div
          className={`mt-1 flex items-center justify-end gap-1 text-[11px] ${
            own ? "text-ink-900/70" : "text-slate-400"
          }`}
        >
          {message.edited && !deleted ? <span>edited</span> : null}
          <time>{formatMessageTime(message.sentAt)}</time>
          {own ? <MessageStatus status={message.messageStatus} /> : null}
        </div>
      </div>
    </div>
  )
}

export default MessageBubble
