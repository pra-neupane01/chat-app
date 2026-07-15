const conversationFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
})

const dayFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
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
