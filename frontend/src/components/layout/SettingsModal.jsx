import { LogOut, Server, Wifi, X } from "lucide-react"
import { API_BASE_URL, WS_BASE_URL } from "../../api/axiosInstance"
import Avatar from "../common/Avatar"

function SettingsModal({ connectionState, onClose, onLogout, open, user }) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-5">
      <div className="w-full max-w-lg rounded-t-2xl border border-white/10 bg-ink-900 shadow-soft sm:rounded-2xl">
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Settings</h2>
            <p className="text-sm text-slate-400">Profile and connection state</p>
          </div>
          <button
            type="button"
            aria-label="Close settings"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </header>

        <div className="space-y-4 p-5">
          <section className="rounded-xl border border-white/10 bg-ink-950 p-4">
            <div className="flex items-center gap-3">
              <Avatar user={user} size="lg" />
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">
                  {user?.fullName || "User"}
                </p>
                <p className="truncate text-sm text-slate-400">{user?.email}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              Profile editing is not exposed by the current backend API.
            </p>
          </section>

          <section className="space-y-3 rounded-xl border border-white/10 bg-ink-950 p-4 text-sm">
            <div className="flex items-center gap-3 text-slate-300">
              <Wifi size={17} />
              <span className="font-medium text-white">WebSocket</span>
              <span className="ml-auto rounded-full bg-white/5 px-2 py-1 text-xs capitalize">
                {connectionState}
              </span>
            </div>
            <div className="flex items-start gap-3 text-slate-300">
              <Server className="mt-0.5" size={17} />
              <div className="min-w-0">
                <p className="font-medium text-white">REST API</p>
                <p className="truncate text-slate-400">{API_BASE_URL}</p>
                <p className="truncate text-slate-400">{WS_BASE_URL}</p>
              </div>
            </div>
          </section>

          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-400 px-4 py-3 text-sm font-semibold text-ink-950 transition hover:bg-red-300"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
