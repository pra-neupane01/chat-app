import axiosInstance, { unwrapApiResponse } from "./axiosInstance"

export async function getConversationHistoryBefore(
  conversationId,
  { before, size = 25 } = {},
) {
  const response = await axiosInstance.get(
    `/messages/conversations/${conversationId}/cursor`,
    {
      params: {
        before,
        size,
      },
    },
  )

  return unwrapApiResponse(response)
}

export async function markConversationAsRead(conversationId) {
  const response = await axiosInstance.patch(
    `/messages/conversations/${conversationId}/read`,
  )

  return unwrapApiResponse(response)
}

export async function editMessage(messageId, content) {
  const response = await axiosInstance.patch(`/messages/${messageId}`, {
    content,
  })

  return unwrapApiResponse(response)
}

export async function deleteMessage(messageId) {
  const response = await axiosInstance.delete(`/messages/${messageId}`)
  return unwrapApiResponse(response)
}

export async function getTotalUnreadCount() {
  const response = await axiosInstance.get("/messages/unread-count")
  return unwrapApiResponse(response)
}
