import { useCallback, useMemo, useState } from "react"
import { ToastContext } from "./toastContextValue"

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    ({ message, title = "Notice", tone = "info" }) => {
      const id = crypto.randomUUID()
      setToasts((current) => [...current, { id, message, title, tone }])
      window.setTimeout(() => dismissToast(id), 5000)
      return id
    },
    [dismissToast],
  )

  const value = useMemo(
    () => ({
      dismissToast,
      showToast,
      toasts,
    }),
    [dismissToast, showToast, toasts],
  )

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}
