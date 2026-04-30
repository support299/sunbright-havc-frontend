import { mapIncludedItem } from "./catalogMaps"

/**
 * @param {Array} includedItemsRaw - API included items
 * @param {Record<string, number[]>} tierDefaultItemIds - from backend proposal_defaults
 * @param {string} firstPlanId - financing plan id
 * @param {string[]} tierNames - ordered tier labels from /catalog/reference/
 */
export function buildInitialTiers(includedItemsRaw, tierDefaultItemIds, firstPlanId, tierNames) {
  const includedItems = includedItemsRaw.map(mapIncludedItem)
  if (!tierNames?.length) return []
  return tierNames.map((tierName) => {
    const defaults = tierDefaultItemIds?.[tierName] || []
    const defaultSet = new Set(defaults.map((x) => String(x)))
    return {
      name: tierName,
      enabled: true,
      systemId: "",
      systemIds: {},
      multiplier: 1,
      items: includedItems.map((item) => ({
        ...item,
        enabled: defaultSet.has(String(item.id)),
      })),
      customItems: [],
      selectedFinancePlan: String(firstPlanId),
    }
  })
}
