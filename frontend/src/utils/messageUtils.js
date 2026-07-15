import { API_BASE_URL } from "../api/axiosInstance"

export function getAttachmentUrl(message) {
  if (!message?.attachmentUrl) {
    return ""
  }

  if (/^https?:\/\//i.test(message.attachmentUrl)) {
    return message.attachmentUrl
  }

  return `${API_BASE_URL.replace("/api/v1", "")}${message.attachmentUrl}`
}

export function getMessagePreview(message) {
  if (!message) {
    return ""
  }

  if (message.deleted) {
    return "This message was deleted."
  }

  if (message.messageType === "IMAGE") {
    return message.content || message.attachmentFileName || "Image"
  }

  if (message.messageType === "FILE") {
    return message.attachmentFileName || message.content || "File"
  }

  return message.content || ""
}

export function mergeMessages(existingMessages, incomingMessages) {
  const byId = new Map()

  existingMessages.forEach((message) => {
    if (message?.id) {
      byId.set(message.id, message)
    }
  })

  incomingMessages.forEach((message) => {
    if (message?.id) {
      byId.set(message.id, { ...byId.get(message.id), ...message })
    }
  })

  return Array.from(byId.values()).sort((first, second) => {
    return new Date(first.sentAt).getTime() - new Date(second.sentAt).getTime()
  })
}

export function applyReadReceipt(messages, receipt) {
  const readIds = new Set(receipt?.messageIds || [])

  if (readIds.size === 0) {
    return messages
  }

  return messages.map((message) => {
    if (!readIds.has(message.id)) {
      return message
    }

    return {
      ...message,
      messageStatus: "READ",
      readAt: receipt.readAt,
    }
  })
}

export function markMessagesDeleted(messages, deletion) {
  if (!deletion?.messageId) {
    return messages
  }

  return messages.map((message) => {
    if (message.id !== deletion.messageId) {
      return message
    }

    return {
      ...message,
      content: null,
      deleted: true,
      deletedAt: deletion.deletedAt,
      attachmentUrl: null,
      attachmentFileName: null,
      attachmentContentType: null,
      attachmentSize: null,
    }
  })
}
