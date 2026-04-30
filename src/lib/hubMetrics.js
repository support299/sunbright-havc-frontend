import { apiProposalToUi } from "./proposalMapper"
import { getTierCashTotal } from "./tierTotals"

export function buildCatalogById(mappedProducts) {
  return Object.fromEntries(mappedProducts.map((c) => [c.id, c]))
}

export function wonRevenueForProposal(proposal, catalogById, profitMarginPct) {
  const ui = apiProposalToUi(proposal)
  if (!ui || ui.status !== "won") return 0
  const idx = ui.selectedTierIdx != null && ui.selectedTierIdx >= 0 ? ui.selectedTierIdx : 0
  const tier = ui.tiers?.[idx]
  if (!tier) return 0
  return getTierCashTotal(tier, ui, catalogById, profitMarginPct)
}

export function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export function startOfWeekMonday(d) {
  const x = startOfDay(d)
  const day = x.getDay()
  const diff = day === 0 ? -6 : 1 - day
  x.setDate(x.getDate() + diff)
  return x
}

export function startOfMonth(d) {
  const x = startOfDay(d)
  x.setDate(1)
  return x
}

export function startOfYear(d) {
  const x = startOfDay(d)
  x.setMonth(0, 1)
  return x
}

export function endOfDay(d) {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

export function addDays(d, n) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

export function isSameCalendarDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function sumWonRevenueInRange(proposals, catalogById, profitMarginPct, start, end) {
  let sum = 0
  proposals.forEach((p) => {
    if (p.status !== "won") return
    const wd = p.won_date ? new Date(p.won_date) : null
    if (!wd || wd < start || wd > end) return
    sum += wonRevenueForProposal(p, catalogById, profitMarginPct)
  })
  return sum
}

export function leaderboardByRep(proposals, catalogById, profitMarginPct, start, end) {
  const map = new Map()
  proposals.forEach((p) => {
    if (p.status !== "won") return
    const wd = p.won_date ? new Date(p.won_date) : null
    if (!wd || wd < start || wd > end) return
    const rep = p.created_by_name || "Unknown"
    const prev = map.get(rep) || { won: 0, revenue: 0 }
    prev.won += 1
    prev.revenue += wonRevenueForProposal(p, catalogById, profitMarginPct)
    map.set(rep, prev)
  })
  return [...map.entries()]
    .map(([rep, v]) => ({ rep, won: v.won, revenue: v.revenue }))
    .sort((a, b) => b.revenue - a.revenue)
}

/** Wins per calendar day for Mon–Sun week containing `anchor` */
export function winsPerWeekDay(proposals, anchor = new Date()) {
  const weekStart = startOfWeekMonday(anchor)
  const weekEnd = startOfDay(addDays(weekStart, 6))
  const counts = [0, 0, 0, 0, 0, 0, 0]
  proposals.forEach((p) => {
    if (p.status !== "won" || !p.won_date) return
    const wd = startOfDay(new Date(p.won_date))
    if (wd < weekStart || wd > weekEnd) return
    const dayIdx = Math.round((wd.getTime() - weekStart.getTime()) / 86400000)
    if (dayIdx >= 0 && dayIdx <= 6) counts[dayIdx] += 1
  })
  return counts
}
