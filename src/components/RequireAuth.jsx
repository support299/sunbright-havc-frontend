import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useMeQuery } from "../features/auth/authApi"

export default function RequireAuth() {
  const { data: me, isLoading, isError } = useMeQuery()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-sm text-[var(--text-muted)]">
        Loading…
      </div>
    )
  }

  if (isError || !me) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
