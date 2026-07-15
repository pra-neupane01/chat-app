import { ArrowLeft, MoreVertical, Search } from "lucide-react"
import Avatar from "../common/Avatar"
import IconButton from "../common/IconButton"
import { formatPresence } from "../../utils/dateFormatter"

function ChatHeader({ conversation, onBack }) {
  const otherUser = conversation?.otherUser

  return (
    <header className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 bg-ink-900/95 px-4 backdrop-blur">
      <div className="flex min-w-0 items-center gap-3">
        <IconButton
          className="md:hidden"
          icon={ArrowLeft}
          label="Back to conversations"
          onClick={onBack}
        />
        <Avatar user={otherUser} />
        <div className="min-w-0">
          <h1 className="truncate font-semibold text-white">
            {otherUser?.fullName || "Conversation"}
          </h1>
          <p className="truncate text-sm text-slate-400">
            {formatPresence(otherUser)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <IconButton icon={Search} label="Search messages" disabled />
        <IconButton icon={MoreVertical} label="Conversation actions" disabled />
      </div>
    </header>
  )
}

export default ChatHeader
