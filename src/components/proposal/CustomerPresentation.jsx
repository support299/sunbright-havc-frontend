import { useState } from "react"
import { calcEnergySavings, calcFinancedAmount, calcMonthly, fmt } from "../../lib/money"
import { getTierCashTotal } from "../../lib/tierTotals"
import { IconBack, IconDollar, IconDownload, IconSun } from "./ProposalIcons"

export default function CustomerPresentation({
  proposal,
  catalog,
  financingPlans,
  profitMargin,
  financeLinks,
  coolingCities = [],
  utilityProviders = [],
  onBack,
}) {
  const [expandedFinancing, setExpandedFinancing] = useState(null)
  const [showApply, setShowApply] = useState(false)

  const catalogById = Object.fromEntries(catalog.map((c) => [c.id, c]))

  const getTierSystems = (tier) => {
    const zones = proposal.zones || []
    if (zones.length > 0) {
      return zones
        .map((zone, zi) => {
          const sysId = tier.systemIds?.[zi] ?? tier.systemIds?.[String(zi)] ?? (zi === 0 ? tier.systemId : "")
          return { zone, sys: catalogById[sysId] }
        })
        .filter((x) => x.sys)
    }
    const sys = catalogById[tier.systemId]
    return sys ? [{ zone: null, sys }] : []
  }

  const cashTotal = (tier) => getTierCashTotal(tier, proposal, catalogById, profitMargin)

  const getLowestPlan = (cashPrice) => {
    let lowest = { monthly: Infinity, plan: null }
    financingPlans.forEach((plan) => {
      const financed = calcFinancedAmount(cashPrice, plan.dealerFee)
      const mo = calcMonthly(financed, plan.apr, plan.term)
      if (mo < lowest.monthly) lowest = { monthly: mo, plan }
    })
    return lowest
  }

  const activeTiers = proposal.tiers.filter((t) => {
    if (t.enabled === false) return false
    const sys = getTierSystems(t)
    return sys.length > 0
  })

  if (showApply) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <div className="no-print flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-secondary)] px-6 py-3">
          <button type="button" onClick={() => setShowApply(false)} className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)]">
            <IconBack /> Back to Proposal
          </button>
        </div>
        <div className="mx-auto max-w-2xl px-6 py-10 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <IconSun />
            <span className="font-['Outfit'] text-xl font-extrabold">Sunbright HVAC</span>
          </div>
          <h1 className="font-['Outfit'] text-2xl font-bold">Apply for Financing</h1>
          <p className="mt-2 text-[var(--text-secondary)]">Choose your preferred lender below to begin your application</p>
          <div className="mt-8 space-y-4 text-left">
            {(financeLinks || []).length === 0 ? (
              <p className="text-center text-[var(--text-muted)]">Finance applications are not yet configured.</p>
            ) : (
              financeLinks.map((link) => {
                const hasUrl = !!link.url
                const Wrapper = hasUrl ? "a" : "div"
                const wrapProps = hasUrl ? { href: link.url, target: "_blank", rel: "noopener noreferrer" } : {}
                return (
                  <Wrapper
                    key={link.id}
                    {...wrapProps}
                    className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 transition-colors hover:border-[var(--accent)]"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[color:var(--accent)_/_0.15]">
                      <IconDollar />
                    </div>
                    <div className="flex-1">
                      <div className="font-['Outfit'] text-lg font-bold">{link.label}</div>
                      <div className="text-sm text-[var(--text-secondary)]">{link.description}</div>
                    </div>
                    {hasUrl ? (
                      <span className="shrink-0 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-[#0f1117]">Apply Now →</span>
                    ) : (
                      <span className="shrink-0 rounded-xl border border-[var(--border)] px-4 py-2 text-xs text-[var(--text-muted)]">Ask Your Rep</span>
                    )}
                  </Wrapper>
                )
              })
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pb-16">
      <div className="no-print flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--bg-secondary)] px-6 py-3">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)]">
          <IconBack /> Back to Editor
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#F5B731_0%,#E8A020_100%)] px-6 py-2.5 text-sm font-semibold text-[#0a0c14] shadow-[0_2px_12px_rgba(245,183,49,0.25)]"
        >
          <IconDownload /> Save as PDF
        </button>
      </div>

      <header className="mx-auto max-w-5xl px-6 pb-8 pt-10 text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          <IconSun />
          <span className="font-['Outfit'] text-xl font-extrabold">Sunbright HVAC</span>
        </div>
        <h1 className="font-['Outfit'] text-3xl font-bold">
          {proposal.customerName ? `${proposal.customerName}'s Comfort Options` : "Your Comfort Options"}
        </h1>
        <p className="mt-2 text-[var(--text-secondary)]">{proposal.customerAddress || "Customized for you"}</p>
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          Prepared{" "}
          {proposal.createdAt
            ? new Date(proposal.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
            : new Date().toLocaleDateString()}
        </p>
      </header>

      <div className="customer-tiers mx-auto flex max-w-5xl flex-col gap-8 px-6">
        {activeTiers.map((tier, idx) => {
          const tierSystems = getTierSystems(tier)
          if (tierSystems.length === 0) return null
          const cashPrice = cashTotal(tier)
          const { monthly, plan: lowestPlan } = getLowestPlan(cashPrice)
          const selectedPlan =
            financingPlans.find((p) => String(p.id) === String(tier.selectedFinancePlan)) || lowestPlan
          const selectedFinanced = calcFinancedAmount(cashPrice, selectedPlan?.dealerFee ?? 0)
          const selectedMonthly = calcMonthly(selectedFinanced, selectedPlan?.apr ?? 0, selectedPlan?.term ?? 1)
          const enabledItems = [...tier.items.filter((i) => i.enabled), ...(tier.customItems || [])]

          const city =
            coolingCities.find((c) => c.name === proposal.selectedCity) || coolingCities[0]
          const utility =
            utilityProviders.find((u) => u.name === proposal.selectedUtilityRate) || utilityProviders[0]
          const rate = utility ? Number(utility.rate_per_kwh) : 0
          const coolingHours = city ? Number(city.cooling_hours) : 0
          const currentSeer = proposal.currentSeer || 10
          const primarySys = tierSystems[0]?.sys
          const newSeer = primarySys ? parseFloat(primarySys.seer2) || 16 : 16
          const totalTons = tierSystems.reduce((sum, ts) => sum + (parseFloat(ts.sys.size) || 3), 0)
          const savings =
            city && utility
              ? calcEnergySavings(totalTons, currentSeer, newSeer, coolingHours, rate)
              : null

          return (
            <section
              key={tier.name}
              className={`customer-tier overflow-hidden rounded-2xl border ${
                tier.name === "Premier"
                  ? "border-[color:var(--accent)_/_0.35] shadow-[0_0_80px_rgba(245,183,49,0.05)]"
                  : "border-[var(--border)]"
              } bg-[linear-gradient(165deg,#16182400_0%,#13151f_100%)]`}
            >
              <div
                className={`relative border-b border-[var(--border)] px-8 py-8 text-center ${
                  tier.name === "Premier" ? "bg-[linear-gradient(160deg,rgba(245,183,49,0.1)_0%,rgba(245,183,49,0.02)_40%,transparent_100%)]" : ""
                }`}
              >
                {tier.name === "Premier" && (
                  <div className="absolute right-4 top-4 rounded-full bg-[linear-gradient(135deg,#F5B731_0%,#E8A020_100%)] px-3 py-1 text-[10px] font-bold uppercase text-[#0a0c14]">
                    ★ Recommended
                  </div>
                )}
                <div className="font-['Outfit'] text-2xl font-bold">{tier.name}</div>
                <div className="mt-4 font-['Outfit'] text-4xl font-extrabold text-[var(--accent)]">{fmt(monthly)}</div>
                <div className="text-sm text-[var(--text-muted)]">per month · as low as</div>
                <div className="mt-4 text-[var(--text-secondary)]">
                  or <strong className="text-[var(--text-primary)]">{fmt(cashPrice)}</strong> cash
                  {tier.multiplier < 1 && (
                    <span className="ml-2 text-sm font-semibold text-[var(--green)]">{Math.round((1 - tier.multiplier) * 100)}% discount applied</span>
                  )}
                </div>
              </div>

              <div className="space-y-6 px-8 py-8">
                {tierSystems.some((ts) => ts.sys.image) && (
                  <div className="flex flex-wrap justify-center gap-3">
                    {tierSystems
                      .filter((ts) => ts.sys.image)
                      .map((ts, si) => (
                        <img key={si} src={ts.sys.image} alt="" className="max-h-[120px] max-w-[45%] object-contain" />
                      ))}
                  </div>
                )}

                {tierSystems.map((ts, si) => (
                  <div key={si} className="text-center">
                    {ts.zone && tierSystems.length > 1 && (
                      <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[var(--accent)]">{ts.zone.label}</div>
                    )}
                    <div className="font-['Outfit'] text-lg font-semibold">
                      {ts.sys.brand} {ts.sys.model}
                    </div>
                    <div className="mt-1 flex flex-wrap justify-center gap-3 text-xs text-[var(--text-muted)]">
                      <span>{ts.sys.size}</span>
                      <span>SEER2: {ts.sys.seer2}</span>
                      <span>{ts.sys.type}</span>
                      <span>{ts.sys.warranty}</span>
                    </div>
                  </div>
                ))}

                <div>
                  <h4 className="mb-3 font-['Outfit'] font-semibold">What&apos;s Included</h4>
                  <ul className="space-y-2">
                    {enabledItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                        <span className="mt-0.5 text-[var(--accent)]">✓</span>
                        <span>{item.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {savings && savings.saveCost > 0 && (
                  <div className="rounded-xl border border-[color:var(--green)_/_0.12] bg-[rgba(52,211,153,0.06)] p-4">
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-wide text-[var(--green)]">
                      <span>Estimated Annual Savings</span>
                      <span className="text-[var(--text-muted)]">vs {currentSeer} SEER</span>
                    </div>
                    <div className="mt-2 font-['Outfit'] text-3xl font-extrabold text-[var(--green)]">${Math.round(savings.saveCost)}</div>
                    <div className="text-xs text-[var(--text-muted)]">per year</div>
                    <p className="mt-3 text-center text-[9px] text-[var(--text-muted)]">
                      Based on {city?.name ?? "—"} ({coolingHours.toLocaleString()} cooling hrs) · {utility?.name ?? proposal.selectedUtilityRate}{" "}
                      ${rate.toFixed(3)}/kWh
                    </p>
                  </div>
                )}

                <div className="ct-financing">
                  <h4 className="mb-3 font-['Outfit'] font-semibold">Financing Options</h4>
                  <button
                    type="button"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-4 text-left"
                    onClick={() => setExpandedFinancing(expandedFinancing === idx ? null : idx)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold">
                          {selectedPlan?.vendor}: {selectedPlan?.name}
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          {selectedPlan?.term} months · {selectedPlan?.apr}% APR
                        </div>
                      </div>
                      <div className="shrink-0 font-bold text-[var(--accent)]">{fmt(selectedMonthly)}/mo</div>
                    </div>
                    <div className="mt-2 text-center text-xs text-[var(--text-muted)]">
                      {expandedFinancing === idx ? "▲ Hide plans" : "▼ View all financing plans"}
                    </div>
                  </button>
                  {expandedFinancing === idx && (
                    <div className="mt-2 max-h-72 overflow-y-auto rounded-xl border border-[var(--border)]">
                      {financingPlans.map((plan) => {
                        const fa = calcFinancedAmount(cashPrice, plan.dealerFee)
                        const mo = calcMonthly(fa, plan.apr, plan.term)
                        return (
                          <div key={plan.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] px-4 py-3 text-sm last:border-0">
                            <div>
                              <div className="font-medium">
                                {plan.vendor}: {plan.name}
                              </div>
                              <div className="text-[11px] text-[var(--text-muted)]">
                                {plan.term}mo · {plan.apr}% APR
                                {plan.fico ? ` · Min FICO: ${plan.fico}` : ""}
                              </div>
                            </div>
                            <div className="font-bold text-[var(--accent)]">{fmt(mo)}/mo</div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )
        })}
      </div>

      <div className="no-print mx-auto mt-12 max-w-5xl px-6 text-center">
        <button
          type="button"
          onClick={() => setShowApply(true)}
          className="inline-flex items-center gap-3 rounded-2xl border-2 border-[var(--accent)] bg-[linear-gradient(135deg,var(--accent)_0%,#E8A020_100%)] px-12 py-4 font-['Outfit'] text-lg font-bold text-[#0f1117] shadow-[0_4px_24px_rgba(245,183,49,0.3)]"
        >
          <IconDollar /> Apply for Financing
        </button>
        <p className="mt-3 text-xs text-[var(--text-muted)]">Pre-qualify in minutes — subject to lender approval</p>
      </div>

      <footer className="disclaimer mx-auto mt-12 max-w-5xl px-6 text-[11px] leading-relaxed text-[var(--text-muted)]">
        *All pricing is subject to approved credit. Monthly payments are estimates based on the selected financing plan.
        Actual terms may vary. Sunbright HVAC® — For a Brighter Tomorrow.
      </footer>
    </div>
  )
}
