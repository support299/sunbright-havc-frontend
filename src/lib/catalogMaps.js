/** Map Django API product to proposal-tool catalog shape (PDF) */
export function mapProduct(p) {
  return {
    id: String(p.id),
    brand: p.brand,
    type: p.system_type,
    model: p.model,
    size: p.size,
    seer2: String(p.seer2),
    warranty: p.warranty,
    basePrice: Number(p.base_price),
    image: p.image_url || "",
  }
}

/** Map Django financing plan to PDF-style plan */
export function mapFinancePlan(p) {
  return {
    id: String(p.id),
    vendor: p.vendor,
    name: p.name,
    type: p.plan_type,
    apr: Number(p.apr),
    term: p.term,
    dealerFee: Number(p.dealer_fee),
    fico: p.fico,
    tags: Array.isArray(p.tags) ? p.tags : [],
    metadata: p.metadata || {},
  }
}

export function mapIncludedItem(i) {
  return {
    id: String(i.id),
    name: i.name,
    cost: Number(i.cost),
    category: i.category,
  }
}
