import { Navigate } from "react-router-dom"
import { useMeQuery } from "../features/auth/authApi"

export default function RequireAdmin({ children }) {
  const { data: me } = useMeQuery()

  if (me?.role !== "admin") {
    return <Navigate to="/app/hub" replace />
  }

  return children
}
