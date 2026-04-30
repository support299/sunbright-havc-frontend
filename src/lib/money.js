export function fmt(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(n) || 0)
}

export function calcMonthly(principal, aprPercent, termMonths) {
  if (!termMonths || termMonths <= 0) return 0
  if (aprPercent === 0) return principal / termMonths
  const r = aprPercent / 100 / 12
  return (principal * r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1)
}

export function calcFinancedAmount(cashPrice, dealerFeePct) {
  return Number(cashPrice) * (1 + Number(dealerFeePct || 0) / 100)
}

export function calcEnergySavings(tons, oldSeer, newSeer, coolingHours, rate) {
  if (!tons || !oldSeer || !newSeer || !coolingHours || !rate || newSeer <= oldSeer) return null
  const oldKwh = ((tons * 12000) / oldSeer / 1000) * coolingHours
  const newKwh = ((tons * 12000) / newSeer / 1000) * coolingHours
  return {
    oldCost: oldKwh * rate,
    newCost: newKwh * rate,
    saveCost: (oldKwh - newKwh) * rate,
    saveKwh: oldKwh - newKwh,
    pct: oldKwh > 0 ? ((oldKwh - newKwh) / oldKwh) * 100 : 0,
  }
}
