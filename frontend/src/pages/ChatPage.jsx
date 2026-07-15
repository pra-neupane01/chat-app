import { useEffect, useMemo, useState } from "react"
import { MessageSquare, UserSearch } from "lucide-react"
import { getApiError } from "../api/axiosInstance"
import {
  createOrGetConversation,
  getConversations,
} from "../api/conversationApi"
import EmptyState from "../components/common/EmptyState"
import ChatHeader from "../components/layout/ChatHeader"
import Sidebar from "../components/layout/Sidebar"
import UserSearchModal from "../components/users/UserSearchModal"
import { useAuth } from "../hooks/useAuth"

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
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [conversationFilter, setConversationFilter] = useState("")
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [conversationError, setConversationError] = useState("")
  const [userSearchOpen, setUserSearchOpen] = useState(false)
  const [mobileListVisible, setMobileListVisible] = useState(true)

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

  async function loadConversations() {
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
  }

  useEffect(() => {
    loadConversations()
  }, [])

  function selectConversation(conversation) {
    setActiveConversation(conversation)
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
            onLogout={logout}
            onOpenUserSearch={() => setUserSearchOpen(true)}
            onRetry={loadConversations}
            onSelectConversation={selectConversation}
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
              <EmptyState
                icon={MessageSquare}
                title="Conversation selected"
                description="Message history and realtime delivery are wired in the next feature slice."
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
    </main>
  )
}

export default ChatPage
