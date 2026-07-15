import {
  LogOut,
  MessageCirclePlus,
  Moon,
  Search,
  Settings,
  Sun,
} from "lucide-react"
import Avatar from "../common/Avatar"
import IconButton from "../common/IconButton"
import ConversationList from "../conversations/ConversationList"
import { useTheme } from "../../hooks/useTheme"

function Sidebar({
  activeConversationId,
  conversations,
  conversationFilter,
  error,
  loading,
  onConversationFilterChange,
  onOpenUserSearch,
  onOpenSettings,
  onSelectConversation,
  onLogout,
  onRetry,
  user,
  totalUnread,
}) {
  const { theme, toggleTheme } = useTheme()
  const ThemeIcon = theme === "dark" ? Sun : Moon

  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-r border-white/10 bg-ink-900 md:w-[380px] lg:w-[420px]">
      <header className="shrink-0 border-b border-white/10 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar user={user} />
            <div className="min-w-0">
              <p className="truncate font-semibold text-white">
                {user?.fullName || "Signed in"}
              </p>
              <p className="truncate text-sm text-slate-400">
                {user?.email || user?.userName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <IconButton
              icon={ThemeIcon}
              label={theme === "dark" ? "Switch to light" : "Switch to dark"}
              onClick={toggleTheme}
            />
            <IconButton icon={Settings} label="Settings" onClick={onOpenSettings} />
            <IconButton icon={LogOut} label="Logout" onClick={onLogout} />
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenUserSearch}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-3 text-sm font-semibold text-ink-950 transition hover:bg-emerald-300"
        >
          <MessageCirclePlus size={18} />
          New conversation
        </button>

        {totalUnread > 0 ? (
          <div className="mt-3 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100">
            {totalUnread} unread {totalUnread === 1 ? "message" : "messages"}
          </div>
        ) : null}

        <label className="relative mt-4 block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />
          <input
            className="w-full rounded-lg border border-white/10 bg-ink-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
            onChange={(event) =>
              onConversationFilterChange(event.target.value)
            }
            placeholder="Search conversations"
            value={conversationFilter}
          />
        </label>
      </header>

      <ConversationList
        activeConversationId={activeConversationId}
        conversations={conversations}
        error={error}
        loading={loading}
        onRetry={onRetry}
        onSelectConversation={onSelectConversation}
      />
    </aside>
  )
}

export default Sidebar
