import { useContext, useEffect, useRef } from "react"
import { WebSocketContext } from "../context/webSocketContextValue"

export function useWebSocket() {
  const context = useContext(WebSocketContext)

  if (!context) {
    throw new Error("useWebSocket must be used inside WebSocketProvider")
  }

  return context
}

export function useWebSocketEvent(eventName, handler) {
  const { addEventListener } = useWebSocket()
  const handlerRef = useRef(handler)

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    return addEventListener(eventName, (payload) => {
      handlerRef.current(payload)
    })
  }, [addEventListener, eventName])
}
