import axiosInstance, { unwrapApiResponse } from "./axiosInstance"

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function searchUsers({
  query = "",
  page = 0,
  size = 20,
  sort = "fullName,asc",
} = {}) {
  const trimmedQuery = query.trim()
  const params = {
    page,
    size,
    sort,
  }

  if (trimmedQuery) {
    if (UUID_PATTERN.test(trimmedQuery)) {
      params.id = trimmedQuery
    } else {
      params.username = trimmedQuery
      params.fullName = trimmedQuery
    }
  }

  const response = await axiosInstance.get("/users/search", { params })
  return unwrapApiResponse(response)
}
