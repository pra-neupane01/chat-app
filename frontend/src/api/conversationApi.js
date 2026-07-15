import axiosInstance, { unwrapApiResponse } from "./axiosInstance"

export async function getConversations({
  pageNo = 0,
  pageSize = 50,
  sortBy = "createdAt",
  sortDirection = "DESC",
} = {}) {
  const response = await axiosInstance.get("/conversations", {
    params: { pageNo, pageSize, sortBy, sortDirection },
  })

  return unwrapApiResponse(response)
}

export async function createOrGetConversation(otherUserId) {
  const response = await axiosInstance.post(`/conversations/${otherUserId}`)
  return unwrapApiResponse(response)
}
