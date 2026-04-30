import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import CustomerPresentation from "../components/proposal/CustomerPresentation"
import ProposalEditor from "../components/proposal/ProposalEditor"
import TonnageSelector from "../components/proposal/TonnageSelector"
import {
  useGetCatalogReferenceQuery,
  useGetFinanceLinksQuery,
  useGetFinancePlansQuery,
  useGetIncludedItemsQuery,
  useGetProductsQuery,
  useGetProposalQuery,
  useUpdateProposalMutation,
} from "../features/dashboard/dashboardApi"
import { mapFinancePlan, mapProduct } from "../lib/catalogMaps"
import { buildInitialTiers } from "../lib/buildInitialTiers"
import { apiProposalToUi, uiProposalToApi } from "../lib/proposalMapper"

export default function ProposalEditPage() {
  const { proposalId } = useParams()
  const navigate = useNavigate()
  const initRef = useRef(false)

  const { data: apiProposal, isLoading: loadingProposal, isError } = useGetProposalQuery(proposalId)
  const { data: products = [], isLoading: loadingProducts } = useGetProductsQuery()
  const { data: includedItems = [], isLoading: loadingItems } = useGetIncludedItemsQuery()
  const { data: plansRaw = [], isLoading: loadingPlans } = useGetFinancePlansQuery()
  const { data: financeLinks = [] } = useGetFinanceLinksQuery()
  const { data: reference, isLoading: loadingReference, isError: referenceError } = useGetCatalogReferenceQuery()
  const [updateProposal] = useUpdateProposalMutation()

  const [local, setLocal] = useState(null)
  const [view, setView] = useState("tonnage")

  const catalog = useMemo(() => products.map(mapProduct), [products])
  const financingPlans = useMemo(() => plansRaw.map(mapFinancePlan), [plansRaw])

  const profitMargin = reference?.default_profit_margin_pct ?? 40
  const tierDefaultItemIds = reference?.tier_default_item_ids ?? {}
  const coolingCities = reference?.cooling_cities ?? []
  const utilityProviders = reference?.utility_providers ?? []

  useEffect(() => {
    initRef.current = false
    setLocal(null)
    setView("tonnage")
  }, [proposalId])

  useEffect(() => {
    if (!apiProposal || initRef.current) return
    if (loadingItems || loadingPlans || loadingReference) return
    if (!includedItems.length) return
    if (!plansRaw.length) return
    if (!reference?.tier_names?.length) return

    initRef.current = true
    let ui = apiProposalToUi(apiProposal)
    if (!ui.tiers?.length) {
      const built = buildInitialTiers(
        includedItems,
        tierDefaultItemIds,
        String(plansRaw[0].id),
        reference.tier_names,
      )
      ui = { ...ui, tiers: built }
    }
    setLocal(ui)
    const goBuilder = (ui.zones?.length ?? 0) > 0
    setView(goBuilder ? "builder" : "tonnage")
  }, [
    apiProposal,
    includedItems,
    loadingItems,
    loadingPlans,
    loadingReference,
    plansRaw,
    reference,
    tierDefaultItemIds,
  ])

  const persist = async (ui) => {
    await updateProposal({ id: proposalId, body: uiProposalToApi(ui) }).unwrap()
  }

  const handleSaveDraft = async () => {
    if (!local) return
    await persist(local)
    navigate("/app/proposals")
  }

  const handlePreview = async () => {
    if (!local) return
    await persist(local)
    setView("preview")
  }

  const loading =
    loadingProposal ||
    loadingProducts ||
    loadingItems ||
    loadingPlans ||
    loadingReference ||
    (!!apiProposal && !local && !isError)

  if (isError) {
    return (
      <div className="p-8 text-center text-[var(--red)]">
        Proposal not found. <Link className="text-[var(--accent)] underline" to="/app/proposals">Back</Link>
      </div>
    )
  }

  if (referenceError) {
    return (
      <div className="p-8 text-center text-[var(--red)]">
        Could not load catalog reference (cities, utilities, tier config). Check the API and your session.
        <div className="mt-4">
          <Link to="/app/proposals" className="text-[var(--accent)] underline">
            Back
          </Link>
        </div>
      </div>
    )
  }

  if (!loadingReference && reference && (!coolingCities.length || !utilityProviders.length)) {
    return (
      <div className="p-8 text-center text-[var(--text-muted)]">
        Cooling cities or utility providers are missing. Add them in Django Admin (catalog → Cooling cities / Utility providers)
        or run{" "}
        <code className="rounded bg-[var(--bg-secondary)] px-1 text-xs">python manage.py seed_sunbright</code>.
        <div className="mt-4">
          <Link to="/app/proposals" className="text-[var(--accent)] underline">
            Back
          </Link>
        </div>
      </div>
    )
  }

  if (!loadingReference && reference && !reference.tier_names?.length) {
    return (
      <div className="p-8 text-center text-[var(--text-muted)]">
        Tier names are not configured. Set <code className="text-xs">proposal_defaults</code> in Admin / Django (key{" "}
        <code className="text-xs">tier_names</code>).
        <div className="mt-4">
          <Link to="/app/proposals" className="text-[var(--accent)] underline">
            Back
          </Link>
        </div>
      </div>
    )
  }

  if (!loadingProducts && !products.length) {
    return (
      <div className="p-8 text-center text-[var(--text-muted)]">
        No HVAC systems in the catalog. Add products under Admin or run{" "}
        <code className="rounded bg-[var(--bg-secondary)] px-1 text-xs">seed_sunbright</code>.
        <div className="mt-4">
          <Link to="/app/admin" className="text-[var(--accent)] underline">
            Admin
          </Link>
        </div>
      </div>
    )
  }

  if (!plansRaw.length && !loadingPlans) {
    return (
      <div className="p-8 text-center text-[var(--text-muted)]">
        No financing plans in the database. Run backend seed or add plans in Django admin.
        <div className="mt-4">
          <Link to="/app/proposals" className="text-[var(--accent)] underline">
            Back to proposals
          </Link>
        </div>
      </div>
    )
  }

  if (loading || !local) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] text-sm text-[var(--text-muted)]">
        Loading proposal…
      </div>
    )
  }

  if (view === "preview") {
    return (
      <CustomerPresentation
        proposal={local}
        catalog={catalog}
        financingPlans={financingPlans}
        profitMargin={profitMargin}
        financeLinks={financeLinks}
        coolingCities={coolingCities}
        utilityProviders={utilityProviders}
        onBack={() => setView("builder")}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-secondary)] px-6 py-3">
        <Link to="/app/proposals" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)]">
          ← Proposals
        </Link>
        <span className="font-['Outfit'] text-lg font-bold">Sunbright HVAC</span>
        <span className="w-16" />
      </header>

      <div className="mx-auto max-w-[1400px] px-6 py-8">
        {view === "tonnage" && (
          <TonnageSelector
            catalog={catalog}
            proposal={local}
            onChange={setLocal}
            onNext={() => setView("builder")}
            onBack={() => navigate("/app/proposals")}
          />
        )}
        {view === "builder" && (
          <ProposalEditor
            proposal={local}
            catalog={catalog}
            financingPlans={financingPlans}
            profitMargin={profitMargin}
            coolingCities={coolingCities}
            utilityProviders={utilityProviders}
            onChange={setLocal}
            onSave={handleSaveDraft}
            onPreview={handlePreview}
            onBack={() => navigate("/app/proposals")}
            onChangeTonnage={() => setView("tonnage")}
          />
        )}
      </div>
    </div>
  )
}
