function initialsFor(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) {
    return "?"
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

function Avatar({ user, size = "md", className = "" }) {
  const sizes = {
    sm: "h-9 w-9 text-xs",
    md: "h-11 w-11 text-sm",
    lg: "h-14 w-14 text-base",
  }
  const name = user?.fullName || user?.userName || user?.email || "User"

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-emerald-400 font-semibold text-ink-950 ${sizes[size]} ${className}`}
    >
      {user?.profileImage ? (
        <img
          alt=""
          className="h-full w-full object-cover"
          src={user.profileImage}
        />
      ) : (
        initialsFor(name)
      )}
    </div>
  )
}

export default Avatar
