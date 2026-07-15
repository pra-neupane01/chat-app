import { Link } from "react-router-dom"

function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-950 px-5 text-center text-white">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
          404
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Page not found</h1>
        <Link
          className="mt-6 inline-flex rounded-lg bg-emerald-400 px-4 py-3 text-sm font-semibold text-ink-950 hover:bg-emerald-300"
          to="/"
        >
          Back to chat
        </Link>
      </div>
    </main>
  )
}

export default NotFoundPage
