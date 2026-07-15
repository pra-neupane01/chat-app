import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { UserSearch } from "lucide-react"
import { getApiError } from "../api/axiosInstance"
import {
  createOrGetConversation,
  getConversations,
} from "../api/conversationApi"
import EmptyState from "../components/common/EmptyState"
import ChatHeader from "../components/layout/ChatHeader"
import SettingsModal from "../components/layout/SettingsModal"
import Sidebar from "../components/layout/Sidebar"
import ConnectionBanner from "../components/messages/ConnectionBanner"
import MessagePane from "../components/messages/MessagePane"
import UserSearchModal from "../components/users/UserSearchModal"
import { useAuth } from "../hooks/useAuth"
import { useNotifications } from "../hooks/useNotifications"
import { useToast } from "../hooks/useToast"
import { useWebSocket, useWebSocketEvent } from "../hooks/useWebSocket"
import { SOCKET_EVENTS } from "../services/websocketService"
import { getMessagePreview } from "../utils/messageUtils"

function normalizePagedResponse(page) {
  return {
    content: page?.content || [],
    isLast: Boolean(page?.isLast ?? page?.last),
  }
}

function sortConversations(conversations) {
  return [...conversations].sort((first, second) => {
    const firstDate = new Date(
      first.lastMessageTime || first.createdAt || 0,
    ).getTime()
    const secondDate = new Date(
      second.lastMessageTime || second.createdAt || 0,
    ).getTime()

    return secondDate - firstDate
  })
}

function upsertConversation(conversations, nextConversation) {
  const withoutDuplicate = conversations.filter(
    (conversation) => conversation.id !== nextConversation.id,
  )

  return sortConversations([nextConversation, ...withoutDuplicate])
}

function ChatPage() {
  const { logout, user } = useAuth()
  const { showToast } = useToast()
  const {
    enabled: notificationsEnabled,
    notify,
    permission: notificationPermission,
    toggleNotifications,
  } = useNotifications()
  const {
    connected,
    connectionState,
    lastError,
    sendChatMessage,
    sendTypingIndicator,
  } = useWebSocket()
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [conversationFilter, setConversationFilter] = useState("")
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [conversationError, setConversationError] = useState("")
  const [userSearchOpen, setUserSearchOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [mobileListVisible, setMobileListVisible] = useState(true)
  const [liveMessage, setLiveMessage] = useState(null)
  const [readReceipt, setReadReceipt] = useState(null)
  const [messageUpdate, setMessageUpdate] = useState(null)
  const [messageDeletion, setMessageDeletion] = useState(null)
  const [typingByConversation, setTypingByConversation] = useState({})
  const activeConversationRef = useRef(activeConversation)
  const conversationsRef = useRef(conversations)
  const typingTimersRef = useRef(new Map())
  const userRef = useRef(user)

  const filteredConversations = useMemo(() => {
    const query = conversationFilter.trim().toLowerCase()

    if (!query) {
      return conversations
    }

    return conversations.filter((conversation) => {
      const otherUser = conversation.otherUser || {}
      const haystack = [
        otherUser.fullName,
        otherUser.userName,
        conversation.lastMessage,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return haystack.includes(query)
    })
  }, [conversationFilter, conversations])

  const totalUnread = useMemo(
    () =>
      conversations.reduce(
        (total, conversation) => total + Number(conversation.unreadCount || 0),
        0,
      ),
    [conversations],
  )

  const loadConversations = useCallback(async () => {
    setLoadingConversations(true)
    setConversationError("")

    try {
      const page = normalizePagedResponse(await getConversations())
      setConversations(sortConversations(page.content))
    } catch (requestError) {
      setConversationError(getApiError(requestError).message)
    } finally {
      setLoadingConversations(false)
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  useEffect(() => {
    activeConversationRef.current = activeConversation
  }, [activeConversation])

  useEffect(() => {
    conversationsRef.current = conversations
  }, [conversations])

  useEffect(() => {
    userRef.current = user
  }, [user])

  useEffect(() => {
    document.title = totalUnread > 0 ? `(${totalUnread}) Chat` : "Chat"
  }, [totalUnread])

  const resetConversationUnread = useCallback((conversationId) => {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, unreadCount: 0 }
          : conversation,
      ),
    )
  }, [])

  function applyMessagePreview(message) {
    const activeId = activeConversationRef.current?.id
    const currentUserId = userRef.current?.id
    const conversationExists = conversationsRef.current.some(
      (conversation) => conversation.id === message.conversationId,
    )

    if (!conversationExists) {
      loadConversations()
      return
    }

    setConversations((current) =>
      sortConversations(
        current.map((conversation) => {
          if (conversation.id !== message.conversationId) {
            return conversation
          }

          const inactiveIncoming =
            message.receiverId === currentUserId &&
            message.conversationId !== activeId

          return {
            ...conversation,
            lastMessage: getMessagePreview(message),
            lastMessageTime: message.sentAt,
            unreadCount: inactiveIncoming
              ? Number(conversation.unreadCount || 0) + 1
              : message.conversationId === activeId
                ? 0
                : conversation.unreadCount,
          }
        }),
      ),
    )
  }

  useWebSocketEvent(SOCKET_EVENTS.MESSAGE, (message) => {
    if (!message?.id) {
      return
    }

    setLiveMessage(message)
    applyMessagePreview(message)

    const incoming = message.receiverId === userRef.current?.id
    const activeId = activeConversationRef.current?.id
    const inactiveConversation = message.conversationId !== activeId
    const pageHidden = document.visibilityState !== "visible"

    if (incoming && (inactiveConversation || pageHidden)) {
      const conversation = conversationsRef.current.find(
        (item) => item.id === message.conversationId,
      )
      const title =
        conversation?.otherUser?.fullName ||
        message.senderName ||
        "New message"
      const body = getMessagePreview(message)

      showToast({
        title,
        message: body,
        tone: "info",
      })

      if (pageHidden || inactiveConversation) {
        notify({ title, body })
      }
    }
  })

  useWebSocketEvent(SOCKET_EVENTS.READ_RECEIPT, (receipt) => {
    if (receipt?.conversationId) {
      setReadReceipt(receipt)
    }
  })

  useWebSocketEvent(SOCKET_EVENTS.MESSAGE_UPDATE, (message) => {
    if (!message?.id) {
      return
    }

    setMessageUpdate(message)
    applyMessagePreview(message)
  })

  useWebSocketEvent(SOCKET_EVENTS.MESSAGE_DELETION, (deletion) => {
    if (!deletion?.messageId) {
      return
    }

    setMessageDeletion(deletion)
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === deletion.conversationId
          ? {
              ...conversation,
              lastMessage: "This message was deleted.",
            }
          : conversation,
      ),
    )
  })

  useWebSocketEvent(SOCKET_EVENTS.TYPING, (typingEvent) => {
    if (!typingEvent?.conversationId || typingEvent.senderId === userRef.current?.id) {
      return
    }

    const existingTimer = typingTimersRef.current.get(typingEvent.conversationId)

    if (existingTimer) {
      window.clearTimeout(existingTimer)
    }

    if (!typingEvent.typing) {
      setTypingByConversation((current) => {
        const next = { ...current }
        delete next[typingEvent.conversationId]
        return next
      })
      return
    }

    const conversation = conversationsRef.current.find(
      (item) => item.id === typingEvent.conversationId,
    )

    setTypingByConversation((current) => ({
      ...current,
      [typingEvent.conversationId]: conversation?.otherUser || {
        fullName: "User",
      },
    }))

    const timerId = window.setTimeout(() => {
      setTypingByConversation((current) => {
        const next = { ...current }
        delete next[typingEvent.conversationId]
        return next
      })
      typingTimersRef.current.delete(typingEvent.conversationId)
    }, 3000)

    typingTimersRef.current.set(typingEvent.conversationId, timerId)
  })

  useWebSocketEvent(SOCKET_EVENTS.ERROR, (socketError) => {
    const message = socketError?.message || "Realtime message failed"
    setConversationError(message)
    showToast({
      title: socketError?.type || "Realtime error",
      message,
      tone: "error",
    })
  })

  function selectConversation(conversation) {
    setActiveConversation(conversation)
    resetConversationUnread(conversation.id)
    setMobileListVisible(false)
  }

  async function handleSelectUser(selectedUser) {
    try {
      const conversation = await createOrGetConversation(selectedUser.id)
      setConversations((current) => upsertConversation(current, conversation))
      setActiveConversation(conversation)
      setMobileListVisible(false)
      setUserSearchOpen(false)
    } catch (requestError) {
      setConversationError(getApiError(requestError).message)
      setUserSearchOpen(false)
    }
  }

  async function handleSendMessage(content) {
    if (!activeConversation?.id || !activeConversation.otherUser?.id) {
      throw new Error("Select a conversation first")
    }

    const sent = sendChatMessage({
      conversationId: activeConversation.id,
      receiverId: activeConversation.otherUser.id,
      content,
      messageType: "TEXT",
    })

    if (!sent) {
      throw new Error("Realtime connection is not ready")
    }
  }

  function handleTyping(typing) {
    if (!activeConversation?.id) {
      return
    }

    sendTypingIndicator({
      conversationId: activeConversation.id,
      typing,
    })
  }

  function handleLocalMessageUpdate(message) {
    setMessageUpdate(message)
    applyMessagePreview(message)
  }

  function handleLocalMessageDeletion(deletion) {
    setMessageDeletion(deletion)
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === deletion.conversationId
          ? {
              ...conversation,
              lastMessage: "This message was deleted.",
            }
          : conversation,
      ),
    )
  }

  const activeTypingUser = activeConversation
    ? typingByConversation[activeConversation.id]
    : null

  return (
    <main className="h-screen overflow-hidden bg-ink-950 p-0 text-white md:p-4">
      <section className="mx-auto flex h-full max-w-7xl overflow-hidden border-white/10 bg-ink-900 shadow-soft md:rounded-2xl md:border">
        <div
          className={`h-full min-h-0 w-full md:block md:w-auto ${
            mobileListVisible || !activeConversation ? "block" : "hidden"
          }`}
        >
          <Sidebar
            activeConversationId={activeConversation?.id}
            conversationFilter={conversationFilter}
            conversations={filteredConversations}
            error={conversationError}
            loading={loadingConversations}
            onConversationFilterChange={setConversationFilter}
            onToggleNotifications={toggleNotifications}
            onLogout={logout}
            onOpenSettings={() => setSettingsOpen(true)}
            onOpenUserSearch={() => setUserSearchOpen(true)}
            onRetry={loadConversations}
            onSelectConversation={selectConversation}
            totalUnread={totalUnread}
            notificationsEnabled={notificationsEnabled}
            notificationPermission={notificationPermission}
            user={user}
          />
        </div>

        <section
          className={`min-h-0 flex-1 bg-ink-950 md:flex ${
            activeConversation && !mobileListVisible ? "flex" : "hidden"
          }`}
        >
          {activeConversation ? (
            <div className="flex min-h-0 flex-1 flex-col">
              <ChatHeader
                conversation={activeConversation}
                onBack={() => setMobileListVisible(true)}
              />
              <ConnectionBanner
                connectionState={connectionState}
                lastError={lastError}
              />
              <MessagePane
                connected={connected}
                conversation={activeConversation}
                key={activeConversation.id}
                liveMessage={liveMessage}
                messageDeletion={messageDeletion}
                messageUpdate={messageUpdate}
                onConversationRead={resetConversationUnread}
                onMessageDeleted={handleLocalMessageDeletion}
                onMessageUpdated={handleLocalMessageUpdate}
                onSendMessage={handleSendMessage}
                onTyping={handleTyping}
                readReceipt={readReceipt}
                typingUser={activeTypingUser}
              />
            </div>
          ) : (
            <EmptyState
              icon={UserSearch}
              title="Select a conversation"
              description="Choose an existing chat or start a new one from the user search."
              action={
                <button
                  type="button"
                  onClick={() => setUserSearchOpen(true)}
                  className="rounded-lg bg-emerald-400 px-4 py-3 text-sm font-semibold text-ink-950 hover:bg-emerald-300"
                >
                  Search users
                </button>
              }
            />
          )}
        </section>
      </section>

      <UserSearchModal
        onClose={() => setUserSearchOpen(false)}
        onSelectUser={handleSelectUser}
        open={userSearchOpen}
      />

      <SettingsModal
        connectionState={connectionState}
        onClose={() => setSettingsOpen(false)}
        onLogout={logout}
        open={settingsOpen}
        user={user}
      />
    </main>
  )
}

export default ChatPage
