import { Link, useNavigate } from "react-router-dom"
import { useCreateProposalMutation, useGetProposalsQuery } from "../features/dashboard/dashboardApi"

export default function ProposalsPage() {
  const navigate = useNavigate()
  const { data: proposals = [], isLoading } = useGetProposalsQuery()
  const [createProposal, { isLoading: creating }] = useCreateProposalMutation()

  const handleNew = async () => {
    const created = await createProposal({
      customer_name: "New proposal",
      customer_address: "",
      zones: [],
      tiers: [],
      status: "open",
    }).unwrap()
    navigate(`/app/proposals/${created.id}/edit`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-['Outfit'] text-2xl font-bold">Proposals</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Create and manage customer proposals</p>
        </div>
        <button
          type="button"
          disabled={creating}
          onClick={handleNew}
          className="rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[#0f1117] shadow-[0_2px_12px_rgba(245,183,49,0.25)] hover:brightness-105 disabled:opacity-50"
        >
          {creating ? "Creating…" : "+ New proposal"}
        </button>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--bg-secondary)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              <tr>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Address</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Rep</th>
                <th className="px-5 py-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-[var(--text-muted)]">
                    Loading…
                  </td>
                </tr>
              ) : proposals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-[var(--text-muted)]">
                    No proposals yet. Click &quot;New proposal&quot; to start.
                  </td>
                </tr>
              ) : (
                proposals.map((p) => (
                  <tr
                    key={p.id}
                    className="cursor-pointer border-t border-[var(--border)] hover:bg-[color:white_/_0.02]"
                    onClick={() => navigate(`/app/proposals/${p.id}/edit`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") navigate(`/app/proposals/${p.id}/edit`)
                    }}
                  >
                    <td className="px-5 py-4 font-medium">{p.customer_name || "Untitled"}</td>
                    <td className="px-5 py-4 text-[var(--text-secondary)]">{p.customer_address || "—"}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-[var(--bg-secondary)] px-2 py-1 text-[10px] font-bold uppercase tracking-wide">
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">{p.created_by_name}</td>
                    <td className="px-5 py-4 text-[var(--text-muted)]">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-[var(--text-muted)]">
        Open a row to edit zones, tiers, pricing, and customer preview — same flow as the PDF tool.{" "}
        <Link to="/app/hub" className="text-[var(--accent)] hover:underline">
          Hub
        </Link>
      </p>
    </div>
  )
}
