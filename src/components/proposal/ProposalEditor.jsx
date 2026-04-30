import { useMemo } from "react"
import { calcFinancedAmount, calcMonthly, fmt } from "../../lib/money"
import { getTierCashTotal } from "../../lib/tierTotals"
import CustomItemAdder from "./CustomItemAdder"
import { IconBack, IconCheck, IconEye, IconTrash } from "./ProposalIcons"

export default function ProposalEditor({
  proposal,
  catalog,
  financingPlans,
  profitMargin,
  coolingCities = [],
  utilityProviders = [],
  onChange,
  onSave,
  onPreview,
  onBack,
  onChangeTonnage,
}) {
  const catalogById = useMemo(() => Object.fromEntries(catalog.map((c) => [c.id, c])), [catalog])

  const upd = (updates) => onChange({ ...proposal, ...updates })

  const updTier = (idx, updates) => {
    const tiers = [...proposal.tiers]
    tiers[idx] = { ...tiers[idx], ...updates }
    onChange({ ...proposal, tiers })
  }

  const cashForTier = (tier) => getTierCashTotal(tier, proposal, catalogById, profitMargin)

  const lowestMonthly = (tier) => {
    const cashPrice = cashForTier(tier)
    if (!cashPrice) return 0
    let lowest = Infinity
    financingPlans.forEach((plan) => {
      const financed = calcFinancedAmount(cashPrice, plan.dealerFee)
      const monthly = calcMonthly(financed, plan.apr, plan.term)
      if (monthly < lowest) lowest = monthly
    })
    return lowest === Infinity ? 0 : lowest
  }

  const zoneRows =
    proposal.zones?.length > 0
      ? proposal.zones
      : [{ id: "default", label: "System", tonnage: proposal.selectedTonnage }]

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--accent)]"
        >
          <IconBack /> Back
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-['Outfit'] text-[22px] font-bold">
            {proposal.customerName || "New Proposal"}
          </h2>
        </div>
        {(proposal.zones?.length > 0 || proposal.selectedTonnage) && (
          <button
            type="button"
            onClick={onChangeTonnage}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[linear-gradient(145deg,#1a1d2a_0%,#13151f_100%)] px-3 py-2 text-xs text-[var(--text-primary)] hover:border-[var(--accent)]"
          >
            <span className="font-bold text-[var(--accent)]">
              {proposal.zones?.length > 1 ? `${proposal.zones.length} Systems` : proposal.selectedTonnage}
            </span>
            Change
          </button>
        )}
        <button
          type="button"
          onClick={onSave}
          className="rounded-lg border border-[var(--border)] bg-[linear-gradient(145deg,#1a1d2a_0%,#13151f_100%)] px-4 py-2 text-sm font-semibold hover:border-[var(--accent)]"
        >
          Save Draft
        </button>
        <button
          type="button"
          onClick={onPreview}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#0f1117] shadow-[0_2px_12px_rgba(245,183,49,0.25)]"
        >
          <IconEye /> Preview
        </button>
      </div>

      <div className="card mb-5 p-6">
        <span className="font-['Outfit'] text-base font-semibold">Customer Information</span>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Customer Name</span>
            <input
              className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
              value={proposal.customerName}
              onChange={(e) => upd({ customerName: e.target.value })}
              placeholder="John & Jane Smith"
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Address</span>
            <input
              className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
              value={proposal.customerAddress}
              onChange={(e) => upd({ customerAddress: e.target.value })}
              placeholder="123 Main St, Deltona, FL"
            />
          </label>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Current System SEER</span>
            <select
              className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
              value={proposal.currentSeer ?? 10}
              onChange={(e) => upd({ currentSeer: parseInt(e.target.value, 10) })}
            >
              {Array.from({ length: 14 }, (_, i) => i + 8).map((s) => (
                <option key={s} value={s}>
                  {s} SEER
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Nearest City</span>
            <select
              className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
              value={proposal.selectedCity ?? ""}
              onChange={(e) => upd({ selectedCity: e.target.value })}
            >
              <option value="">Select city…</option>
              {coolingCities.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({Number(c.cooling_hours).toLocaleString()}h)
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Utility Provider</span>
            <select
              className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
              value={proposal.selectedUtilityRate ?? ""}
              onChange={(e) => upd({ selectedUtilityRate: e.target.value })}
            >
              <option value="">Select utility…</option>
              {utilityProviders.map((u) => (
                <option key={u.id} value={u.name}>
                  {u.name} (${Number(u.rate_per_kwh).toFixed(3)}/kWh)
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        {proposal.tiers.map((tier, idx) => {
          const cashPrice = cashForTier(tier)
          const selectedPlan =
            financingPlans.find((p) => String(p.id) === String(tier.selectedFinancePlan)) || financingPlans[0]
          const financedAmount = calcFinancedAmount(cashPrice, selectedPlan?.dealerFee ?? 0)
          const monthly = calcMonthly(financedAmount, selectedPlan?.apr ?? 0, selectedPlan?.term ?? 1)

          return (
            <div
              key={tier.name}
              className={`tier-card flex flex-col overflow-hidden rounded-2xl border ${
                tier.name === "Premier"
                  ? "border-[color:var(--accent)_/_0.35] shadow-[0_0_0_1px_rgba(245,183,49,0.1),0_8px_40px_rgba(245,183,49,0.1)]"
                  : "border-[var(--border)]"
              } bg-[linear-gradient(165deg,#16182400_0%,#13151f_100%)]`}
            >
              <div
                className={`relative border-b border-[var(--border)] px-5 py-5 ${
                  tier.name === "Premier" ? "bg-[linear-gradient(160deg,rgba(245,183,49,0.1)_0%,rgba(245,183,49,0.02)_40%,transparent_100%)]" : ""
                }`}
              >
                {tier.name === "Premier" && (
                  <div className="absolute right-3 top-3 rounded-full bg-[var(--accent)] px-3 py-1 text-[10px] font-bold uppercase text-[#0a0c14]">
                    ★ Recommended
                  </div>
                )}
                <div className="font-['Outfit'] text-lg font-bold">{tier.name}</div>
                {cashPrice > 0 && selectedPlan && (
                  <div className="mt-2">
                    <div className="font-['Outfit'] text-2xl font-extrabold text-[var(--accent)]">
                      {fmt(monthly)}
                      <span className="text-sm font-normal text-[var(--text-muted)]">/mo</span>
                    </div>
                    <div className="mt-1 text-xs text-[var(--text-muted)]">{selectedPlan.name}</div>
                    <div className="mt-1 text-xs text-[var(--text-muted)]">Cash: {fmt(cashPrice)}</div>
                    <div className="mt-1 text-[10px] text-[var(--text-muted)]">As low as {fmt(lowestMonthly(tier))}/mo</div>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
                {zoneRows.map((zone, zi) => {
                  const zoneSystemId =
                    proposal.zones?.length > 0
                      ? tier.systemIds?.[zi] ?? tier.systemIds?.[String(zi)] ?? ""
                      : tier.systemId
                  const zoneSys = catalogById[zoneSystemId]
                  return (
                    <div key={zone.id} className="mb-3">
                      <label className="block text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                        {proposal.zones?.length > 1 ? `${zone.label} (${zone.tonnage})` : `System${zone.tonnage ? ` (${zone.tonnage})` : ""}`}
                      </label>
                      <select
                        className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                        value={zoneSystemId}
                        onChange={(e) => {
                          if (proposal.zones?.length > 0) {
                            const newIds = { ...(tier.systemIds || {}) }
                            newIds[zi] = e.target.value
                            updTier(idx, { systemIds: newIds, systemId: newIds[0] || tier.systemId })
                          } else {
                            updTier(idx, { systemId: e.target.value })
                          }
                        }}
                      >
                        <option value="">Select a system...</option>
                        {catalog
                          .filter((s) => !zone.tonnage || s.size === zone.tonnage)
                          .map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.brand} {s.model} — {s.size} ({s.type})
                            </option>
                          ))}
                      </select>
                      {zoneSys && (
                        <div className="mt-2 rounded-lg bg-[var(--bg-primary)] p-2 text-[11px]">
                          <span className="font-semibold text-[var(--text-primary)]">
                            {zoneSys.brand} {zoneSys.model}
                          </span>
                          <span className="ml-2 text-[var(--text-muted)]">
                            {zoneSys.size} · SEER2: {zoneSys.seer2}
                          </span>
                          <span className="ml-2 font-semibold text-[var(--text-secondary)]">Base: {fmt(zoneSys.basePrice)}</span>
                        </div>
                      )}
                    </div>
                  )
                })}

                <div className="mb-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Discount Multiplier</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {[1, 0.95, 0.9, 0.85].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => updTier(idx, { multiplier: m })}
                        className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                          tier.multiplier === m
                            ? "border-[var(--accent)] bg-[color:var(--accent)_/_0.15] text-[var(--accent)]"
                            : "border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:border-[var(--accent)]"
                        }`}
                      >
                        {m === 1 ? "1.0x" : `${m}x`}
                        {m < 1 && <span className="opacity-70"> ({Math.round((1 - m) * 100)}% off)</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="min-h-0 flex-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Included Items</span>
                  <div className="mt-2 max-h-72 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-2">
                    <div className="border-b border-[var(--border)] pb-1 text-[10px] font-bold uppercase tracking-wide text-[var(--blue)]">COGS</div>
                    {tier.items
                      .filter((i) => i.category === "cogs")
                      .map((item) => {
                        const iIdx = tier.items.findIndex((i) => i.id === item.id)
                        return (
                          <button
                            type="button"
                            key={item.id}
                            onClick={() => {
                              const items = [...tier.items]
                              items[iIdx] = { ...items[iIdx], enabled: !items[iIdx].enabled }
                              updTier(idx, { items })
                            }}
                            className={`flex w-full items-center gap-2 border-b border-[var(--border)] py-2 text-left text-sm last:border-0 ${
                              !item.enabled ? "opacity-50" : ""
                            }`}
                          >
                            <span
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                                item.enabled ? "border-[var(--accent)] bg-[color:var(--accent)_/_0.2] text-[var(--accent)]" : "border-[var(--border)]"
                              }`}
                            >
                              {item.enabled ? <IconCheck /> : null}
                            </span>
                            <span className="flex-1">{item.name}</span>
                            <span className="text-xs text-[var(--text-muted)]">{fmt(item.cost)}</span>
                          </button>
                        )
                      })}
                    <div className="mt-2 border-b border-[var(--border)] pb-1 text-[10px] font-bold uppercase tracking-wide text-[var(--accent)]">
                      Add-ons
                    </div>
                    {tier.items
                      .filter((i) => i.category === "addon")
                      .map((item) => {
                        const iIdx = tier.items.findIndex((i) => i.id === item.id)
                        return (
                          <button
                            type="button"
                            key={item.id}
                            onClick={() => {
                              const items = [...tier.items]
                              items[iIdx] = { ...items[iIdx], enabled: !items[iIdx].enabled }
                              updTier(idx, { items })
                            }}
                            className={`flex w-full items-center gap-2 border-b border-[var(--border)] py-2 text-left text-sm last:border-0 ${
                              !item.enabled ? "opacity-50" : ""
                            }`}
                          >
                            <span
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                                item.enabled ? "border-[var(--accent)] bg-[color:var(--accent)_/_0.2] text-[var(--accent)]" : "border-[var(--border)]"
                              }`}
                            >
                              {item.enabled ? <IconCheck /> : null}
                            </span>
                            <span className="flex-1">{item.name}</span>
                            <span className="text-xs text-[var(--text-muted)]">{fmt(item.cost)}</span>
                          </button>
                        )
                      })}
                    {(tier.customItems || []).map((item, ciIdx) => (
                      <div key={ciIdx} className="flex items-center gap-2 border-b border-[var(--border)] py-2 text-sm last:border-0">
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-[var(--accent)] bg-[color:var(--accent)_/_0.2] text-[var(--accent)]">
                          <IconCheck />
                        </span>
                        <span className="flex-1 text-[var(--accent)]">{item.name}</span>
                        <span className="text-xs">{fmt(item.cost)}</span>
                        <button
                          type="button"
                          className="p-1 text-[var(--red)]"
                          onClick={() => {
                            const customItems = tier.customItems.filter((_, i) => i !== ciIdx)
                            updTier(idx, { customItems })
                          }}
                        >
                          <IconTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <CustomItemAdder
                  onAdd={(item) => {
                    updTier(idx, { customItems: [...(tier.customItems || []), item] })
                  }}
                />

                <label className="mt-4 block">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Finance Plan</span>
                  <select
                    className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                    value={String(tier.selectedFinancePlan)}
                    onChange={(e) => updTier(idx, { selectedFinancePlan: e.target.value })}
                  >
                    {financingPlans.map((plan) => {
                      const fa = calcFinancedAmount(cashPrice, plan.dealerFee)
                      const mo = cashPrice > 0 ? calcMonthly(fa, plan.apr, plan.term) : 0
                      return (
                        <option key={plan.id} value={plan.id}>
                          {plan.vendor}: {plan.name} — {cashPrice > 0 ? `${fmt(mo)}/mo` : "Select system first"}
                        </option>
                      )
                    })}
                  </select>
                </label>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
