import { Download, X } from "lucide-react"
import { getAttachmentUrl } from "../../utils/messageUtils"

function ImagePreviewModal({ message, onClose }) {
  if (!message) {
    return null
  }

  const imageUrl = getAttachmentUrl(message)

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-black/90 text-white">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {message.attachmentFileName || "Image"}
          </p>
          <p className="text-xs text-slate-400">{message.attachmentContentType}</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-slate-200 transition hover:bg-white/10"
            href={imageUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Download image"
          >
            <Download size={18} />
          </a>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-slate-200 transition hover:bg-white/10"
            onClick={onClose}
            aria-label="Close image preview"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 items-center justify-center p-4">
        <img
          alt={message.attachmentFileName || "Image preview"}
          className="max-h-full max-w-full rounded-xl object-contain"
          src={imageUrl}
        />
      </div>
    </div>
  )
}

export default ImagePreviewModal
