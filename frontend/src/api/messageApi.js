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

export async function getTotalUnreadCount() {
  const response = await axiosInstance.get("/messages/unread-count")
  return unwrapApiResponse(response)
}
