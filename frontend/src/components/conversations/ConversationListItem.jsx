import Avatar from "../common/Avatar"
import { formatConversationTime } from "../../utils/dateFormatter"

function ConversationListItem({ active, conversation, onClick }) {
  const otherUser = conversation.otherUser
  const unreadCount = Number(conversation.unreadCount || 0)

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
        active
          ? "bg-emerald-400/15 ring-1 ring-emerald-400/30"
          : "hover:bg-white/5"
      }`}
    >
      <div className="relative">
        <Avatar user={otherUser} />
        <span
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-ink-900 ${
            otherUser?.onlineStatus ? "bg-emerald-400" : "bg-slate-600"
          }`}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate font-medium text-white">
            {otherUser?.fullName || otherUser?.userName || "Unknown user"}
          </p>
          <time className="shrink-0 text-xs text-slate-500">
            {formatConversationTime(
              conversation.lastMessageTime || conversation.createdAt,
            )}
          </time>
        </div>
        <div className="mt-1 flex items-center justify-between gap-3">
          <p className="truncate text-sm text-slate-400">
            {conversation.lastMessage || "No messages yet"}
          </p>
          {unreadCount > 0 ? (
            <span className="flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full bg-emerald-400 px-1.5 text-xs font-semibold text-ink-950">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  )
}

export default ConversationListItem
