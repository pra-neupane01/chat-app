import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { LogIn } from "lucide-react"
import AuthShell from "../components/common/AuthShell"
import FormMessage from "../components/common/FormMessage"
import TextField from "../components/common/TextField"
import { getApiError } from "../api/axiosInstance"
import { useAuth } from "../hooks/useAuth"

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: "", password: "" })
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const redirectTo = location.state?.from?.pathname || "/"

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setFieldErrors((current) => ({ ...current, [name]: "" }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError("")
    setFieldErrors({})

    try {
      await login(form)
      navigate(redirectTo, { replace: true })
    } catch (requestError) {
      const apiError = getApiError(requestError)
      setError(apiError.message)
      setFieldErrors(apiError.fieldErrors)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in"
      subtitle="Use the email and password registered with the Spring Boot API."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <FormMessage>{error}</FormMessage>

        <TextField
          id="email"
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={updateField}
          error={fieldErrors.email}
          required
        />

        <TextField
          id="password"
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={updateField}
          error={fieldErrors.password}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-3 text-sm font-semibold text-ink-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogIn size={18} />
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="text-center text-sm text-slate-400">
          Need an account?{" "}
          <Link className="font-medium text-emerald-300 hover:text-emerald-200" to="/register">
            Create one
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}

export default LoginPage
