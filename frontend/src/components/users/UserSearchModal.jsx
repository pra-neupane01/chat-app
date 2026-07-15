import { useEffect, useMemo, useState } from "react"
import { Loader2, Search, X } from "lucide-react"
import { getApiError } from "../../api/axiosInstance"
import { searchUsers } from "../../api/userApi"
import Avatar from "../common/Avatar"
import EmptyState from "../common/EmptyState"
import LoadingRows from "../common/LoadingRows"
import { formatPresence } from "../../utils/dateFormatter"

function normalizeSpringPage(page) {
  return {
    content: page?.content || [],
    isLast: Boolean(page?.last ?? page?.isLast),
    page: page?.number ?? page?.pageNo ?? 0,
  }
}

function UserSearchModal({ open, onClose, onSelectUser }) {
  const [query, setQuery] = useState("")
  const [users, setUsers] = useState([])
  const [page, setPage] = useState(0)
  const [isLast, setIsLast] = useState(true)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState("")

  const trimmedQuery = useMemo(() => query.trim(), [query])

  useEffect(() => {
    if (!open) {
      return
    }

    const controller = new AbortController()
    const timeoutId = window.setTimeout(async () => {
      setLoading(true)
      setError("")

      try {
        const result = normalizeSpringPage(
          await searchUsers({ query: trimmedQuery, page: 0 }),
        )

        if (!controller.signal.aborted) {
          setUsers(result.content)
          setPage(result.page)
          setIsLast(result.isLast)
        }
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(getApiError(requestError).message)
          setUsers([])
          setIsLast(true)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }, 250)

    return () => {
      controller.abort()
      window.clearTimeout(timeoutId)
    }
  }, [open, trimmedQuery])

  if (!open) {
    return null
  }

  async function loadMore() {
    setLoadingMore(true)
    setError("")

    try {
      const result = normalizeSpringPage(
        await searchUsers({ query: trimmedQuery, page: page + 1 }),
      )
      setUsers((current) => {
        const seen = new Set(current.map((user) => user.id))
        return [
          ...current,
          ...result.content.filter((user) => !seen.has(user.id)),
        ]
      })
      setPage(result.page)
      setIsLast(result.isLast)
    } catch (requestError) {
      setError(getApiError(requestError).message)
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-5">
      <div className="flex max-h-[92vh] w-full max-w-xl flex-col rounded-t-2xl border border-white/10 bg-ink-900 shadow-soft sm:rounded-2xl">
        <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Search users</h2>
            <p className="text-sm text-slate-400">
              Find people by username, full name, or ID.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </header>

        <div className="shrink-0 border-b border-white/10 p-5">
          <label className="relative block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={18}
            />
            <input
              autoFocus
              className="w-full rounded-lg border border-white/10 bg-ink-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search users"
              value={query}
            />
          </label>
        </div>

        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
          {loading ? <LoadingRows count={5} /> : null}

          {!loading && error ? (
            <EmptyState
              title="Search failed"
              description={error}
              icon={Search}
            />
          ) : null}

          {!loading && !error && users.length === 0 ? (
            <EmptyState
              title={trimmedQuery ? "No users found" : "Start searching"}
              description="The backend automatically excludes your authenticated user."
              icon={Search}
            />
          ) : null}

          {!loading && !error && users.length > 0 ? (
            <div className="space-y-1 p-3">
              {users.map((user) => (
                <button
                  type="button"
                  key={user.id}
                  onClick={() => onSelectUser(user)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-white/5"
                >
                  <div className="relative">
                    <Avatar user={user} />
                    <span
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-ink-900 ${
                        user.onlineStatus ? "bg-emerald-400" : "bg-slate-600"
                      }`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-white">
                      {user.fullName || user.userName}
                    </p>
                    <p className="truncate text-sm text-slate-400">
                      @{user.userName || "unknown"} - {formatPresence(user)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {!isLast && !loading && !error ? (
          <div className="shrink-0 border-t border-white/10 p-4">
            <button
              type="button"
              disabled={loadingMore}
              onClick={loadMore}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 disabled:opacity-60"
            >
              {loadingMore ? (
                <Loader2 className="animate-spin" size={17} />
              ) : null}
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default UserSearchModal
