import { NavLink, Outlet } from "react-router-dom"
import { useLogoutMutation, useMeQuery } from "../features/auth/authApi"

const linkClass =
  "rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--bg-card)] hover:text-[var(--accent)]"
const activeClass =
  "rounded-lg px-4 py-2 text-sm font-medium border border-[color:var(--accent)_/_0.35] bg-[color:var(--accent)_/_0.12] text-[var(--accent)]"

export default function AppShell() {
  const { data: me } = useMeQuery()
  const [logout] = useLogoutMutation()
  const isAdmin = me?.role === "admin"

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-secondary)] shadow-[0_1px_0_0_rgba(245,183,49,0.04)]">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-7 py-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="font-['Outfit'] text-xl font-bold tracking-tight">Sunbright HVAC</h1>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--accent)]">
                Proposal Platform
              </p>
            </div>
            <nav className="flex flex-wrap items-center gap-1 md:gap-2">
              <NavLink end to="/app/hub" className={({ isActive }) => (isActive ? activeClass : linkClass)}>
                Hub
              </NavLink>
              <NavLink to="/app/proposals" className={({ isActive }) => (isActive ? activeClass : linkClass)}>
                Proposals
              </NavLink>
              {isAdmin && (
                <NavLink to="/app/admin" className={({ isActive }) => (isActive ? activeClass : linkClass)}>
                  Admin
                </NavLink>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-primary)]">{me?.username}</span>
              <span className="mx-2 text-[var(--text-muted)]">·</span>
              <span className="rounded bg-[var(--bg-card)] px-2 py-0.5 text-xs capitalize text-[var(--text-muted)]">
                {me?.role === "admin" ? "Admin" : "Rep"}
              </span>
            </span>
            <button
              type="button"
              onClick={() => logout()}
              className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-7 py-7">
        <Outlet />
      </main>
    </div>
  )
}
