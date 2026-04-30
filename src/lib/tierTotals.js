import { calcFinancedAmount, calcMonthly } from "./money"

function zoneSystemId(tier, zi) {
  const ids = tier.systemIds || {}
  return ids[zi] ?? ids[String(zi)] ?? (zi === 0 ? tier.systemId : "")
}

export function getTierCashTotal(tier, proposal, catalogById, profitMarginPct) {
  const zones = proposal.zones || []
  let systemBaseTotal = 0
  if (zones.length > 0) {
    zones.forEach((zone, zi) => {
      const sysId = zoneSystemId(tier, zi)
      const sys = catalogById[sysId]
      if (sys) systemBaseTotal += sys.basePrice
    })
  } else {
    const sys = catalogById[tier.systemId]
    if (sys) systemBaseTotal = sys.basePrice
  }
  if (systemBaseTotal === 0) return 0
  const cogsTotal = tier.items.filter((i) => i.enabled && i.category === "cogs").reduce((s, i) => s + i.cost, 0)
  const addonTotal = tier.items.filter((i) => i.enabled && i.category === "addon").reduce((s, i) => s + i.cost, 0)
  const customTotal = (tier.customItems || []).reduce((s, i) => s + (i.cost || 0), 0)
  const markedUpCogs = (systemBaseTotal + cogsTotal) * (1 + (profitMarginPct || 40) / 100)
  return (markedUpCogs + addonTotal + customTotal) * (tier.multiplier || 1)
}

export function getLowestMonthlyForTier(tier, proposal, catalogById, profitMarginPct, financingPlans) {
  const cash = getTierCashTotal(tier, proposal, catalogById, profitMarginPct)
  if (!cash) return 0
  let lowest = Infinity
  financingPlans.forEach((plan) => {
    const financed = calcFinancedAmount(cash, plan.dealerFee)
    const monthly = calcMonthly(financed, plan.apr, plan.term)
    if (monthly < lowest) lowest = monthly
  })
  return lowest === Infinity ? 0 : lowest
}
