const conversationFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
})

const dayFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
})

const fullDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "long",
  day: "numeric",
  year: "numeric",
})

function toDate(value) {
  if (!value) {
    return null
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatConversationTime(value) {
  const date = toDate(value)

  if (!date) {
    return ""
  }

  const today = new Date()
  const isToday = date.toDateString() === today.toDateString()

  if (isToday) {
    return conversationFormatter.format(date)
  }

  return dayFormatter.format(date)
}

export function formatMessageTime(value) {
  const date = toDate(value)

  if (!date) {
    return ""
  }

  return conversationFormatter.format(date)
}

export function formatDateDivider(value) {
  const date = toDate(value)

  if (!date) {
    return ""
  }

  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return "Today"
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday"
  }

  return fullDateFormatter.format(date)
}

export function formatFileSize(size) {
  if (!size) {
    return ""
  }

  if (size < 1024) {
    return `${size} B`
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export function formatPresence(user) {
  if (!user) {
    return "Offline"
  }

  if (user.onlineStatus) {
    return "Online"
  }

  const lastSeen = toDate(user.lastSeenAt)

  if (!lastSeen) {
    return "Offline"
  }

  return `Last seen ${formatConversationTime(lastSeen)}`
}
