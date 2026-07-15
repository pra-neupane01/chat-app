import { Client } from "@stomp/stompjs"
import SockJS from "sockjs-client"
import { WS_BASE_URL } from "../api/axiosInstance"

export const SOCKET_EVENTS = {
  MESSAGE: "message",
  TYPING: "typing",
  READ_RECEIPT: "read-receipt",
  MESSAGE_UPDATE: "message-update",
  MESSAGE_DELETION: "message-deletion",
  ERROR: "error",
}

export const SOCKET_DESTINATIONS = {
  SEND_MESSAGE: "/app/chat.sendMessage",
  TYPING: "/app/chat.typing",
}

const QUEUE_SUBSCRIPTIONS = [
  ["/user/queue/messages", SOCKET_EVENTS.MESSAGE],
  ["/user/queue/typing", SOCKET_EVENTS.TYPING],
  ["/user/queue/read-receipts", SOCKET_EVENTS.READ_RECEIPT],
  ["/user/queue/message-updates", SOCKET_EVENTS.MESSAGE_UPDATE],
  ["/user/queue/message-deletions", SOCKET_EVENTS.MESSAGE_DELETION],
  ["/user/queue/errors", SOCKET_EVENTS.ERROR],
]

function parseMessageBody(message) {
  if (!message.body) {
    return null
  }

  return JSON.parse(message.body)
}

export function createWebSocketClient({
  emit,
  onConnect,
  onDisconnect,
  onError,
  token,
}) {
  const client = new Client({
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    debug: () => {},
    reconnectDelay: 3000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    webSocketFactory: () => new SockJS(WS_BASE_URL),
  })

  client.onConnect = () => {
    QUEUE_SUBSCRIPTIONS.forEach(([destination, eventName]) => {
      client.subscribe(destination, (message) => {
        try {
          emit(eventName, parseMessageBody(message))
        } catch {
          emit(SOCKET_EVENTS.ERROR, {
            type: "MALFORMED_MESSAGE",
            message: "Received an invalid WebSocket payload",
          })
        }
      })
    })

    onConnect()
  }

  client.onDisconnect = onDisconnect
  client.onWebSocketClose = onDisconnect
  client.onWebSocketError = () => {
    onError("WebSocket connection failed")
  }
  client.onStompError = (frame) => {
    onError(frame.headers.message || "STOMP connection failed")
  }

  return client
}
