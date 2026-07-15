import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { Loader2, MessageSquare } from "lucide-react"
import { getApiError } from "../../api/axiosInstance"
import {
  deleteMessage,
  editMessage,
  getConversationHistoryBefore,
  markConversationAsRead,
  uploadAttachment,
} from "../../api/messageApi"
import { useAuth } from "../../hooks/useAuth"
import {
  applyReadReceipt,
  markMessagesDeleted,
  mergeMessages,
} from "../../utils/messageUtils"
import EmptyState from "../common/EmptyState"
import ConfirmDialog from "../common/ConfirmDialog"
import DateDivider from "./DateDivider"
import MessageBubble from "./MessageBubble"
import MessageComposer from "./MessageComposer"
import ImagePreviewModal from "./ImagePreviewModal"

function normalizeCursorPage(page) {
  return {
    content: page?.content || [],
    hasMore: Boolean(page?.hasMore),
    nextCursor: page?.nextCursor || null,
  }
}

function nearBottom(element) {
  if (!element) {
    return true
  }

  return element.scrollHeight - element.scrollTop - element.clientHeight < 140
}

function shouldShowDateDivider(previousMessage, message) {
  if (!previousMessage) {
    return true
  }

  return (
    new Date(previousMessage.sentAt).toDateString() !==
    new Date(message.sentAt).toDateString()
  )
}

function createPendingTextMessage({ content, conversation, user }) {
  return {
    id: `pending-${crypto.randomUUID()}`,
    conversationId: conversation.id,
    senderId: user.id,
    senderName: user.fullName,
    receiverId: conversation.otherUser.id,
    content,
    messageType: "TEXT",
    messageStatus: "SENT",
    sentAt: new Date().toISOString(),
    pending: true,
  }
}

function removeMatchingPendingMessage(messages, incomingMessage, userId) {
  if (incomingMessage.senderId !== userId) {
    return messages
  }

  const incomingTime = new Date(incomingMessage.sentAt).getTime()
  const matchingPending = messages.find((message) => {
    if (!message.pending) {
      return false
    }

    const pendingTime = new Date(message.sentAt).getTime()

    return (
      message.conversationId === incomingMessage.conversationId &&
      message.receiverId === incomingMessage.receiverId &&
      message.content === incomingMessage.content &&
      message.messageType === incomingMessage.messageType &&
      Math.abs(incomingTime - pendingTime) < 120000
    )
  })

  if (!matchingPending) {
    return messages
  }

  return messages.filter((message) => message.id !== matchingPending.id)
}

function MessagePane({
  connected,
  conversation,
  liveMessage,
  messageDeletion,
  messageUpdate,
  onConversationRead,
  onMessageDeleted,
  onMessageUpdated,
  onSendMessage,
  onTyping,
  readReceipt,
  typingUser,
}) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [cursor, setCursor] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [loadingInitial, setLoadingInitial] = useState(false)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [error, setError] = useState("")
  const [newMessagesAvailable, setNewMessagesAvailable] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const scrollRef = useRef(null)
  const initialScrollPendingRef = useRef(false)
  const prependScrollHeightRef = useRef(null)
  const scrollBottomPendingRef = useRef(false)
  const nearBottomRef = useRef(true)
  const pendingSettleTimersRef = useRef(new Map())

  const markRead = useCallback(async () => {
    if (!conversation?.id) {
      return
    }

    try {
      const receipt = await markConversationAsRead(conversation.id)
      onConversationRead(conversation.id, receipt)
    } catch (requestError) {
      setError(getApiError(requestError).message)
    }
  }, [conversation?.id, onConversationRead])

  useEffect(() => {
    let canceled = false

    async function loadInitialMessages() {
      setLoadingInitial(true)
      setError("")
      setMessages([])
      setCursor(null)
      setHasMore(false)

      try {
        const page = normalizeCursorPage(
          await getConversationHistoryBefore(conversation.id),
        )

        if (!canceled) {
          setMessages(page.content.slice().reverse())
          setCursor(page.nextCursor)
          setHasMore(page.hasMore)
          initialScrollPendingRef.current = true
          await markRead()
        }
      } catch (requestError) {
        if (!canceled) {
          setError(getApiError(requestError).message)
        }
      } finally {
        if (!canceled) {
          setLoadingInitial(false)
        }
      }
    }

    if (conversation?.id) {
      loadInitialMessages()
    }

    return () => {
      canceled = true
    }
  }, [conversation?.id, markRead])

  useLayoutEffect(() => {
    const element = scrollRef.current

    if (!element) {
      return
    }

    if (initialScrollPendingRef.current) {
      element.scrollTop = element.scrollHeight
      initialScrollPendingRef.current = false
      return
    }

    if (prependScrollHeightRef.current !== null) {
      element.scrollTop = element.scrollHeight - prependScrollHeightRef.current
      prependScrollHeightRef.current = null
      return
    }

    if (scrollBottomPendingRef.current) {
      element.scrollTop = element.scrollHeight
      scrollBottomPendingRef.current = false
    }
  }, [messages])

  async function loadOlderMessages() {
    if (!hasMore || loadingOlder || !cursor) {
      return
    }

    const element = scrollRef.current
    prependScrollHeightRef.current = element?.scrollHeight || null
    setLoadingOlder(true)
    setError("")

    try {
      const page = normalizeCursorPage(
        await getConversationHistoryBefore(conversation.id, { before: cursor }),
      )
      setMessages((current) => mergeMessages(page.content.slice().reverse(), current))
      setCursor(page.nextCursor)
      setHasMore(page.hasMore)
    } catch (requestError) {
      setError(getApiError(requestError).message)
    } finally {
      setLoadingOlder(false)
    }
  }

  function handleScroll(event) {
    const element = event.currentTarget
    nearBottomRef.current = nearBottom(element)

    if (nearBottomRef.current) {
      setNewMessagesAvailable(false)
    }

    if (element.scrollTop < 80) {
      loadOlderMessages()
    }
  }

  useEffect(() => {
    if (!liveMessage || liveMessage.conversationId !== conversation?.id) {
      return
    }

    const ownMessage = liveMessage.senderId === user?.id
    const shouldScroll = ownMessage || nearBottomRef.current

    setMessages((current) => {
      if (current.some((message) => message.id === liveMessage.id)) {
        return current
      }

      if (shouldScroll) {
        scrollBottomPendingRef.current = true
      } else {
        setNewMessagesAvailable(true)
      }

      return mergeMessages(
        removeMatchingPendingMessage(current, liveMessage, user?.id),
        [liveMessage],
      )
    })

    if (liveMessage.receiverId === user?.id) {
      markRead()
    }
  }, [conversation?.id, liveMessage, markRead, user?.id])

  useEffect(() => {
    if (!readReceipt || readReceipt.conversationId !== conversation?.id) {
      return
    }

    setMessages((current) => applyReadReceipt(current, readReceipt))
  }, [conversation?.id, readReceipt])

  useEffect(() => {
    if (!messageUpdate || messageUpdate.conversationId !== conversation?.id) {
      return
    }

    setMessages((current) => mergeMessages(current, [messageUpdate]))
  }, [conversation?.id, messageUpdate])

  useEffect(() => {
    if (!messageDeletion || messageDeletion.conversationId !== conversation?.id) {
      return
    }

    setMessages((current) => markMessagesDeleted(current, messageDeletion))
  }, [conversation?.id, messageDeletion])

  useEffect(() => {
    const pendingSettleTimers = pendingSettleTimersRef.current

    return () => {
      pendingSettleTimers.forEach((timerId) => {
        window.clearTimeout(timerId)
      })
      pendingSettleTimers.clear()
    }
  }, [])

  function scrollToNewest() {
    const element = scrollRef.current

    if (element) {
      element.scrollTop = element.scrollHeight
      setNewMessagesAvailable(false)
      nearBottomRef.current = true
    }
  }

  async function handleEditMessage(message, content) {
    try {
      const updatedMessage = await editMessage(message.id, content)
      setMessages((current) => mergeMessages(current, [updatedMessage]))
      onMessageUpdated(updatedMessage)
    } catch (requestError) {
      setError(getApiError(requestError).message)
      throw requestError
    }
  }

  async function handleDeleteMessage() {
    if (!deleteTarget) {
      return
    }

    setDeleting(true)

    try {
      const deletion = await deleteMessage(deleteTarget.id)
      setMessages((current) => markMessagesDeleted(current, deletion))
      onMessageDeleted(deletion)
      setDeleteTarget(null)
    } catch (requestError) {
      setError(getApiError(requestError).message)
    } finally {
      setDeleting(false)
    }
  }

  async function handleAttachmentUpload(file, content, onUploadProgress) {
    if (!conversation?.id || !conversation.otherUser?.id) {
      throw new Error("Select a conversation first")
    }

    const messageType = file.type.startsWith("image/") ? "IMAGE" : "FILE"

    try {
      const uploadedMessage = await uploadAttachment({
        conversationId: conversation.id,
        receiverId: conversation.otherUser.id,
        content,
        file,
        messageType,
        onUploadProgress,
      })

      scrollBottomPendingRef.current = true
      setMessages((current) => mergeMessages(current, [uploadedMessage]))
      onMessageUpdated(uploadedMessage)
    } catch (requestError) {
      setError(getApiError(requestError).message)
      throw requestError
    }
  }

  async function handleSendTextMessage(content) {
    if (!conversation?.id || !conversation.otherUser?.id || !user?.id) {
      throw new Error("Select a conversation first")
    }

    const pendingMessage = createPendingTextMessage({
      content,
      conversation,
      user,
    })

    scrollBottomPendingRef.current = true
    setMessages((current) => mergeMessages(current, [pendingMessage]))
    onMessageUpdated(pendingMessage)

    try {
      await onSendMessage(content)
      const timerId = window.setTimeout(() => {
        setMessages((current) =>
          current.map((message) =>
            message.id === pendingMessage.id
              ? { ...message, pending: false }
              : message,
          ),
        )
        pendingSettleTimersRef.current.delete(pendingMessage.id)
      }, 2500)
      pendingSettleTimersRef.current.set(pendingMessage.id, timerId)
    } catch (sendError) {
      const timerId = pendingSettleTimersRef.current.get(pendingMessage.id)

      if (timerId) {
        window.clearTimeout(timerId)
        pendingSettleTimersRef.current.delete(pendingMessage.id)
      }

      setMessages((current) =>
        current.map((message) =>
          message.id === pendingMessage.id
            ? { ...message, pending: false, failed: true }
            : message,
        ),
      )
      throw sendError
    }
  }

  if (loadingInitial) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center text-slate-400">
        <Loader2 className="mr-2 animate-spin" size={18} />
        Loading messages...
      </div>
    )
  }

  return (
    <>
      <div
        className="scrollbar-thin relative min-h-0 flex-1 overflow-y-auto px-4 py-5"
        onScroll={handleScroll}
        ref={scrollRef}
      >
        {loadingOlder ? (
          <div className="mb-4 flex items-center justify-center text-sm text-slate-400">
            <Loader2 className="mr-2 animate-spin" size={16} />
            Loading older messages...
          </div>
        ) : null}

        {error ? (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        {messages.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No messages yet"
            description="Send the first message in this conversation."
          />
        ) : (
          <div className="space-y-2">
            {messages.map((message, index) => (
              <div key={message.id}>
                {shouldShowDateDivider(messages[index - 1], message) ? (
                  <DateDivider value={message.sentAt} />
                ) : null}
                <MessageBubble
                  message={message}
                  onDeleteMessage={setDeleteTarget}
                  onEditMessage={handleEditMessage}
                  onPreviewImage={setPreviewImage}
                  own={message.senderId === user?.id}
                />
              </div>
            ))}
          </div>
        )}

        {newMessagesAvailable ? (
          <button
            type="button"
            onClick={scrollToNewest}
            className="sticky bottom-3 left-1/2 mt-4 -translate-x-1/2 rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-ink-950 shadow-soft"
          >
            New messages
          </button>
        ) : null}
      </div>

      {typingUser ? (
        <div className="border-t border-white/10 bg-ink-950 px-4 py-2 text-sm text-emerald-200">
          {typingUser.fullName || typingUser.userName || "User"} is typing...
        </div>
      ) : null}

      <MessageComposer
        connected={connected}
        onAttachment={handleAttachmentUpload}
        onSend={handleSendTextMessage}
        onTyping={onTyping}
      />

      <ConfirmDialog
        confirmLabel="Delete"
        description="The message will be replaced with a deleted-message placeholder for both participants."
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteMessage}
        open={Boolean(deleteTarget)}
        title="Delete this message?"
      />

      <ImagePreviewModal
        message={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </>
  )
}

export default MessagePane
