import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { loginUser, registerUser } from "../api/authApi"
import { setAccessTokenGetter } from "../api/axiosInstance"
import { decodeJwt, isJwtExpired } from "../utils/jwtUtils"
import { AuthContext } from "./authContextValue"

const STORAGE_KEY = "chat.auth.session"

function readStoredSession() {
  try {
    const rawSession = localStorage.getItem(STORAGE_KEY)

    if (!rawSession) {
      return null
    }

    const session = JSON.parse(rawSession)

    if (!session?.token || isJwtExpired(session.token)) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }

    return session
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

function persistSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

function normalizeAuthSession(authPayload) {
  const claims = decodeJwt(authPayload.token)

  return {
    token: authPayload.token,
    user: {
      id: authPayload.userId || claims?.id,
      fullName: authPayload.fullName || claims?.fullName || "User",
      email: authPayload.email || claims?.email || claims?.sub,
      userName: authPayload.userName || null,
      profileImage: null,
      onlineStatus: true,
    },
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readStoredSession())
  const [initializing, setInitializing] = useState(true)
  const tokenRef = useRef(session?.token || null)

  useEffect(() => {
    tokenRef.current = session?.token || null
    setAccessTokenGetter(() => tokenRef.current)
  }, [session])

  useEffect(() => {
    setInitializing(false)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setSession(null)
  }, [])

  useEffect(() => {
    window.addEventListener("chat:auth-expired", logout)
    return () => window.removeEventListener("chat:auth-expired", logout)
  }, [logout])

  const login = useCallback(async (credentials) => {
    const authPayload = await loginUser(credentials)
    const nextSession = normalizeAuthSession(authPayload)
    persistSession(nextSession)
    setSession(nextSession)
    return nextSession.user
  }, [])

  const register = useCallback(
    async (payload) => {
      await registerUser(payload)
      return login({
        email: payload.email,
        password: payload.password,
      })
    },
    [login],
  )

  const value = useMemo(
    () => ({
      token: session?.token || null,
      user: session?.user || null,
      initializing,
      isAuthenticated: Boolean(session?.token && session?.user),
      login,
      register,
      logout,
    }),
    [initializing, login, logout, register, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
