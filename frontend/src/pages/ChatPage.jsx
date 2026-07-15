import { LogOut, MessageSquare } from "lucide-react"
import { useAuth } from "../hooks/useAuth"

function ChatPage() {
  const { logout, user } = useAuth()

  return (
    <main className="min-h-screen bg-ink-950 p-4 text-white">
      <section className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl flex-col rounded-2xl border border-white/10 bg-ink-900 shadow-soft">
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400 text-ink-950">
              <MessageSquare size={23} />
            </div>
            <div>
              <p className="text-sm text-slate-400">Signed in as</p>
              <h1 className="font-semibold text-white">
                {user?.fullName || user?.email}
              </h1>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            <LogOut size={17} />
            Logout
          </button>
        </header>

        <div className="flex flex-1 items-center justify-center px-6 text-center">
          <div className="max-w-md">
            <h2 className="text-2xl font-semibold tracking-tight">
              Chat workspace is ready
            </h2>
            <p className="mt-3 leading-7 text-slate-400">
              Conversation lists, user search, realtime messages, receipts, and
              attachment workflows are coming in the next feature commits.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default ChatPage
