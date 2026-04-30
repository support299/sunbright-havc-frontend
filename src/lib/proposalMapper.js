/**
 * UI proposal shape follows the PDF prototype (camelCase, tiers embed line items).
 */

export function apiProposalToUi(a) {
  if (!a) return null
  const meta = a.metadata || {}
  return {
    id: a.id,
    customerName: a.customer_name || "",
    customerAddress: a.customer_address || "",
    zones: Array.isArray(a.zones) ? a.zones : [],
    selectedTonnage: meta.selectedTonnage || "",
    currentSeer: a.current_seer != null ? Number(a.current_seer) : 10,
    selectedCity: a.selected_city ?? "",
    selectedUtilityRate: a.selected_utility_rate ?? "",
    status: a.status || "open",
    selectedTierIdx: a.selected_tier_index,
    wonDate: a.won_date,
    lostDate: a.lost_date,
    tiers: Array.isArray(a.tiers) ? a.tiers : [],
    metadata: meta,
    createdAt: a.created_at,
    createdBy: a.created_by_name,
  }
}

export function uiProposalToApi(p) {
  return {
    customer_name: p.customerName || "",
    customer_address: p.customerAddress || "",
    zones: p.zones || [],
    tiers: p.tiers || [],
    current_seer: p.currentSeer ?? 10,
    selected_city: p.selectedCity || "",
    selected_utility_rate: p.selectedUtilityRate || "",
    status: p.status || "open",
    selected_tier_index: p.selectedTierIdx ?? null,
    metadata: {
      ...(p.metadata || {}),
      selectedTonnage: p.selectedTonnage || "",
    },
  }
}
