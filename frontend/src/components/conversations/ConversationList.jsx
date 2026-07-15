import { Inbox } from "lucide-react"
import EmptyState from "../common/EmptyState"
import LoadingRows from "../common/LoadingRows"
import ConversationListItem from "./ConversationListItem"

function ConversationList({
  activeConversationId,
  conversations,
  error,
  loading,
  onRetry,
  onSelectConversation,
}) {
  if (loading) {
    return <LoadingRows count={7} />
  }

  if (error) {
    return (
      <EmptyState
        icon={Inbox}
        title="Could not load conversations"
        description={error}
        action={
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-slate-200"
          >
            Try again
          </button>
        }
      />
    )
  }

  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No conversations yet"
        description="Search for a user to start a one-to-one conversation."
      />
    )
  }

  return (
    <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-3 py-3">
      <div className="space-y-1">
        {conversations.map((conversation) => (
          <ConversationListItem
            active={conversation.id === activeConversationId}
            conversation={conversation}
            key={conversation.id}
            onClick={() => onSelectConversation(conversation)}
          />
        ))}
      </div>
    </div>
  )
}

export default ConversationList
