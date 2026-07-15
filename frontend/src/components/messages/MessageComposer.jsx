import { useCallback, useEffect, useRef, useState } from "react"
import { Paperclip, Send } from "lucide-react"

function MessageComposer({ connected, onSend, onTyping }) {
  const [content, setContent] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const typingActiveRef = useRef(false)
  const typingStopTimerRef = useRef(null)

  const clearTypingTimer = useCallback(() => {
    if (typingStopTimerRef.current) {
      window.clearTimeout(typingStopTimerRef.current)
      typingStopTimerRef.current = null
    }
  }, [])

  const stopTyping = useCallback(() => {
    clearTypingTimer()

    if (typingActiveRef.current) {
      typingActiveRef.current = false
      onTyping(false)
    }
  }, [clearTypingTimer, onTyping])

  function handleChange(event) {
    const nextContent = event.target.value
    setContent(nextContent)
    setError("")

    if (nextContent.trim()) {
      if (!typingActiveRef.current) {
        typingActiveRef.current = true
        onTyping(true)
      }

      clearTypingTimer()
      typingStopTimerRef.current = window.setTimeout(stopTyping, 1200)
    } else {
      stopTyping()
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmedContent = content.trim()

    if (!trimmedContent || sending || !connected) {
      return
    }

    setSending(true)
    setError("")

    try {
      await onSend(trimmedContent)
      setContent("")
      stopTyping()
    } catch (sendError) {
      setError(sendError.message || "Could not send message")
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      handleSubmit(event)
    }
  }

  useEffect(() => {
    return () => stopTyping()
  }, [stopTyping])

  return (
    <form
      className="shrink-0 border-t border-white/10 bg-ink-900 px-3 py-3"
      onSubmit={handleSubmit}
    >
      {error ? (
        <div className="mb-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <div className="flex items-end gap-2">
        <button
          type="button"
          className="mb-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          disabled
          title="Attachments are added in the next feature slice"
          aria-label="Add attachment"
        >
          <Paperclip size={18} />
        </button>

        <textarea
          className="max-h-36 min-h-11 flex-1 resize-none rounded-xl border border-white/10 bg-ink-950 px-4 py-3 text-sm leading-5 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
          disabled={!connected}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={
            connected ? "Write a message" : "Reconnect to send messages"
          }
          rows={1}
          value={content}
        />

        <button
          type="submit"
          disabled={!connected || sending || !content.trim()}
          className="mb-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-400 text-ink-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </div>
    </form>
  )
}

export default MessageComposer
