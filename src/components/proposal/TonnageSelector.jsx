import { useMemo } from "react"
import { IconBack, IconTrash } from "./ProposalIcons"

function uid() {
  return "z-" + Math.random().toString(36).slice(2, 11)
}

export default function TonnageSelector({ catalog, proposal, onChange, onNext, onBack }) {
  const availableSizes = useMemo(() => {
    const sizes = [...new Set(catalog.map((s) => s.size))]
    sizes.sort((a, b) => parseFloat(a) - parseFloat(b))
    return sizes
  }, [catalog])

  const zones = proposal.zones || []

  const systemsForSize = (size) => catalog.filter((s) => s.size === size)

  const addZone = (size) => {
    const newZone = {
      id: uid(),
      label: zones.length === 0 ? "System 1" : `System ${zones.length + 1}`,
      tonnage: size,
    }
    const newZones = [...zones, newZone]
    const tiers = proposal.tiers.map((t) => ({
      ...t,
      systemId: zones.length === 0 ? "" : t.systemId,
      systemIds: { ...(t.systemIds || {}) },
    }))
    onChange({
      ...proposal,
      zones: newZones,
      selectedTonnage: newZones[0]?.tonnage || "",
      tiers,
    })
  }

  const removeZone = (zoneId) => {
    const newZones = zones.filter((z) => z.id !== zoneId)
    const removedIdx = zones.findIndex((z) => z.id === zoneId)
    const tiers = proposal.tiers.map((t) => {
      const newIds = { ...(t.systemIds || {}) }
      delete newIds[removedIdx]
      const reindexed = {}
      Object.keys(newIds).forEach((k) => {
        const ki = parseInt(k, 10)
        reindexed[ki > removedIdx ? ki - 1 : ki] = newIds[k]
      })
      return {
        ...t,
        systemIds: reindexed,
        systemId: newZones.length > 0 ? reindexed[0] || t.systemId : "",
      }
    })
    onChange({
      ...proposal,
      zones: newZones,
      selectedTonnage: newZones[0]?.tonnage || "",
      tiers,
    })
  }

  const isMultiZone = zones.length > 0

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--accent)]"
        >
          <IconBack /> Back
        </button>
        <div className="flex-1">
          <h2 className="font-['Outfit'] text-[22px] font-bold">Select System Size</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {isMultiZone
              ? "Multi-system proposal — add zones for each system needed"
              : "Choose the required tonnage for this job, or add multiple zones for multi-system homes"}
          </p>
        </div>
      </div>

      {zones.length > 0 && (
        <div className="card mb-6 p-0">
          <div className="border-b border-[var(--border)] px-6 py-4">
            <span className="font-['Outfit'] text-base font-semibold">Systems in this Proposal</span>
          </div>
          {zones.map((zone, i) => (
            <div
              key={zone.id}
              className={`flex items-center gap-3 px-6 py-3 ${i < zones.length - 1 ? "border-b border-[var(--border)]" : ""}`}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color:var(--accent)_/_0.12] text-sm font-bold text-[var(--accent)]">
                {i + 1}
              </div>
              <input
                className="max-w-[200px] rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-1.5 text-sm outline-none focus:border-[var(--accent)]"
                value={zone.label}
                onChange={(e) => {
                  const updated = [...zones]
                  updated[i] = { ...updated[i], label: e.target.value }
                  onChange({ ...proposal, zones: updated })
                }}
              />
              <span className="font-['Outfit'] text-base font-bold text-[var(--text-primary)]">{zone.tonnage}</span>
              <span className="text-xs text-[var(--text-muted)]">
                {systemsForSize(zone.tonnage).length} systems available
              </span>
              <div className="flex-1" />
              <button
                type="button"
                className="rounded p-2 text-[var(--red)] hover:bg-[color:var(--red)_/_0.1]"
                onClick={() => removeZone(zone.id)}
              >
                <IconTrash />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mb-3 text-sm font-semibold text-[var(--text-secondary)]">
        {zones.length === 0 ? "Select a system size:" : "Add another system:"}
      </div>

      <div className="mb-8 grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
        {availableSizes.map((size) => {
          const count = systemsForSize(size).length
          const isSelected = !isMultiZone && proposal.selectedTonnage === size
          return (
            <button
              type="button"
              key={size}
              onClick={() => addZone(size)}
              className={`rounded-2xl border-2 p-5 text-center transition-all ${
                isSelected
                  ? "border-[var(--accent)] bg-[color:var(--accent)_/_0.12]"
                  : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-light,_#282c3f)]"
              }`}
            >
              <div
                className={`font-['Outfit'] text-[28px] font-extrabold leading-none ${
                  isSelected ? "text-[var(--accent)]" : "text-[var(--text-primary)]"
                }`}
              >
                {size}
              </div>
              <div className="mt-1 text-xs text-[var(--text-muted)]">
                {count} system{count !== 1 ? "s" : ""}
              </div>
            </button>
          )
        })}
      </div>

      {zones.length > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onNext}
            className="rounded-xl bg-[var(--accent)] px-8 py-3 text-[15px] font-semibold text-[#0f1117] shadow-[0_2px_12px_rgba(245,183,49,0.25)] hover:brightness-105"
          >
            Continue to Proposal Builder →
          </button>
        </div>
      )}
    </div>
  )
}
