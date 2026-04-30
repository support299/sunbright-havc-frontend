import { useMemo } from "react"
import { Link } from "react-router-dom"
import StatCard from "../components/StatCard"
import {
  useGetFinanceLinksQuery,
  useGetFinancePlansQuery,
  useGetIncludedItemsQuery,
  useGetProductsQuery,
  useGetProposalsQuery,
  useGetCatalogReferenceQuery,
} from "../features/dashboard/dashboardApi"
import { useMeQuery } from "../features/auth/authApi"
import { mapProduct } from "../lib/catalogMaps"
import { fmt } from "../lib/money"
import {
  buildCatalogById,
  endOfDay,
  leaderboardByRep,
  startOfMonth,
  startOfWeekMonday,
  startOfYear,
  sumWonRevenueInRange,
  winsPerWeekDay,
} from "../lib/hubMetrics"

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export default function HubPage() {
  const { data: me } = useMeQuery()
  const isAdmin = me?.role === "admin"
  const { data: products = [] } = useGetProductsQuery()
  const { data: items = [] } = useGetIncludedItemsQuery()
  const { data: plans = [] } = useGetFinancePlansQuery()
  const { data: links = [] } = useGetFinanceLinksQuery()
  const { data: proposals = [] } = useGetProposalsQuery()
  const { data: reference } = useGetCatalogReferenceQuery()

  const profitMargin = reference?.default_profit_margin_pct ?? 40

  const catalogById = useMemo(() => buildCatalogById(products.map(mapProduct)), [products])

  const metrics = useMemo(() => {
    const now = new Date()
    const ws = startOfWeekMonday(now)
    const ms = startOfMonth(now)
    const ys = startOfYear(now)
    const cap = endOfDay(now)

    const won = proposals.filter((p) => p.status === "won").length
    const lost = proposals.filter((p) => p.status === "lost").length
    const open = proposals.filter((p) => p.status === "open").length
    const closed = won + lost
    const winRate = closed > 0 ? Math.round((won / closed) * 1000) / 10 : 0

    const revWTD = sumWonRevenueInRange(proposals, catalogById, profitMargin, ws, cap)
    const revMTD = sumWonRevenueInRange(proposals, catalogById, profitMargin, ms, cap)
    const revYTD = sumWonRevenueInRange(proposals, catalogById, profitMargin, ys, cap)

    const lb = leaderboardByRep(proposals, catalogById, profitMargin, ws, cap)
    const weekCounts = winsPerWeekDay(proposals, now)

    return {
      won,
      lost,
      open,
      winRate,
      revWTD,
      revMTD,
      revYTD,
      leaderboard: lb,
      weekCounts,
      weekStart: ws,
    }
  }, [proposals, catalogById, profitMargin])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-['Outfit'] text-2xl font-bold">Proposals Hub</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Pipeline, revenue (won tier totals), win rate — aligned with proposal builder math
        </p>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard title="Open" value={metrics.open} tone="blue" />
        <StatCard title="Won" value={metrics.won} tone="green" />
        <StatCard title="Lost" value={metrics.lost} tone="red" />
        <StatCard title="Win rate" value={`${metrics.winRate}%`} />
        <StatCard title="Products" value={products.length} tone="blue" />
        <StatCard title="Finance plans" value={plans.length} />
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Revenue WTD</p>
          <p className="mt-1 font-['Outfit'] text-2xl font-bold text-[var(--accent)]">{fmt(metrics.revWTD)}</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Won proposals (selected tier cash total)</p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Revenue MTD</p>
          <p className="mt-1 font-['Outfit'] text-2xl font-bold">{fmt(metrics.revMTD)}</p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Revenue YTD</p>
          <p className="mt-1 font-['Outfit'] text-2xl font-bold">{fmt(metrics.revYTD)}</p>
        </div>
      </section>

      <section className="card p-5">
        <h3 className="font-['Outfit'] text-lg font-semibold">This week</h3>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Wins logged by <span className="text-[var(--text-secondary)]">won date</span> (Mon–Sun)
        </p>
        <div className="mt-4 grid grid-cols-7 gap-2 text-center">
          {WEEKDAY_LABELS.map((label, i) => (
            <div key={label} className="rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
              <p className="mt-2 font-['Outfit'] text-xl font-bold text-[var(--accent)]">{metrics.weekCounts[i]}</p>
              <p className="mt-1 text-[10px] text-[var(--text-muted)]">wins</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {isAdmin && (
          <div className="card p-5">
            <h3 className="font-['Outfit'] text-lg font-semibold">Rep leaderboard</h3>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Won revenue · week to date ({fmt(metrics.revWTD)} team)</p>
            <div className="mt-4 overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-[var(--text-muted)]">
                  <tr>
                    <th className="pb-2 text-[10px] font-bold uppercase tracking-wider">Rep</th>
                    <th className="pb-2 text-[10px] font-bold uppercase tracking-wider">Won</th>
                    <th className="pb-2 text-right text-[10px] font-bold uppercase tracking-wider">Rev</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.leaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-[var(--text-muted)]">
                        No wins this week yet.
                      </td>
                    </tr>
                  ) : (
                    metrics.leaderboard.map((row) => (
                      <tr key={row.rep} className="border-t border-[var(--border)]">
                        <td className="py-2 font-medium">{row.rep}</td>
                        <td className="py-2">{row.won}</td>
                        <td className="py-2 text-right font-semibold text-[var(--accent)]">{fmt(row.revenue)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className={`card p-5 ${isAdmin ? "" : "lg:col-span-2"}`}>
          <h3 className="font-['Outfit'] text-lg font-semibold">Finance links</h3>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Configured lender application URLs</p>
          <div className="mt-4 space-y-3">
            {links.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No finance links yet. Add them in Admin.</p>
            ) : (
              links.map((link) => (
                <div key={link.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-4">
                  <p className="font-medium">{link.label}</p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{link.description}</p>
                  {link.url ? (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-xs font-semibold text-[var(--accent)] hover:underline"
                    >
                      Open link →
                    </a>
                  ) : (
                    <p className="mt-2 text-xs text-[var(--text-muted)]">No URL configured</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-['Outfit'] text-lg font-semibold">Reference data</h3>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {items.length} included item templates · cities & utilities via{" "}
                <code className="text-[10px] text-[var(--accent)]">GET /catalog/reference/</code>
              </p>
            </div>
            <Link to="/app/admin" className="text-xs font-semibold text-[var(--accent)] hover:underline">
              Admin →
            </Link>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-['Outfit'] text-lg font-semibold">Recent proposals</h3>
          <div className="mt-4 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[var(--text-muted)]">
                <tr>
                  <th className="pb-3 text-[10px] font-bold uppercase tracking-wider">Customer</th>
                  <th className="pb-3 text-[10px] font-bold uppercase tracking-wider">Status</th>
                  <th className="pb-3 text-[10px] font-bold uppercase tracking-wider">Rep</th>
                </tr>
              </thead>
              <tbody>
                {proposals.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-10 text-center text-[var(--text-muted)]">
                      No proposals yet.{" "}
                      <Link className="text-[var(--accent)] underline" to="/app/proposals">
                        Create one
                      </Link>
                    </td>
                  </tr>
                ) : (
                  proposals.slice(0, 8).map((proposal) => (
                    <tr key={proposal.id} className="border-t border-[var(--border)]">
                      <td className="py-3 font-medium">
                        <Link className="hover:text-[var(--accent)]" to={`/app/proposals/${proposal.id}/edit`}>
                          {proposal.customer_name || "Untitled"}
                        </Link>
                      </td>
                      <td className="py-3">
                        <span className="rounded-full bg-[var(--bg-secondary)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--text-secondary)]">
                          {proposal.status}
                        </span>
                      </td>
                      <td className="py-3 text-[var(--text-secondary)]">{proposal.created_by_name}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
