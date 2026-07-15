import axios from "axios"

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8082/api/v1"

export const WS_BASE_URL =
  import.meta.env.VITE_WS_BASE_URL || "http://localhost:8082/api/v1/ws"

let accessTokenGetter = () => null

export function setAccessTokenGetter(getter) {
  accessTokenGetter = getter
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
})

axiosInstance.interceptors.request.use((config) => {
  const token = accessTokenGetter()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent("chat:auth-expired"))
    }

    return Promise.reject(error)
  },
)

export function unwrapApiResponse(response) {
  const payload = response?.data

  if (payload && Object.hasOwn(payload, "data")) {
    return payload.data
  }

  return payload
}

export function getApiError(error) {
  const payload = error?.response?.data
  const fallback = error?.message || "Request failed"

  return {
    message: payload?.message || fallback,
    fieldErrors:
      payload?.data && typeof payload.data === "object" ? payload.data : {},
    status: error?.response?.status,
  }
}

export default axiosInstance
