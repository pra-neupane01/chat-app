import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { UserPlus } from "lucide-react"
import AuthShell from "../components/common/AuthShell"
import FormMessage from "../components/common/FormMessage"
import TextField from "../components/common/TextField"
import { getApiError } from "../api/axiosInstance"
import { useAuth } from "../hooks/useAuth"

function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({
    fullName: "",
    userName: "",
    email: "",
    password: "",
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

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
      await register(form)
      navigate("/", { replace: true })
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
      eyebrow="New account"
      title="Create your chat profile"
      subtitle="Registration uses the backend fullName, userName, email, and password fields."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <FormMessage>{error}</FormMessage>

        <TextField
          id="fullName"
          label="Full name"
          name="fullName"
          autoComplete="name"
          value={form.fullName}
          onChange={updateField}
          error={fieldErrors.fullName}
          required
        />

        <TextField
          id="userName"
          label="Username"
          name="userName"
          autoComplete="username"
          value={form.userName}
          onChange={updateField}
          error={fieldErrors.userName}
          required
        />

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
          autoComplete="new-password"
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
          <UserPlus size={18} />
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p className="text-center text-sm text-slate-400">
          Already registered?{" "}
          <Link className="font-medium text-emerald-300 hover:text-emerald-200" to="/login">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}

export default RegisterPage
