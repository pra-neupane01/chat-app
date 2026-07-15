function base64UrlDecode(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/")
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  )

  return atob(padded)
}

export function decodeJwt(token) {
  try {
    const [, payload] = token.split(".")

    if (!payload) {
      return null
    }

    return JSON.parse(base64UrlDecode(payload))
  } catch {
    return null
  }
}

export function isJwtExpired(token) {
  const claims = decodeJwt(token)

  if (!claims?.exp) {
    return false
  }

  return claims.exp * 1000 <= Date.now()
}
