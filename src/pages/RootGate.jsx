import { Navigate } from "react-router-dom"
import { useMeQuery } from "../features/auth/authApi"

export default function RootGate() {
  const { data: me, isLoading, isError } = useMeQuery()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-sm text-[var(--text-muted)]">
        Loading…
      </div>
    )
  }

  if (!isError && me) {
    return <Navigate to="/app/hub" replace />
  }

  return <Navigate to="/login" replace />
}
