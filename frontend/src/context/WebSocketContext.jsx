import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useAuth } from "../hooks/useAuth"
import {
  createWebSocketClient,
  SOCKET_DESTINATIONS,
} from "../services/websocketService"
import { WebSocketContext } from "./webSocketContextValue"

const CONNECTION_STATES = {
  IDLE: "idle",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  DISCONNECTED: "disconnected",
  ERROR: "error",
}

export function WebSocketProvider({ children }) {
  const { isAuthenticated, token } = useAuth()
  const [connectionState, setConnectionState] = useState(
    CONNECTION_STATES.IDLE,
  )
  const [lastError, setLastError] = useState("")
  const clientRef = useRef(null)
  const handlersRef = useRef(new Map())

  const emit = useCallback((eventName, payload) => {
    const handlers = handlersRef.current.get(eventName)

    if (!handlers) {
      return
    }

    handlers.forEach((handler) => handler(payload))
  }, [])

  const addEventListener = useCallback((eventName, handler) => {
    const handlers = handlersRef.current.get(eventName) || new Set()
    handlers.add(handler)
    handlersRef.current.set(eventName, handlers)

    return () => {
      handlers.delete(handler)

      if (handlers.size === 0) {
        handlersRef.current.delete(eventName)
      }
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (clientRef.current) {
        clientRef.current.deactivate()
        clientRef.current = null
      }

      setConnectionState(CONNECTION_STATES.IDLE)
      setLastError("")
      return undefined
    }

    setConnectionState(CONNECTION_STATES.CONNECTING)

    const client = createWebSocketClient({
      emit,
      token,
      onConnect: () => {
        setConnectionState(CONNECTION_STATES.CONNECTED)
        setLastError("")
      },
      onDisconnect: () => {
        setConnectionState((current) =>
          current === CONNECTION_STATES.IDLE
            ? CONNECTION_STATES.IDLE
            : CONNECTION_STATES.DISCONNECTED,
        )
      },
      onError: (message) => {
        setLastError(message)
        setConnectionState(CONNECTION_STATES.ERROR)
      },
    })

    clientRef.current = client
    client.activate()

    return () => {
      client.deactivate()
      clientRef.current = null
    }
  }, [emit, isAuthenticated, token])

  const publish = useCallback((destination, payload) => {
    const client = clientRef.current

    if (!client?.connected) {
      return false
    }

    client.publish({
      destination,
      body: JSON.stringify(payload),
    })

    return true
  }, [])

  const sendChatMessage = useCallback(
    ({ conversationId, receiverId, content, messageType = "TEXT" }) =>
      publish(SOCKET_DESTINATIONS.SEND_MESSAGE, {
        conversationId,
        receiverId,
        content,
        messageType,
      }),
    [publish],
  )

  const sendTypingIndicator = useCallback(
    ({ conversationId, typing }) =>
      publish(SOCKET_DESTINATIONS.TYPING, {
        conversationId,
        typing,
      }),
    [publish],
  )

  const value = useMemo(
    () => ({
      addEventListener,
      connected: connectionState === CONNECTION_STATES.CONNECTED,
      connectionState,
      lastError,
      publish,
      sendChatMessage,
      sendTypingIndicator,
    }),
    [
      addEventListener,
      connectionState,
      lastError,
      publish,
      sendChatMessage,
      sendTypingIndicator,
    ],
  )

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  )
}
