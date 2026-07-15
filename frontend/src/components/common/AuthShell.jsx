import { MessageCircle } from "lucide-react"

function AuthShell({ eyebrow, title, subtitle, children }) {
  return (
    <main className="flex min-h-screen bg-ink-950 text-white">
      <section className="hidden min-h-screen flex-1 items-center justify-center bg-ink-900 px-10 lg:flex">
        <div className="max-w-md">
          <div className="mb-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400 text-ink-950 shadow-soft">
            <MessageCircle size={30} />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Realtime chat
          </p>
          <h1 className="mt-5 text-5xl font-semibold leading-tight tracking-tight">
            Private conversations with live delivery.
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-300">
            Secure JWT authentication, STOMP messaging, read receipts, typing
            indicators, and attachment-ready chat flows.
          </p>
        </div>
      </section>

      <section className="flex min-h-screen w-full items-center justify-center px-5 py-10 lg:w-[520px] lg:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400 text-ink-950">
              <MessageCircle size={24} />
            </div>
            <span className="text-lg font-semibold">Chat</span>
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">{subtitle}</p>

          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  )
}

export default AuthShell
