import axiosInstance, { unwrapApiResponse } from "./axiosInstance"

export async function loginUser(credentials) {
  const response = await axiosInstance.post("/auth/login", credentials)
  return unwrapApiResponse(response)
}

export async function registerUser(payload) {
  const response = await axiosInstance.post("/auth/register", payload)
  return unwrapApiResponse(response)
}
