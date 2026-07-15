import { useCallback, useEffect, useMemo, useState } from "react"

const STORAGE_KEY = "chat.notifications.enabled"

function getInitialPermission() {
  if (!("Notification" in window)) {
    return "unsupported"
  }

  return Notification.permission
}

function getInitialEnabled(permission) {
  return (
    permission === "granted" &&
    localStorage.getItem(STORAGE_KEY) !== "false"
  )
}

export function useNotifications() {
  const [permission, setPermission] = useState(getInitialPermission)
  const [enabled, setEnabled] = useState(() =>
    getInitialEnabled(getInitialPermission()),
  )

  useEffect(() => {
    if (permission !== "granted") {
      setEnabled(false)
    }
  }, [permission])

  const requestNotifications = useCallback(async () => {
    if (!("Notification" in window)) {
      setPermission("unsupported")
      setEnabled(false)
      return "unsupported"
    }

    const nextPermission = await Notification.requestPermission()
    setPermission(nextPermission)

    const nextEnabled = nextPermission === "granted"
    setEnabled(nextEnabled)
    localStorage.setItem(STORAGE_KEY, String(nextEnabled))

    return nextPermission
  }, [])

  const toggleNotifications = useCallback(async () => {
    if (permission !== "granted") {
      return requestNotifications()
    }

    setEnabled((current) => {
      const nextEnabled = !current
      localStorage.setItem(STORAGE_KEY, String(nextEnabled))
      return nextEnabled
    })

    return permission
  }, [permission, requestNotifications])

  const notify = useCallback(
    ({ body, title }) => {
      if (!enabled || permission !== "granted" || !("Notification" in window)) {
        return
      }

      const notification = new Notification(title, {
        body,
        tag: "chat-message",
      })

      notification.onclick = () => {
        window.focus()
        notification.close()
      }

      window.setTimeout(() => notification.close(), 7000)
    },
    [enabled, permission],
  )

  return useMemo(
    () => ({
      enabled,
      notify,
      permission,
      requestNotifications,
      toggleNotifications,
    }),
    [enabled, notify, permission, requestNotifications, toggleNotifications],
  )
}
