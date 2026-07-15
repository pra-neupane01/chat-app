import { useState } from "react"
import {
  Check,
  CheckCheck,
  Download,
  MoreVertical,
  Pencil,
  Trash2,
  X,
} from "lucide-react"
import { formatFileSize, formatMessageTime } from "../../utils/dateFormatter"
import { getAttachmentUrl } from "../../utils/messageUtils"

function MessageStatus({ status }) {
  if (status === "READ") {
    return <CheckCheck className="text-emerald-300" size={15} />
  }

  if (status === "DELIVERED") {
    return <CheckCheck className="text-slate-400" size={15} />
  }

  return <Check className="text-slate-400" size={15} />
}

function MessageBubble({
  message,
  onDeleteMessage,
  onEditMessage,
  onPreviewImage,
  own,
}) {
  const attachmentUrl = getAttachmentUrl(message)
  const deleted = message.deleted
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(message.content || "")
  const [saving, setSaving] = useState(false)
  const canEdit = own && !deleted && message.messageType === "TEXT"
  const canDelete = own && !deleted

  async function handleEditSubmit(event) {
    event.preventDefault()
    const trimmedDraft = draft.trim()

    if (!trimmedDraft || trimmedDraft === message.content || saving) {
      setEditing(false)
      return
    }

    setSaving(true)

    try {
      await onEditMessage(message, trimmedDraft)
      setEditing(false)
      setMenuOpen(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`flex ${own ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[82%] rounded-2xl px-4 py-2.5 shadow-sm sm:max-w-[68%] ${
          own
            ? "rounded-br-md bg-emerald-500 text-ink-950"
            : "rounded-bl-md bg-ink-800 text-slate-100"
        } ${deleted ? "italic opacity-80" : ""}`}
      >
        <div className="relative">
          {canDelete ? (
            <button
              type="button"
              className={`absolute -top-1 ${
                own ? "-left-9" : "-right-9"
              } rounded-lg p-1.5 text-slate-400 opacity-80 transition hover:bg-white/10 hover:text-white`}
              onClick={() => setMenuOpen((current) => !current)}
              aria-label="Message actions"
            >
              <MoreVertical size={16} />
            </button>
          ) : null}

          {menuOpen ? (
            <div
              className={`absolute top-7 z-10 min-w-[8rem] rounded-lg border border-white/10 bg-ink-900 p-1 text-sm shadow-soft ${
                own ? "right-full mr-1" : "left-full ml-1"
              }`}
            >
              {canEdit ? (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-slate-200 hover:bg-white/10"
                  onClick={() => {
                    setEditing(true)
                    setMenuOpen(false)
                  }}
                >
                  <Pencil size={15} />
                  Edit
                </button>
              ) : null}
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-red-200 hover:bg-red-500/10"
                onClick={() => {
                  setMenuOpen(false)
                  onDeleteMessage(message)
                }}
              >
                <Trash2 size={15} />
                Delete
              </button>
            </div>
          ) : null}
        </div>

        {editing ? (
          <form className="space-y-2" onSubmit={handleEditSubmit}>
            <textarea
              className="min-h-20 w-full resize-none rounded-lg border border-ink-950/20 bg-white/90 px-3 py-2 text-sm text-ink-950 outline-none focus:ring-2 focus:ring-emerald-200"
              onChange={(event) => setDraft(event.target.value)}
              value={draft}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setDraft(message.content || "")
                  setEditing(false)
                }}
                className="inline-flex items-center gap-1 rounded-md border border-ink-950/10 px-2 py-1 text-xs font-semibold"
              >
                <X size={13} />
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !draft.trim()}
                className="rounded-md bg-ink-950 px-2 py-1 text-xs font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        ) : null}

        {!editing && message.messageType === "IMAGE" && attachmentUrl && !deleted ? (
          <button
            type="button"
            className="block text-left"
            onClick={() => onPreviewImage(message)}
          >
            <img
              alt={message.attachmentFileName || "Attachment"}
              className="mb-2 max-h-72 rounded-xl object-cover"
              src={attachmentUrl}
            />
          </button>
        ) : null}

        {!editing && message.messageType === "FILE" && attachmentUrl && !deleted ? (
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

        {!editing ? (
          <p className="whitespace-pre-wrap break-words text-sm leading-6">
            {deleted ? "This message was deleted." : message.content}
          </p>
        ) : null}

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
