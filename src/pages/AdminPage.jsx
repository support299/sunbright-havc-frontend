import { useEffect, useMemo, useState } from "react"
import {
  useGetFinanceLinksQuery,
  useGetFinancePlansQuery,
  useGetIncludedItemsQuery,
  useGetProductsQuery,
  useGetAppSettingsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useCreateIncludedItemMutation,
  useUpdateIncludedItemMutation,
  useDeleteIncludedItemMutation,
  useCreateFinanceLinkMutation,
  useUpdateFinanceLinkMutation,
  useDeleteFinanceLinkMutation,
  useCreateFinancePlanMutation,
  useUpdateFinancePlanMutation,
  useDeleteFinancePlanMutation,
  useUpdateAppSettingMutation,
} from "../features/dashboard/dashboardApi"

const SYSTEM_TYPES = ["Central AC", "Heat Pump", "Mini Split", "Furnace", "Package Unit"]
const ITEM_CATEGORIES = [
  { value: "cogs", label: "COGS" },
  { value: "addon", label: "Add-on" },
]

const TABS = [
  { id: "catalog", label: "Catalog" },
  { id: "items", label: "Included Items" },
  { id: "tiers", label: "Tier Defaults" },
  { id: "links", label: "Finance Links" },
  { id: "plans", label: "Finance Plans" },
]

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" role="presentation">
      <div
        className="card max-h-[90vh] w-full max-w-lg overflow-auto p-6 shadow-2xl"
        role="dialog"
        aria-labelledby="modal-title"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h4 id="modal-title" className="font-['Outfit'] text-lg font-semibold">
            {title}
          </h4>
          <button
            type="button"
            className="rounded-lg px-3 py-1 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--accent)]"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [tab, setTab] = useState("catalog")

  const { data: products = [], isLoading: lp } = useGetProductsQuery()
  const { data: items = [], isLoading: li } = useGetIncludedItemsQuery()
  const { data: plans = [], isLoading: lpns } = useGetFinancePlansQuery()
  const { data: links = [], isLoading: ll } = useGetFinanceLinksQuery()
  const { data: settings = [], isLoading: ls } = useGetAppSettingsQuery()

  const [createProduct] = useCreateProductMutation()
  const [updateProduct] = useUpdateProductMutation()
  const [deleteProduct] = useDeleteProductMutation()
  const [createItem] = useCreateIncludedItemMutation()
  const [updateItem] = useUpdateIncludedItemMutation()
  const [deleteItem] = useDeleteIncludedItemMutation()
  const [createLink] = useCreateFinanceLinkMutation()
  const [updateLink] = useUpdateFinanceLinkMutation()
  const [deleteLink] = useDeleteFinanceLinkMutation()
  const [createPlan] = useCreateFinancePlanMutation()
  const [updatePlan] = useUpdateFinancePlanMutation()
  const [deletePlan] = useDeleteFinancePlanMutation()
  const [updateSetting] = useUpdateAppSettingMutation()

  const proposalDefaultsRow = useMemo(() => settings.find((s) => s.key === "proposal_defaults"), [settings])

  const [tierDraft, setTierDraft] = useState(null)

  useEffect(() => {
    const v = proposalDefaultsRow?.value
    if (v && typeof v === "object") {
      setTierDraft({
        profit_margin_pct: v.profit_margin_pct ?? 40,
        tier_names: Array.isArray(v.tier_names) ? [...v.tier_names] : ["Essential", "Select", "Premier", "Ultimate"],
        tier_default_item_ids: typeof v.tier_default_item_ids === "object" && v.tier_default_item_ids !== null ? { ...v.tier_default_item_ids } : {},
      })
    }
  }, [proposalDefaultsRow?.id, proposalDefaultsRow?.updated_at])

  const loading = lp || li || lpns || ll || ls

  const persistTierDefaults = async () => {
    if (!proposalDefaultsRow || !tierDraft) return
    await updateSetting({
      id: proposalDefaultsRow.id,
      body: {
        key: "proposal_defaults",
        value: {
          profit_margin_pct: Number(tierDraft.profit_margin_pct) || 40,
          tier_names: tierDraft.tier_names.map((x) => String(x).trim() || "Tier"),
          tier_default_item_ids: tierDraft.tier_default_item_ids,
        },
      },
    }).unwrap()
    setSavedTiers(true)
    window.setTimeout(() => setSavedTiers(false), 2500)
  }

  const toggleDefaultItem = (tierName, itemId, on) => {
    setTierDraft((prev) => {
      if (!prev) return prev
      const ids = new Set(prev.tier_default_item_ids[tierName] || [])
      const idn = Number(itemId)
      if (on) ids.add(idn)
      else ids.delete(idn)
      return {
        ...prev,
        tier_default_item_ids: {
          ...prev.tier_default_item_ids,
          [tierName]: [...ids].sort((a, b) => a - b),
        },
      }
    })
  }

  const [productModal, setProductModal] = useState(null)
  const [itemModal, setItemModal] = useState(null)
  const [linkModal, setLinkModal] = useState(null)
  const [planModal, setPlanModal] = useState(null)
  const [savedTiers, setSavedTiers] = useState(false)

  const emptyProduct = () => ({
    brand: "",
    system_type: "Central AC",
    model: "",
    size: "",
    seer2: "16.0",
    warranty: "",
    base_price: "0",
    image_url: "",
    spec_sheet_url: "",
  })

  const emptyLink = () => ({
    vendor: "",
    label: "",
    url: "",
    description: "",
    sort_order: 0,
  })

  const emptyPlan = () => ({
    vendor: "",
    name: "",
    plan_type: "Reduced APR",
    apr: "0",
    term: 120,
    dealer_fee: "0",
    fico: "",
    tags: "",
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-['Outfit'] text-2xl font-bold">Admin Panel</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Database-backed catalog, tier defaults, and financing — parity with the PDF admin experience.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.id
                ? "border border-[color:var(--accent)_/_0.4] bg-[color:var(--accent)_/_0.12] text-[var(--accent)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">Loading…</p>
      ) : (
        <>
          {tab === "catalog" && (
            <section className="card overflow-hidden p-0">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
                <h3 className="font-['Outfit'] font-semibold">Systems ({products.length})</h3>
                <button
                  type="button"
                  className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#0f1117] hover:brightness-105"
                  onClick={() => setProductModal({ mode: "create", form: emptyProduct() })}
                >
                  + Add system
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    <tr>
                      <th className="px-5 py-3">Brand</th>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Model</th>
                      <th className="px-5 py-3">Size</th>
                      <th className="px-5 py-3">SEER2</th>
                      <th className="px-5 py-3 text-right">Base price</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-t border-[var(--border)] hover:bg-[color:white_/_0.02]">
                        <td className="px-5 py-3 font-semibold">{p.brand}</td>
                        <td className="px-5 py-3 text-[var(--text-secondary)]">{p.system_type}</td>
                        <td className="px-5 py-3 font-mono text-xs">{p.model}</td>
                        <td className="px-5 py-3">{p.size}</td>
                        <td className="px-5 py-3">{p.seer2}</td>
                        <td className="px-5 py-3 text-right font-semibold">
                          {Number(p.base_price).toLocaleString("en-US", { style: "currency", currency: "USD" })}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            type="button"
                            className="mr-2 text-xs text-[var(--accent)] hover:underline"
                            onClick={() =>
                              setProductModal({
                                mode: "edit",
                                id: p.id,
                                form: {
                                  brand: p.brand,
                                  system_type: p.system_type,
                                  model: p.model,
                                  size: p.size,
                                  seer2: String(p.seer2),
                                  warranty: p.warranty || "",
                                  base_price: String(p.base_price),
                                  image_url: p.image_url || "",
                                  spec_sheet_url: p.spec_sheet_url || "",
                                },
                              })
                            }
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="text-xs text-[var(--red)] hover:underline"
                            onClick={async () => {
                              if (!window.confirm("Delete this product?")) return
                              await deleteProduct(p.id).unwrap()
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab === "items" && (
            <section className="card overflow-hidden p-0">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
                <h3 className="font-['Outfit'] font-semibold">Included items ({items.length})</h3>
                <button
                  type="button"
                  className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#0f1117] hover:brightness-105"
                  onClick={() => setItemModal({ mode: "create", form: { name: "", cost: "0", category: "cogs" } })}
                >
                  + Add item
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    <tr>
                      <th className="px-5 py-3">Name</th>
                      <th className="px-5 py-3">Category</th>
                      <th className="px-5 py-3 text-right">Cost</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((i) => (
                      <tr key={i.id} className="border-t border-[var(--border)]">
                        <td className="px-5 py-3">{i.name}</td>
                        <td className="px-5 py-3 uppercase text-xs text-[var(--text-muted)]">{i.category}</td>
                        <td className="px-5 py-3 text-right font-medium">
                          {Number(i.cost).toLocaleString("en-US", { style: "currency", currency: "USD" })}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            type="button"
                            className="mr-2 text-xs text-[var(--accent)] hover:underline"
                            onClick={() =>
                              setItemModal({
                                mode: "edit",
                                id: i.id,
                                form: { name: i.name, cost: String(i.cost), category: i.category },
                              })
                            }
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="text-xs text-[var(--red)] hover:underline"
                            onClick={async () => {
                              if (!window.confirm("Delete this item?")) return
                              await deleteItem(i.id).unwrap()
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab === "tiers" && !proposalDefaultsRow && (
            <section className="card p-6">
              <p className="text-sm text-[var(--text-muted)]">
                No <code className="text-xs text-[var(--accent)]">proposal_defaults</code> app setting found. Run{" "}
                <code className="text-xs">python manage.py seed_sunbright</code>.
              </p>
            </section>
          )}

          {tab === "tiers" && proposalDefaultsRow && tierDraft && (
            <section className="card space-y-6 p-6">
              <div>
                <h3 className="font-['Outfit'] font-semibold">Tier defaults</h3>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Tier labels and default line items per tier feed <code className="text-[10px]">GET /catalog/reference/</code>.
                </p>
              </div>

              <label className="block max-w-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Default profit margin %
                </span>
                <input
                  type="number"
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
                  value={tierDraft.profit_margin_pct}
                  onChange={(e) => setTierDraft((d) => ({ ...d, profit_margin_pct: e.target.value }))}
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {tierDraft.tier_names.map((name, idx) => (
                  <label key={idx} className="block">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Tier {idx + 1}
                    </span>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
                      value={name}
                      onChange={(e) => {
                        const oldName = tierDraft.tier_names[idx]
                        const newName = e.target.value
                        const nextNames = [...tierDraft.tier_names]
                        nextNames[idx] = newName
                        const nextIds = { ...tierDraft.tier_default_item_ids }
                        if (oldName !== newName && nextIds[oldName]) {
                          nextIds[newName] = nextIds[oldName]
                          delete nextIds[oldName]
                        }
                        setTierDraft({ ...tierDraft, tier_names: nextNames, tier_default_item_ids: nextIds })
                      }}
                    />
                  </label>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      <th className="py-2 pr-3">Item</th>
                      {tierDraft.tier_names.map((tn) => (
                        <th key={tn} className="py-2 px-1 text-center">
                          {tn}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-t border-[var(--border)]">
                        <td className="py-2 pr-3 font-medium">
                          {item.name}
                          <span className="ml-2 text-[var(--text-muted)]">({item.category})</span>
                        </td>
                        {tierDraft.tier_names.map((tn) => (
                          <td key={`${tn}-${item.id}`} className="px-1 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={Boolean(tierDraft.tier_default_item_ids[tn]?.includes(item.id))}
                              onChange={(e) => toggleDefaultItem(tn, item.id, e.target.checked)}
                              className="accent-[var(--accent)]"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={persistTierDefaults}
                  className="rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[#0f1117] hover:brightness-105"
                >
                  Save tier defaults
                </button>
                {savedTiers && <span className="text-sm text-[var(--green)]">Saved. Reference data will refresh for new sessions.</span>}
              </div>
            </section>
          )}

          {tab === "links" && (
            <section className="card overflow-hidden p-0">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
                <h3 className="font-['Outfit'] font-semibold">Finance links ({links.length})</h3>
                <button
                  type="button"
                  className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#0f1117] hover:brightness-105"
                  onClick={() => setLinkModal({ mode: "create", form: emptyLink() })}
                >
                  + Add link
                </button>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {links.map((link) => (
                  <div key={link.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                    <div>
                      <p className="font-medium">{link.label}</p>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">{link.description}</p>
                      <p className="mt-1 font-mono text-[10px] text-[var(--text-muted)]">{link.url || "—"}</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        className="text-xs text-[var(--accent)] hover:underline"
                        onClick={() =>
                          setLinkModal({
                            mode: "edit",
                            id: link.id,
                            form: {
                              vendor: link.vendor,
                              label: link.label,
                              url: link.url || "",
                              description: link.description || "",
                              sort_order: link.sort_order ?? 0,
                            },
                          })
                        }
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-xs text-[var(--red)] hover:underline"
                        onClick={async () => {
                          if (!window.confirm("Delete this link?")) return
                          await deleteLink(link.id).unwrap()
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {tab === "plans" && (
            <section className="card overflow-hidden p-0">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
                <h3 className="font-['Outfit'] font-semibold">Financing plans ({plans.length})</h3>
                <button
                  type="button"
                  className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#0f1117] hover:brightness-105"
                  onClick={() => setPlanModal({ mode: "create", form: emptyPlan() })}
                >
                  + Add plan
                </button>
              </div>
              <div className="max-h-[560px] overflow-auto">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 z-[1] bg-[var(--bg-secondary)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    <tr>
                      <th className="px-4 py-3">Vendor</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">APR</th>
                      <th className="px-4 py-3">Term</th>
                      <th className="px-4 py-3 text-right">Dealer fee</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.map((plan) => (
                      <tr key={plan.id} className="border-t border-[var(--border)] hover:bg-[color:white_/_0.02]">
                        <td className="px-4 py-2 font-semibold">{plan.vendor}</td>
                        <td className="max-w-[200px] truncate px-4 py-2 text-[var(--text-secondary)]">{plan.name}</td>
                        <td className="px-4 py-2 text-xs">{plan.plan_type}</td>
                        <td className="px-4 py-2">{plan.apr}%</td>
                        <td className="px-4 py-2">{plan.term}</td>
                        <td className="px-4 py-2 text-right">{plan.dealer_fee}%</td>
                        <td className="px-4 py-2 text-right">
                          <button
                            type="button"
                            className="mr-2 text-xs text-[var(--accent)] hover:underline"
                            onClick={() =>
                              setPlanModal({
                                mode: "edit",
                                id: plan.id,
                                originalMetadata: plan.metadata && typeof plan.metadata === "object" ? plan.metadata : {},
                                form: {
                                  vendor: plan.vendor,
                                  name: plan.name,
                                  plan_type: plan.plan_type,
                                  apr: String(plan.apr),
                                  term: plan.term,
                                  dealer_fee: String(plan.dealer_fee),
                                  fico: plan.fico != null ? String(plan.fico) : "",
                                  tags: Array.isArray(plan.tags) ? plan.tags.join(", ") : "",
                                },
                              })
                            }
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="text-xs text-[var(--red)] hover:underline"
                            onClick={async () => {
                              if (!window.confirm("Delete this plan?")) return
                              await deletePlan(plan.id).unwrap()
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}

      {productModal && (
        <Modal title={productModal.mode === "create" ? "Add system" : "Edit system"} onClose={() => setProductModal(null)}>
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault()
              const f = productModal.form
              const body = {
                brand: f.brand,
                system_type: f.system_type,
                model: f.model,
                size: f.size,
                seer2: f.seer2,
                warranty: f.warranty,
                base_price: f.base_price,
                image_url: f.image_url || "",
                spec_sheet_url: f.spec_sheet_url || "",
              }
              if (productModal.mode === "create") await createProduct(body).unwrap()
              else await updateProduct({ id: productModal.id, body }).unwrap()
              setProductModal(null)
            }}
          >
            <Field label="Brand">
              <input
                required
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
                value={productModal.form.brand}
                onChange={(e) => setProductModal({ ...productModal, form: { ...productModal.form, brand: e.target.value } })}
              />
            </Field>
            <Field label="Type">
              <select
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
                value={productModal.form.system_type}
                onChange={(e) => setProductModal({ ...productModal, form: { ...productModal.form, system_type: e.target.value } })}
              >
                {SYSTEM_TYPES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Model">
              <input
                required
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
                value={productModal.form.model}
                onChange={(e) => setProductModal({ ...productModal, form: { ...productModal.form, model: e.target.value } })}
              />
            </Field>
            <Field label="Size">
              <input
                required
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
                value={productModal.form.size}
                onChange={(e) => setProductModal({ ...productModal, form: { ...productModal.form, size: e.target.value } })}
              />
            </Field>
            <Field label="SEER2">
              <input
                required
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
                value={productModal.form.seer2}
                onChange={(e) => setProductModal({ ...productModal, form: { ...productModal.form, seer2: e.target.value } })}
              />
            </Field>
            <Field label="Warranty">
              <input
                required
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
                value={productModal.form.warranty}
                onChange={(e) => setProductModal({ ...productModal, form: { ...productModal.form, warranty: e.target.value } })}
              />
            </Field>
            <Field label="Base price">
              <input
                required
                type="number"
                step="0.01"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
                value={productModal.form.base_price}
                onChange={(e) => setProductModal({ ...productModal, form: { ...productModal.form, base_price: e.target.value } })}
              />
            </Field>
            <Field label="Image URL (optional)">
              <input
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
                value={productModal.form.image_url}
                onChange={(e) => setProductModal({ ...productModal, form: { ...productModal.form, image_url: e.target.value } })}
              />
            </Field>
            <Field label="Spec sheet URL (optional)">
              <input
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
                value={productModal.form.spec_sheet_url}
                onChange={(e) => setProductModal({ ...productModal, form: { ...productModal.form, spec_sheet_url: e.target.value } })}
              />
            </Field>
            <button type="submit" className="mt-2 w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-semibold text-[#0f1117]">
              Save
            </button>
          </form>
        </Modal>
      )}

      {itemModal && (
        <Modal title={itemModal.mode === "create" ? "Add included item" : "Edit included item"} onClose={() => setItemModal(null)}>
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault()
              const f = itemModal.form
              const body = {
                name: f.name,
                cost: f.cost,
                category: f.category,
              }
              if (itemModal.mode === "create") await createItem(body).unwrap()
              else await updateItem({ id: itemModal.id, body }).unwrap()
              setItemModal(null)
            }}
          >
            <Field label="Name">
              <input
                required
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
                value={itemModal.form.name}
                onChange={(e) => setItemModal({ ...itemModal, form: { ...itemModal.form, name: e.target.value } })}
              />
            </Field>
            <Field label="Cost">
              <input
                required
                type="number"
                step="0.01"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
                value={itemModal.form.cost}
                onChange={(e) => setItemModal({ ...itemModal, form: { ...itemModal.form, cost: e.target.value } })}
              />
            </Field>
            <Field label="Category">
              <select
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
                value={itemModal.form.category}
                onChange={(e) => setItemModal({ ...itemModal, form: { ...itemModal.form, category: e.target.value } })}
              >
                {ITEM_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <button type="submit" className="mt-2 w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-semibold text-[#0f1117]">
              Save
            </button>
          </form>
        </Modal>
      )}

      {linkModal && (
        <Modal title={linkModal.mode === "create" ? "Add finance link" : "Edit finance link"} onClose={() => setLinkModal(null)}>
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault()
              const f = linkModal.form
              const body = {
                vendor: f.vendor,
                label: f.label,
                url: f.url || "",
                description: f.description || "",
                sort_order: Number(f.sort_order) || 0,
              }
              if (linkModal.mode === "create") await createLink(body).unwrap()
              else await updateLink({ id: linkModal.id, body }).unwrap()
              setLinkModal(null)
            }}
          >
            <Field label="Vendor">
              <input
                required
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
                value={linkModal.form.vendor}
                onChange={(e) => setLinkModal({ ...linkModal, form: { ...linkModal.form, vendor: e.target.value } })}
              />
            </Field>
            <Field label="Label">
              <input
                required
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
                value={linkModal.form.label}
                onChange={(e) => setLinkModal({ ...linkModal, form: { ...linkModal.form, label: e.target.value } })}
              />
            </Field>
            <Field label="URL">
              <input
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
                value={linkModal.form.url}
                onChange={(e) => setLinkModal({ ...linkModal, form: { ...linkModal.form, url: e.target.value } })}
              />
            </Field>
            <Field label="Description">
              <textarea
                className="min-h-[72px] w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
                value={linkModal.form.description}
                onChange={(e) => setLinkModal({ ...linkModal, form: { ...linkModal.form, description: e.target.value } })}
              />
            </Field>
            <Field label="Sort order">
              <input
                type="number"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
                value={linkModal.form.sort_order}
                onChange={(e) => setLinkModal({ ...linkModal, form: { ...linkModal.form, sort_order: e.target.value } })}
              />
            </Field>
            <button type="submit" className="mt-2 w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-semibold text-[#0f1117]">
              Save
            </button>
          </form>
        </Modal>
      )}

      {planModal && (
        <Modal title={planModal.mode === "create" ? "Add financing plan" : "Edit financing plan"} onClose={() => setPlanModal(null)}>
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault()
              const f = planModal.form
              const tags = f.tags
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
              const body = {
                vendor: f.vendor,
                name: f.name,
                plan_type: f.plan_type,
                apr: f.apr,
                term: Number(f.term),
                dealer_fee: f.dealer_fee,
                fico: f.fico === "" ? null : Number(f.fico),
                tags,
                metadata:
                  planModal.mode === "edit" && planModal.originalMetadata ? { ...planModal.originalMetadata } : {},
              }
              if (planModal.mode === "create") await createPlan(body).unwrap()
              else await updatePlan({ id: planModal.id, body }).unwrap()
              setPlanModal(null)
            }}
          >
            <Field label="Vendor">
              <input
                required
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
                value={planModal.form.vendor}
                onChange={(e) => setPlanModal({ ...planModal, form: { ...planModal.form, vendor: e.target.value } })}
              />
            </Field>
            <Field label="Name">
              <input
                required
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
                value={planModal.form.name}
                onChange={(e) => setPlanModal({ ...planModal, form: { ...planModal.form, name: e.target.value } })}
              />
            </Field>
            <Field label="Plan type">
              <input
                required
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
                value={planModal.form.plan_type}
                onChange={(e) => setPlanModal({ ...planModal, form: { ...planModal.form, plan_type: e.target.value } })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="APR %">
                <input
                  required
                  type="number"
                  step="0.01"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
                  value={planModal.form.apr}
                  onChange={(e) => setPlanModal({ ...planModal, form: { ...planModal.form, apr: e.target.value } })}
                />
              </Field>
              <Field label="Term (months)">
                <input
                  required
                  type="number"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
                  value={planModal.form.term}
                  onChange={(e) => setPlanModal({ ...planModal, form: { ...planModal.form, term: e.target.value } })}
                />
              </Field>
            </div>
            <Field label="Dealer fee %">
              <input
                required
                type="number"
                step="0.01"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
                value={planModal.form.dealer_fee}
                onChange={(e) => setPlanModal({ ...planModal, form: { ...planModal.form, dealer_fee: e.target.value } })}
              />
            </Field>
            <Field label="FICO floor (optional)">
              <input
                type="number"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
                value={planModal.form.fico}
                onChange={(e) => setPlanModal({ ...planModal, form: { ...planModal.form, fico: e.target.value } })}
              />
            </Field>
            <Field label="Tags (comma-separated)">
              <input
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
                placeholder="popular, promo"
                value={planModal.form.tags}
                onChange={(e) => setPlanModal({ ...planModal, form: { ...planModal.form, tags: e.target.value } })}
              />
            </Field>
            <button type="submit" className="mt-2 w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-semibold text-[#0f1117]">
              Save
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}
